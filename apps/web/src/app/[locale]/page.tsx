import { unwrap } from '@repo/api-client'
import { Container } from '@repo/ui/components/container'
import { EmptyState } from '@repo/ui/components/empty-state'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { VillageCard } from '@/components/village-card'
import { Link } from '@/i18n/navigation'
import { api } from '@/lib/api'

export const revalidate = 300

async function getVillages() {
  try {
    const res = await api.v1.villages.$get({ query: { page: '1', pageSize: '6' } })
    return (await unwrap(res)).data
  } catch {
    // API down during build or locally: render the empty state instead of failing.
    return []
  }
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const [t, villages] = await Promise.all([getTranslations('home'), getVillages()])

  return (
    <>
      <section className="from-accent/10 bg-gradient-to-b to-transparent py-16 sm:py-24">
        <Container className="flex flex-col gap-6">
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">
            {t('heroTitle')}
          </h1>
          <p className="text-muted max-w-2xl text-base sm:text-lg">{t('heroSubtitle')}</p>
          <div>
            <Link
              href="/explore"
              className="bg-accent text-accent-foreground inline-flex h-11 items-center rounded-full px-6 text-sm font-semibold"
            >
              {t('heroCta')}
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-12">
        <Container className="flex flex-col gap-6">
          <h2 className="text-xl font-semibold">{t('villagesTitle')}</h2>
          {villages.length === 0 ? (
            <EmptyState
              title={t('villagesEmptyTitle')}
              description={t('villagesEmptyDescription')}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {villages.map((v) => (
                <VillageCard
                  key={v.id}
                  slug={v.slug}
                  name={v.name}
                  regionName={v.regionName}
                  businessLabel={t('businessCount', { count: v.businessCount })}
                />
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  )
}
