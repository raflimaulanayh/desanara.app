'use client'

import Form from 'next/form'
import { useTranslations } from 'next-intl'
import { SearchInput, SearchInputGroup } from './search-form'

export function VillageDirectorySearch({
  action,
  query,
  region,
  view,
}: {
  action: string
  query: string
  region?: string
  view?: 'map'
}) {
  const t = useTranslations('village')
  return (
    <Form action={action} role="search" className="min-w-0 flex-[1_1_12rem] sm:max-w-lg">
      {region ? <input type="hidden" name="region" value={region} /> : null}
      {view ? <input type="hidden" name="view" value={view} /> : null}
      <SearchInputGroup>
        <SearchInput key={query} name="q" defaultValue={query} placeholder={t('directorySearch')} />
      </SearchInputGroup>
    </Form>
  )
}
