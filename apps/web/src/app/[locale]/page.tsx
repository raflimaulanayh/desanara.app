import { Container } from '@repo/ui/components/container'
import { ArrowRight, BadgeCheck, GraduationCap, HandCoins } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ProductGrid } from '@/components/product-card'
import { LogoVertical } from '@/components/brand/logo'
import { VillageScene } from '@/components/home/village-scene'
import { VillageCard } from '@/components/village-card'
import { Link } from '@/i18n/navigation'
import { getCategories, getVillages, searchProducts } from '@/lib/data'
import { pick } from '@/lib/localize'

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
      <section className="bg-wash overflow-hidden">
        <Container className="grid items-center pt-5 pb-2 md:grid-cols-[1.1fr_1fr] md:gap-10 md:py-14 lg:gap-14">
          <LogoVertical width={150} className="mx-auto md:hidden" />
          <div className="-mx-4 mt-1 md:col-start-2 md:row-start-1 md:mx-0 md:mt-0 md:[mask-image:linear-gradient(to_right,transparent,#000_14%,#000_86%,transparent)]">
            <VillageScene className="text-wash" />
          </div>
          <div className="mt-2 text-center md:col-start-1 md:row-start-1 md:mt-0 md:text-left">
            <h1 className="text-accent text-[clamp(1.875rem,7.5vw,2.5rem)] leading-[1.1] font-extrabold tracking-[-0.02em] text-balance lg:text-[3.25rem]">
              {t('heroTitle')}
            </h1>
            <p className="text-muted mx-auto mt-3 max-w-[40ch] text-base text-pretty sm:text-lg md:mx-0">
              {t('heroSubtitle')}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center md:justify-start">
              <Link
                href="/jelajah"
                className="bg-accent text-accent-foreground focus-visible:outline-accent inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 font-bold whitespace-nowrap transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {t('heroExplore')}
                <ArrowRight className="size-5" aria-hidden />
              </Link>
              <Link
                href="/tentang#gabung"
                className="border-line-strong bg-surface hover:border-accent hover:text-accent focus-visible:outline-accent inline-flex h-12 items-center justify-center rounded-full border px-7 font-bold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {t('heroJoin')}
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {categories.length > 0 ? (
        <section className="pt-8">
          <Container>
            <h2 className="sr-only">{t('categoriesTitle')}</h2>
            <ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
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
          </Container>
        </section>
      ) : null}

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
