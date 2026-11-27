'use client'

import {
  Autocomplete,
  Button,
  Form,
  Label,
  ListBox,
  SearchField,
  Select,
  Sheet,
  useFilter,
} from '@heroui/react'
import { SlidersHorizontal } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { ALL_FILTER_OPTIONS } from '@/lib/explore-filters'

type FilterOption = { id: string; label: string; region?: string }
type FilterField = {
  name: 'region' | 'village' | 'category' | 'sort'
  label: string
  value: string
  options: FilterOption[]
  all?: string
  searchLabel?: string
}

const filterTrigger = 'h-9 min-h-9 items-center rounded-(--radius-compact) px-3 py-0'
const filterLabel = 'text-sm leading-5 font-semibold'

export function ExploreFilters({
  action,
  activeCount,
  fields,
  hidden,
}: {
  action: string
  activeCount: number
  fields: FilterField[]
  hidden: Record<string, string | undefined>
}) {
  const t = useTranslations('explore')
  const [region, setRegion] = useState(
    fields.find((field) => field.name === 'region')?.value ?? hidden.region,
  )
  const regionScope = region === ALL_FILTER_OPTIONS ? undefined : region
  const villageField = fields.find((field) => field.name === 'village')
  const [village, setVillage] = useState(villageField?.value)

  return (
    <Sheet placement="bottom">
      <Sheet.Trigger>
        <Button
          size="sm"
          variant="secondary"
          aria-haspopup="dialog"
          aria-label={activeCount ? t('filtersActive', { count: activeCount }) : undefined}
          className="h-10 min-h-10 rounded-full px-4 text-xs font-semibold sm:text-[0.8125rem]"
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          {t('filters')}
          {activeCount > 0 ? (
            <span
              aria-hidden
              className="bg-accent/12 text-accent grid size-5 place-items-center rounded-full text-xs"
            >
              {activeCount}
            </span>
          ) : null}
        </Button>
      </Sheet.Trigger>
      <Sheet.Backdrop variant="opaque">
        <Sheet.Content className="rounded-t-(--radius)">
          <Sheet.Dialog className="rounded-t-(--radius)">
            <Sheet.Handle aria-hidden className="pt-2.5 pb-1" />
            <Sheet.Header className="border-line border-b px-4 pt-1 pb-2.5">
              <div className="relative mx-auto flex min-h-8 w-full max-w-lg items-center">
                <Sheet.Heading className="pr-9 text-base font-bold">{t('filters')}</Sheet.Heading>
                <Sheet.CloseTrigger
                  aria-label={t('filtersClose')}
                  autoFocus
                  className="top-0 right-0 size-8"
                />
              </div>
            </Sheet.Header>
            <Form action={action} method="get" className="flex min-h-0 flex-col gap-0">
              {Object.entries(hidden).map(([name, value]) =>
                value ? <input key={name} type="hidden" name={name} value={value} /> : null,
              )}
              <Sheet.Body className="px-4 py-4">
                <div className="mx-auto flex w-full max-w-lg flex-col gap-3">
                  {fields.map((field) => {
                    if (field.name === 'sort') {
                      return (
                        <Select
                          key={field.name}
                          name={field.name}
                          defaultValue={field.value}
                          variant="secondary"
                          fullWidth
                        >
                          <Label className={filterLabel}>{field.label}</Label>
                          <Select.Trigger className={filterTrigger}>
                            <Select.Value className="truncate text-sm leading-5" />
                            <Select.Indicator className="size-3.5" />
                          </Select.Trigger>
                          <Select.Popover className="rounded-(--radius)">
                            <ListBox>{field.options.map(renderOption)}</ListBox>
                          </Select.Popover>
                        </Select>
                      )
                    }
                    if (field.name === 'region') {
                      return (
                        <SearchableFilter
                          key={field.name}
                          field={field}
                          value={region}
                          onChange={(next) => {
                            setRegion(next)
                            const selected = villageField?.options.find(({ id }) => id === village)
                            if (next !== ALL_FILTER_OPTIONS && selected?.region !== next) {
                              setVillage(ALL_FILTER_OPTIONS)
                            }
                          }}
                        />
                      )
                    }
                    if (field.name === 'village') {
                      const options = field.options.filter(
                        (option) => !regionScope || option.region === regionScope,
                      )
                      return (
                        <SearchableFilter
                          key={field.name}
                          field={field}
                          value={
                            options.some(({ id }) => id === village) ? village : ALL_FILTER_OPTIONS
                          }
                          options={options}
                          onChange={setVillage}
                        />
                      )
                    }
                    return <SearchableFilter key={field.name} field={field} />
                  })}
                </div>
              </Sheet.Body>
              <Sheet.Footer className="border-line border-t px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="mx-auto min-h-10 w-full max-w-lg rounded-full"
                >
                  {t('apply')}
                </Button>
              </Sheet.Footer>
            </Form>
          </Sheet.Dialog>
        </Sheet.Content>
      </Sheet.Backdrop>
    </Sheet>
  )
}

function renderOption({ id, label }: FilterOption) {
  return (
    <ListBox.Item key={id} id={id} textValue={label} className="min-h-9 text-sm leading-5">
      {label}
      <ListBox.ItemIndicator />
    </ListBox.Item>
  )
}

function SearchableFilter({
  field,
  options = field.options,
  value,
  onChange,
}: {
  field: FilterField
  options?: FilterOption[]
  value?: string
  onChange?: (value: string) => void
}) {
  const t = useTranslations('explore')
  const { contains } = useFilter({ sensitivity: 'base' })
  const selection = value ?? field.value
  return (
    <Autocomplete
      name={field.name}
      defaultValue={onChange ? undefined : selection}
      value={onChange ? selection : undefined}
      onChange={onChange && ((key) => onChange(key == null ? ALL_FILTER_OPTIONS : String(key)))}
      variant="secondary"
      fullWidth
    >
      <Label className={filterLabel}>{field.label}</Label>
      <Autocomplete.Trigger className={filterTrigger}>
        <Autocomplete.Value className="truncate text-sm leading-5" />
        <Autocomplete.Indicator className="size-3.5 shrink-0" />
      </Autocomplete.Trigger>
      <Autocomplete.Popover className="rounded-(--radius)">
        <Autocomplete.Filter filter={contains}>
          <SearchField
            aria-label={field.searchLabel}
            variant="secondary"
            fullWidth
            className="px-2 pb-1"
          >
            <SearchField.Group className="rounded-(--radius-compact)">
              <SearchField.SearchIcon />
              <SearchField.Input
                autoComplete="off"
                placeholder={field.searchLabel}
                className="text-base placeholder:text-sm sm:text-sm"
              />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <ListBox
            className="max-h-48 overflow-y-auto"
            renderEmptyState={() => (
              <p className="text-muted px-3 py-2 text-sm">{t('noFilterOptions')}</p>
            )}
          >
            {field.all ? renderOption({ id: ALL_FILTER_OPTIONS, label: field.all }) : null}
            {options.map(renderOption)}
          </ListBox>
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  )
}
