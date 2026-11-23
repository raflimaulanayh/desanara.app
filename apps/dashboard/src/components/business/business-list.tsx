'use client'

import { Button, SearchField, Tabs } from '@heroui/react'
import { can } from '@repo/auth/permissions'
import { Container } from '@repo/ui/components/container'
import { EmptyState } from '@repo/ui/components/empty-state'
import { ChevronRight, Package, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useDeferredValue, useState } from 'react'
import { describeApiError } from '@/lib/api-errors'
import { type BusinessFilters, useBusinessList } from '@/lib/businesses'
import { canReview } from '@/lib/nav'
import { useSession } from '@/lib/session'
import { StatusChips } from './status-chips'

type Tab = 'all' | 'published' | 'draft' | 'pending' | 'rejected'

const TAB_FILTER: Record<Tab, BusinessFilters> = {
  all: {},
  published: { status: 'published' },
  draft: { status: 'draft' },
  pending: { verificationStatus: 'pending' },
  rejected: { verificationStatus: 'rejected' },
}

export function BusinessList() {
  const t = useTranslations()
  const { actor, memberships } = useSession()
  const [tab, setTab] = useState<Tab>('all')
  const [q, setQ] = useState('')
  const query = useDeferredValue(q.trim())
  const list = useBusinessList({ ...TAB_FILTER[tab], q: query || undefined })
  const rows = list.data?.pages.flatMap((p) => p.data) ?? []
  const total = list.data?.pages[0]?.meta.total

  const canCreate =
    actor.globalRole === 'super_admin' ||
    memberships.villages.some((v) =>
      can(actor, 'business.create', { type: 'village', villageId: v.id }),
    )
  const tabs: Tab[] = canReview(actor)
    ? ['all', 'pending', 'published', 'draft', 'rejected']
    : ['all', 'published', 'draft', 'rejected']
  const showVillage = actor.globalRole === 'super_admin' || memberships.villages.length > 1

  return (
    <Container className="flex flex-col gap-4 py-6 sm:py-10">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold sm:text-3xl">{t('businessList.title')}</h1>
        {canCreate ? (
          <Link
            href="/businesses/new"
            className="bg-accent text-accent-foreground hover:bg-accent-hover inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-bold"
          >
            <Plus className="size-4" aria-hidden />
            {t('businessList.add')}
          </Link>
        ) : null}
      </div>

      <SearchField
        value={q}
        onChange={setQ}
        aria-label={t('businessList.search')}
        className="w-full"
      >
        <SearchField.Group className="h-12">
          <SearchField.SearchIcon />
          <SearchField.Input placeholder={t('businessList.search')} className="text-base" />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>

      <Tabs
        selectedKey={tab}
        onSelectionChange={(key) => {
          const selected = tabs.find((item) => item === key)
          if (selected) setTab(selected)
        }}
      >
        <Tabs.ListContainer className="no-scrollbar -mx-4 overflow-x-auto px-4">
          <Tabs.List aria-label={t('businessList.filter')} className="w-max gap-1 rounded-full">
            {tabs.map((item) => (
              <Tabs.Tab key={item} id={item} className="min-h-8 rounded-full px-3 py-1 text-xs">
                {t(`businessList.tabs.${item}`)}
                <Tabs.Indicator className="rounded-full" />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>
        <Tabs.Panel id={tab} className="flex flex-col gap-4 pt-4">
          {total !== undefined ? (
            <p className="text-muted text-sm" aria-live="polite">
              {t('businessList.count', { count: total })}
            </p>
          ) : null}

          {list.isError ? (
            <div className="flex flex-col items-start gap-3">
              <p role="alert" className="text-sm">
                {describeApiError(list.error, t).message}
              </p>
              <Button variant="secondary" onPress={() => list.refetch()}>
                {t('common.retry')}
              </Button>
            </div>
          ) : list.isPending ? (
            <ul className="flex flex-col gap-2" aria-hidden>
              {[0, 1, 2].map((i) => (
                <li key={i} className="bg-wash h-20 animate-pulse rounded-2xl" />
              ))}
            </ul>
          ) : rows.length === 0 ? (
            <EmptyState
              title={query ? t('businessList.emptySearch') : t('businessList.empty')}
              description={canCreate && !query ? t('businessList.emptyHint') : undefined}
            />
          ) : (
            <ul className="border-line divide-line bg-surface divide-y overflow-hidden rounded-2xl border">
              {rows.map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/businesses/${b.id}`}
                    className="hover:bg-wash flex items-center gap-3 p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{b.name}</p>
                      <p className="text-muted mt-0.5 flex items-center gap-1 text-xs">
                        {showVillage ? `${b.village.name} · ` : ''}
                        <Package className="size-3.5" aria-hidden />
                        {t('businessList.products', { count: b.productCount })}
                      </p>
                      <div className="mt-2">
                        <StatusChips b={b} />
                      </div>
                    </div>
                    <ChevronRight className="text-muted size-5 shrink-0" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {list.hasNextPage ? (
            <Button
              variant="secondary"
              className="self-center"
              isPending={list.isFetchingNextPage}
              onPress={() => list.fetchNextPage()}
            >
              {t('businessList.more')}
            </Button>
          ) : null}
        </Tabs.Panel>
      </Tabs>
    </Container>
  )
}
