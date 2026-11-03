import { Container } from '@repo/ui/components/container'
import { ArrowRight, BadgeCheck, GraduationCap, HandCoins } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ProductGrid } from '@/components/product-card'
import { SearchForm } from '@/components/search-form'
import { VillageCard } from '@/components/village-card'
import { Link } from '@/i18n/navigation'
import { getCategories, getVillages, searchProducts } from '@/lib/data'
import { pick } from '@/lib/localize'
import { localePath } from '@/lib/paths'

export const revalidate = 300

const TRUST = [
  ['verified', BadgeCheck],
  ['direct', HandCoins],
  ['mentored', GraduationCap],
] as const

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const [t, villages, latest, categories] = await Promise.all([
    getTranslations('home'),
    getVillages(),
    searchProducts({ sort: 'newest', pageSize: 8 }),
    getCategories(),
  ])

  return (
    <>
      <section className="bg-wash">
        <Container className="py-10 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-[clamp(2rem,6.5vw,3.5rem)] leading-[1.08] font-extrabold tracking-tight text-balance">
              {t('heroTitle')}
            </h1>
            <p className="text-muted mx-auto mt-4 max-w-[56ch] text-base text-pretty sm:text-lg">
              {t('heroSubtitle')}
            </p>
            <SearchForm
              size="lg"
              className="mx-auto mt-7 max-w-xl max-md:hidden"
              action={localePath(locale, '/jelajah')}
              placeholder={t('searchPlaceholder')}
            />
          </div>
          {categories.length > 0 ? (
            <div className="mx-auto mt-8 max-w-3xl">
              <h2 className="sr-only">{t('categoriesTitle')}</h2>
              <ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
                {categories.map((c) => (
                  <li key={c.slug} className="shrink-0">
                    <Link
                      href={`/jelajah?category=${c.slug}`}
                      className="border-line-strong bg-surface hover:border-accent hover:text-accent inline-flex h-11 items-center rounded-full border px-4 text-sm font-semibold transition-colors"
                    >
                      {pick(locale, c.name, c.nameEn)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Container>
      </section>

      <section className="pt-12">
        <Container>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                {t('villagesTitle')}
              </h2>
              <p className="text-muted mt-1 text-sm sm:text-base">{t('villagesAside')}</p>
            </div>
          </div>
          {villages.length === 0 ? (
            <p className="text-muted mt-6">{t('villagesEmpty')}</p>
          ) : (
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {villages.slice(0, 6).map((v) => (
                <li key={v.id}>
                  <VillageCard village={v} />
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>

      <section className="pt-14">
        <Container>
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {t('latestTitle')}
            </h2>
            <Link
              href="/jelajah"
              className="text-accent inline-flex h-11 items-center gap-1.5 text-sm font-bold hover:underline"
            >
              {t('seeAll')}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="mt-6">
            {latest.data.length === 0 ? (
              <p className="text-muted">{t('latestEmpty')}</p>
            ) : (
              <ProductGrid products={latest.data} />
            )}
          </div>
        </Container>
      </section>

      <section className="pt-16">
        <Container>
          <ul className="bg-wash grid gap-6 rounded-3xl p-6 sm:p-8 md:grid-cols-3">
            {TRUST.map(([k, Icon]) => (
              <li key={k} className="flex gap-4">
                <span className="bg-accent-soft text-accent-soft-foreground grid size-11 shrink-0 place-items-center rounded-full">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div>
                  <h3 className="font-bold">{t(`trust.${k}.title`)}</h3>
                  <p className="text-muted mt-1 text-sm leading-relaxed">{t(`trust.${k}.body`)}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="pt-14">
        <Container>
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t('howTitle')}</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {(['1', '2', '3'] as const).map((n) => (
              <li key={n} className="border-line rounded-(--radius) border p-5">
                <span className="bg-accent text-accent-foreground grid size-8 place-items-center rounded-full text-sm font-bold">
                  {n}
                </span>
                <p className="mt-3 font-bold">{t(`how.${n}.title`)}</p>
                <p className="text-muted mt-1 text-sm leading-relaxed">{t(`how.${n}.body`)}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>
    </>
  )
}
