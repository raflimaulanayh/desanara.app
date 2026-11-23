'use client'

import { Button, Form, Label, ListBox, Select, Sheet } from '@heroui/react'
import { SlidersHorizontal } from 'lucide-react'
import { useTranslations } from 'next-intl'

type FilterField = {
  name: string
  label: string
  value: string
  options: { id: string; label: string }[]
}

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

  return (
    <Sheet placement="bottom">
      <Sheet.Trigger>
        <Button
          size="sm"
          variant="secondary"
          aria-haspopup="dialog"
          aria-label={activeCount ? t('filtersActive', { count: activeCount }) : undefined}
          className="min-h-9 rounded-full px-3 text-xs font-semibold"
        >
          <SlidersHorizontal className="size-3.5" aria-hidden />
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
        <Sheet.Content>
          <Sheet.Dialog>
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
                  {fields.map(({ name, label, value, options }) => (
                    <Select
                      key={name}
                      name={name}
                      defaultValue={value}
                      variant="secondary"
                      fullWidth
                    >
                      <Label className="text-sm font-semibold">{label}</Label>
                      <Select.Trigger className="min-h-9 rounded-lg py-1.5">
                        <Select.Value className="truncate text-sm" />
                        <Select.Indicator className="size-3.5" />
                      </Select.Trigger>
                      <Select.Popover className="rounded-xl">
                        <ListBox>
                          {options.map((option) => (
                            <ListBox.Item
                              key={option.id}
                              id={option.id}
                              textValue={option.label}
                              className="min-h-9 text-sm"
                            >
                              {option.label}
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  ))}
                </div>
              </Sheet.Body>
              <Sheet.Footer className="border-line border-t px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="mx-auto min-h-10 w-full max-w-lg rounded-lg"
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
