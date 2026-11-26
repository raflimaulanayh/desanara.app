'use client'

import { Button, Chip, SearchField } from '@heroui/react'
import { can } from '@repo/auth/permissions'
import { Container } from '@repo/ui/components/container'
import { EmptyState } from '@repo/ui/components/empty-state'
import { StatusMascot } from '@repo/ui/components/status-mascot'
import { LoadMore, QueryFeedback } from '@/components/query-feedback'
import { VillageRowsSkeleton, villageRowLayout } from '@/components/dashboard-skeletons'
import { readableData } from '@/lib/api-errors'
import { ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSession } from '@/lib/session'
import { useDebouncedValue } from '@/lib/use-debounced-value'
import { useVillageList } from '@/lib/villages'

/**
 * "Pengaturan desa": villages whose settings this person may change. A village admin of a single
 * village goes straight to it; a super admin searches every village, drafts included.
 */
export function VillageList() {
  const t = useTranslations()
  const router = useRouter()
  const { actor } = useSession()
  const superAdmin = can(actor, 'village.create', { type: 'platform' })
  const [search, setSearch] = useState('')
  const q = useDebouncedValue(search.trim())
  const list = useVillageList(q)
  const villages = (readableData(list)?.pages.flatMap((p) => p.data) ?? []).filter(
    (v) => v.permissions.update,
  )

  const only = !superAdmin && list.isSuccess && villages.length === 1 ? villages[0]!.id : null
  useEffect(() => {
    if (only) router.replace(`/villages/${only}`)
  }, [only, router])

  return (
    <Container className="flex max-w-2xl flex-col gap-4 py-6 sm:py-10">
      <h1 className="text-2xl font-extrabold sm:text-3xl">{t('nav.villageSettings')}</h1>
      {superAdmin ? (
        <SearchField value={search} onChange={setSearch} aria-label={t('villageSettings.search')}>
          <SearchField.Group className="h-12">
            <SearchField.SearchIcon />
            <SearchField.Input placeholder={t('villageSettings.search')} className="text-base" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
      ) : null}
      {only ? (
        <p role="status" className="text-sm">
          {t('common.loading')}
        </p>
      ) : (
        <QueryFeedback query={list} loading={<VillageRowsSkeleton />} />
      )}
      {list.isSuccess && !only && villages.length === 0 ? (
        <EmptyState
          title={q ? t('villageSettings.noMatch') : t('villageSettings.none')}
          illustration={<StatusMascot pose="empty" />}
          action={
            q ? (
              <Button
                className="min-h-11 rounded-full px-4 font-semibold"
                onPress={() => setSearch('')}
              >
                {t('states.clearFilters')}
              </Button>
            ) : undefined
          }
        />
      ) : null}
      {!only ? (
        <ul className="flex flex-col">
          {villages.map((v) => (
            <li key={v.id} className="border-line border-b last:border-0">
              <Link href={`/villages/${v.id}`} className={`${villageRowLayout} hover:bg-wash`}>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{v.name}</span>
                  <span className="text-muted block truncate text-xs">
                    {v.regionFullName ?? t('villageSettings.noRegion')}
                  </span>
                </span>
                {v.status !== 'published' ? (
                  <Chip size="sm" variant="soft">
                    {t('businessStatus.draft')}
                  </Chip>
                ) : null}
                <ChevronRight className="text-muted size-4 shrink-0" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      {only ? null : <LoadMore query={list} label={t('businessList.more')} />}
    </Container>
  )
}
