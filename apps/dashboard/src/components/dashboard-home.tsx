'use client'

import { Card, Chip, Skeleton } from '@heroui/react'
import { unwrap } from '@repo/api-client'
import { can } from '@repo/auth/permissions'
import { Container } from '@repo/ui/components/container'
import { EmptyState } from '@repo/ui/components/empty-state'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useSession } from '@/lib/session'
import { greetingName } from '@/lib/greeting'

/** Number of businesses matching a filter, from the list's `meta.total` (one row fetched). */
function useBusinessCount(filter: { villageId?: string; verificationStatus?: 'pending' }) {
  return useQuery({
    queryKey: ['businesses', 'count', filter],
    queryFn: async () =>
      (await unwrap(await api.v1.manage.businesses.$get({ query: { ...filter, pageSize: '1' } })))
        .meta.total,
  })
}

function Stat({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div className="bg-wash rounded-xl p-3">
      <p className="text-muted text-xs font-semibold">{label}</p>
      {value === undefined ? (
        <Skeleton className="mt-1 h-7 w-10 rounded-md" />
      ) : (
        <p className="text-2xl font-extrabold tabular-nums">{value}</p>
      )}
    </div>
  )
}

function VillageCard({ id, name, role }: { id?: string; name: string; role: string }) {
  const t = useTranslations()
  const { actor } = useSession()
  const reviewer = id
    ? can(actor, 'business.verify', { type: 'village', villageId: id })
    : actor.globalRole === 'super_admin'
  const total = useBusinessCount(id ? { villageId: id } : {})
  const pending = useBusinessCount(
    id ? { villageId: id, verificationStatus: 'pending' } : { verificationStatus: 'pending' },
  )
  return (
    <Card>
      <Card.Header className="flex-row items-start justify-between gap-3">
        <Card.Title className="text-lg font-bold">{name}</Card.Title>
        <Chip size="sm">{role}</Chip>
      </Card.Header>
      <Card.Content className="grid grid-cols-2 gap-3">
        <Stat label={t('home.businessCount')} value={total.data} />
        {reviewer ? <Stat label={t('home.pendingCount')} value={pending.data} /> : null}
      </Card.Content>
    </Card>
  )
}

export function DashboardHome() {
  const t = useTranslations()
  const { user, actor, memberships } = useSession()
  const firstName = greetingName(user.name)
  const noRoles =
    !actor.globalRole && memberships.villages.length === 0 && memberships.businesses.length === 0

  return (
    <Container className="flex flex-col gap-6 py-6 sm:py-10">
      <h1 className="text-2xl font-extrabold sm:text-3xl">
        {t('dashboard.welcome', { name: firstName })}
      </h1>

      {noRoles ? (
        <EmptyState title={t('home.noRolesTitle')} description={t('dashboard.noRoles')} />
      ) : null}

      {actor.globalRole === 'super_admin' || memberships.villages.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-muted text-sm font-bold tracking-wide uppercase">
            {t('home.villages')}
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {actor.globalRole === 'super_admin' ? (
              <VillageCard name={t('home.allVillages')} role={t('roles.super_admin')} />
            ) : null}
            {memberships.villages.map((v) => (
              <VillageCard key={v.id} id={v.id} name={v.name} role={t(`roles.${v.role}`)} />
            ))}
          </div>
        </section>
      ) : null}

      {memberships.businesses.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-muted text-sm font-bold tracking-wide uppercase">
            {t('home.businesses')}
          </h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {memberships.businesses.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/businesses/${b.id}`}
                  className="border-line bg-surface hover:bg-wash flex items-center justify-between gap-3 rounded-2xl border p-4"
                >
                  <span className="font-bold">{b.name}</span>
                  <Chip size="sm">{t(`roles.${b.role}`)}</Chip>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </Container>
  )
}
