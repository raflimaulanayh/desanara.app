'use client'

import { Button, Form, InputGroup } from '@heroui/react'
import { cn } from '@repo/ui/cn'
import { Search } from 'lucide-react'
import { useTranslations } from 'next-intl'

/** Plain GET form: works before JavaScript loads and on the slowest phones. */
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
  return (
    <Form action={action} method="get" role="search" className={cn('min-w-0', className)}>
      {Object.entries(hidden ?? {}).map(([k, v]) =>
        v ? <input key={k} type="hidden" name={k} value={v} /> : null,
      )}
      <InputGroup fullWidth variant="secondary" className="h-10 rounded-full">
        <InputGroup.Prefix className="text-muted border-0 pr-2">
          <Search className="size-4 shrink-0" aria-hidden />
        </InputGroup.Prefix>
        <InputGroup.Input
          type="search"
          aria-label={t('searchLabel')}
          name="q"
          defaultValue={defaultValue}
          placeholder={placeholder}
          enterKeyHint="search"
          autoComplete="off"
          maxLength={100}
          className="min-w-0 py-1 text-base placeholder:text-sm sm:text-sm"
        />
        <InputGroup.Suffix className="border-0 px-1">
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="text-accent h-8 min-h-0 rounded-full px-3 font-bold"
          >
            {t('searchSubmit')}
          </Button>
        </InputGroup.Suffix>
      </InputGroup>
    </Form>
  )
}
