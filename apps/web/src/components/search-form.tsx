'use client'

import { Button, ComboBox, Form, InputGroup, ListBox } from '@heroui/react'
import { cn } from '@repo/ui/cn'
import { ArrowUpRight, Search, Store } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useContext, useEffect, useState, type ComponentProps } from 'react'
import { ButtonContext } from 'react-aria-components/Button'
import { ComboBoxStateContext } from 'react-aria-components/ComboBox'
import type { SearchSuggestion } from '@/app/api/search-suggestions/route'
import { ProductPhoto } from './product-photo'

function canSuggest(query: string) {
  return query.trim().length >= 2 && /[\p{L}\p{N}]/u.test(query)
}

function SuggestionInput({
  onQueryChange,
  ...props
}: ComponentProps<typeof InputGroup.Input> & { onQueryChange: (query: string) => void }) {
  const comboBox = useContext(ComboBoxStateContext)
  return (
    <InputGroup.Input
      {...props}
      onChange={(event) => {
        onQueryChange(event.target.value)
        // Open while the request is pending, before React Aria has any options to show.
        if (canSuggest(event.target.value)) comboBox?.open(null, 'input')
        else if (comboBox?.isOpen) comboBox.close()
      }}
      onKeyDownCapture={(event) => {
        if (
          (event.key === 'ArrowDown' || event.key === 'ArrowUp') &&
          !canSuggest(event.currentTarget.value)
        ) {
          event.stopPropagation()
          return
        }

        if (
          event.key === 'Enter' &&
          !event.nativeEvent.isComposing &&
          comboBox?.isOpen &&
          comboBox.selectionManager.focusedKey == null
        ) {
          event.preventDefault()
          comboBox.close()
          event.currentTarget.form?.requestSubmit()
        }
      }}
    />
  )
}

/** Suggestions link to catalogue entries, while free text still submits with GET. */
export function SearchForm({
  action,
  defaultValue,
  placeholder,
  hidden,
  className,
}: {
  action: string
  defaultValue?: string
  placeholder: string
  hidden?: Record<string, string | undefined>
  className?: string
}) {
  const t = useTranslations('home')
  const locale = useLocale()
  const [input, setInput] = useState(defaultValue ?? '')
  const [response, setResponse] = useState<{ url: string; items: SearchSuggestion[] }>()
  const scope = new URLSearchParams({ locale, q: input.trim() })
  for (const key of ['category', 'region', 'village']) {
    const value = hidden?.[key]
    if (value) scope.set(key, value)
  }
  const hasQuery = canSuggest(input)
  const url = hasQuery ? `/api/search-suggestions?${scope}` : ''
  const items = response?.url === url ? response.items : []

  useEffect(() => {
    if (!url) return

    const controller = new AbortController()
    const timeout = setTimeout(async () => {
      let items: SearchSuggestion[] = []
      try {
        const result = await fetch(url, { signal: controller.signal })
        if (result.ok) {
          const { data }: { data: SearchSuggestion[] } = await result.json()
          items = data
        }
      } catch {
        // Search submission remains available if suggestions fail to load.
      }
      if (!controller.signal.aborted) setResponse({ url, items })
    }, 200)

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [url])

  return (
    <Form action={action} method="get" role="search" className={cn('min-w-0', className)}>
      {Object.entries(hidden ?? {}).map(([k, v]) =>
        v ? <input key={k} type="hidden" name={k} value={v} /> : null,
      )}
      <ComboBox
        allowsCustomValue
        allowsEmptyCollection={hasQuery}
        fullWidth
        name="q"
        aria-label={placeholder}
        inputValue={input}
        menuTrigger="manual"
        items={items}
        onInputChange={setInput}
      >
        <InputGroup fullWidth variant="secondary" className="h-10 rounded-full">
          <InputGroup.Prefix className="text-muted border-0 pr-2">
            <Search className="size-4 shrink-0" aria-hidden />
          </InputGroup.Prefix>
          <SuggestionInput
            type="search"
            onQueryChange={setInput}
            aria-label={placeholder}
            placeholder={placeholder}
            enterKeyHint="search"
            autoComplete="off"
            maxLength={100}
            className="min-w-0 py-1 text-base placeholder:text-sm sm:text-sm"
          />
          <InputGroup.Suffix className="border-0 px-1">
            {/* The search submit button sits in the group without becoming the combobox trigger. */}
            <ButtonContext.Provider value={null}>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="text-accent h-8 min-h-0 rounded-full px-3 font-bold"
              >
                {t('searchSubmit')}
              </Button>
            </ButtonContext.Provider>
          </InputGroup.Suffix>
        </InputGroup>
        <ComboBox.Popover
          placement="bottom start"
          className="border-line bg-surface w-(--trigger-width) min-w-0 rounded-(--radius) border p-1 shadow-lg"
        >
          <ListBox
            aria-label={t('searchSuggestions')}
            items={items}
            className="max-h-[min(22rem,50dvh)] overflow-y-auto"
            renderEmptyState={() => (
              <p role="status" className="text-muted px-3 py-2 text-sm">
                {t(response?.url === url ? 'searchSuggestionsEmpty' : 'searchSuggestionsLoading')}
              </p>
            )}
          >
            {(item) => (
              <ListBox.Item
                id={item.id}
                href={item.href}
                textValue={item.name}
                className="hover:bg-wash data-[focused]:bg-wash flex items-center gap-2.5 rounded-lg px-2 py-1.5"
              >
                {item.kind === 'product' ? (
                  <ProductPhoto
                    src={item.image}
                    alt=""
                    category={item.category}
                    className="size-9 shrink-0 rounded-lg"
                    sizes="36px"
                  />
                ) : (
                  <span className="bg-accent-soft text-accent grid size-9 shrink-0 place-items-center rounded-lg">
                    <Store className="size-4" aria-hidden />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{item.name}</span>
                  <span className="text-muted block truncate text-xs">
                    {item.kind === 'business'
                      ? t('searchSuggestionBusiness', { village: item.detail })
                      : item.detail}
                  </span>
                </span>
                <ArrowUpRight className="text-muted mr-1 size-3.5 shrink-0" aria-hidden />
              </ListBox.Item>
            )}
          </ListBox>
        </ComboBox.Popover>
      </ComboBox>
    </Form>
  )
}
