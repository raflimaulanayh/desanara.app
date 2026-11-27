import { Container } from '@repo/ui/components/container'
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  FileCheck2,
  HandCoins,
  LockKeyhole,
  MapPin,
  Radio,
  Store,
} from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { CSSProperties } from 'react'
import { AboutFaq } from '@/components/about/about-faq'
import {
  ABOUT_STATS,
  BAROS,
  DEMO_ORDER,
  HERO_PRODUCTS,
  HIMASIF_INSTAGRAM,
  OTHER_VILLAGES,
  REGENCY_DOT,
} from '@/components/about/about-facts'
import { AboutMotion } from '@/components/about/about-motion'
import { AboutSplash } from '@/components/about/about-splash'
import { AboutSun } from '@/components/about/about-sun'
import { HeroStrip } from '@/components/about/hero-strip'
import { OrderSimulator } from '@/components/about/order-simulator'
import { ProblemVisual } from '@/components/about/problem-visual'
import { RoleTabs } from '@/components/about/role-tabs'
import { VillageRibbon } from '@/components/about/village-ribbon'
import { BrandMark } from '@/components/brand-mark'
import { LogoMark } from '@/components/brand/logo'
import { InstagramIcon } from '@/components/instagram-icon'
import { VillageLogo } from '@/components/village-logo'
import { Link } from '@/i18n/navigation'
import { mediaUrl } from '@/lib/media'
import { localePath } from '@/lib/paths'
import { pageAlternates, siteUrl } from '@/lib/site-url'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })
  return {
    title: t('title'),
    description: t('metaDescription'),
    alternates: pageAlternates('/tentang', locale),
  }
}

/** Orders the hero items as they rise in behind the splash (globals.css, `[data-hero-item]`). */
const order = (i: number) => ({ '--i': i }) as CSSProperties

/**
 * About Desanara (PLAN-about-page): splash, hero, the problem, a try-it order, roles, trust, the first
 * village, the journey, the makers, questions, and the way in for buyers and sellers.
 */
export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('about')
  const en = locale === 'en'
  const [titleLead, titleRest] = t('hero.title').split(/(?<=,)\s+/)
  const [problemLead, problemRest] = t('problem.title').split(/(?<=\.)\s+/)
  const demoImage = mediaUrl(DEMO_ORDER.imageKey)

  return (
    <>
      <AboutSplash skipLabel={t('splash.skip')} />

      <AboutMotion>
        {/* 1. Hero: the tagline over a sunrise, with the villages' work as the horizon. */}
        <section
          data-hero
          className="bg-surface border-line relative isolate overflow-hidden border-b"
        >
          <Container className="relative pt-12 text-center sm:pt-16 lg:pt-20">
            <h1
              data-hero-item
              style={order(0)}
              className="mx-auto text-[2.625rem] leading-[1.02] tracking-[-0.03em] text-balance sm:text-6xl lg:text-[5rem]"
            >
              <span className="block font-semibold">{titleLead}</span>
              <span className="text-accent block font-normal">{titleRest}</span>
            </h1>
            <p
              data-hero-item
              style={order(1)}
              className="text-foreground/80 mx-auto mt-6 max-w-[50ch] text-lg leading-relaxed text-pretty sm:text-[1.1875rem]"
            >
              {t('hero.lead')}
            </p>
            <div
              data-hero-item
              style={order(2)}
              className="mt-8 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-center sm:gap-7"
            >
              <Link
                href="/jelajah"
                className="bg-accent text-accent-foreground inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 font-semibold whitespace-nowrap transition-[background-color,transform] hover:-translate-y-px hover:bg-[var(--accent-hover)]"
              >
                {t('hero.buyer')}
                <ArrowRight className="size-5" aria-hidden />
              </Link>
              <a
                href="#gabung"
                className="text-foreground hover:text-accent decoration-foreground/30 hover:decoration-accent inline-flex min-h-12 items-center justify-center gap-1.5 font-semibold whitespace-nowrap underline decoration-2 underline-offset-[6px] transition-colors"
              >
                {t('hero.seller')}
              </a>
            </div>
            <p
              data-hero-item
              style={order(3)}
              className="text-foreground/70 mx-auto mt-6 max-w-[44ch] text-sm leading-relaxed text-pretty sm:text-base"
            >
              {t.rich('hero.facts', {
                businesses: ABOUT_STATS.businesses,
                villages: ABOUT_STATS.villages,
                biz: (chunks) => (
                  <span
                    data-count={ABOUT_STATS.businesses}
                    className="text-foreground font-semibold tabular-nums"
                  >
                    {chunks}
                  </span>
                ),
                vil: (chunks) => (
                  <span
                    data-count={ABOUT_STATS.villages}
                    className="text-foreground font-semibold tabular-nums"
                  >
                    {chunks}
                  </span>
                ),
              })}
            </p>
          </Container>
          <div data-hero-item style={order(4)} className="relative mt-12 pb-24 sm:mt-16 sm:pb-28">
            {/* The sun rises from behind the row of products, whatever the height of the text above. Its
                horizon sits behind the photos and fades out, so it never reaches the next section. */}
            <AboutSun className="about-sun-mask absolute bottom-[calc(100%-5rem)] left-1/2 -z-10 w-[190vw] max-w-none -translate-x-1/2 sm:w-[64rem] lg:w-[80rem]" />
            <HeroStrip />
          </div>
        </section>

        {/* 2. The problem, told through one product: hidden, scattered, not ready, then found. On desktop the
            visual stays put and changes with each step (about-motion.tsx, data-story). */}
        <section className="py-16 sm:py-24">
          <Container>
            <div
              data-story
              className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-16 xl:gap-20"
            >
              <div>
                <h2
                  data-reveal
                  className="max-w-[18ch] text-[2.125rem] leading-[1.08] tracking-[-0.03em] text-balance sm:text-5xl lg:text-[3.25rem]"
                >
                  <span className="block font-semibold">{problemLead}</span>
                  <span className="text-accent mt-1 block font-normal">{problemRest}</span>
                </h2>
                <ol className="mt-10 flex flex-col gap-12 lg:mt-4 lg:gap-0">
                  {(['hidden', 'scattered', 'unready'] as const).map((key, i) => (
                    <li
                      key={key}
                      data-story-step
                      className="about-story-step lg:flex lg:min-h-[36vh] lg:flex-col lg:justify-center"
                    >
                      <ProblemVisual state={i as 0 | 1 | 2} className="mb-6 lg:hidden" />
                      <p className="text-accent text-[1.75rem] leading-tight font-medium tracking-[-0.02em] sm:text-4xl">
                        {t(`problem.items.${key}.word`)}
                      </p>
                      <p className="text-foreground/80 mt-3 max-w-[40ch] text-lg leading-relaxed text-pretty sm:text-xl">
                        {t(`problem.items.${key}.body`)}
                      </p>
                    </li>
                  ))}
                  <li
                    data-story-step
                    className="about-story-step lg:flex lg:min-h-[44vh] lg:flex-col lg:justify-center"
                  >
                    <ProblemVisual state={3} className="mb-6 lg:hidden" />
                    <LogoMark size={40} />
                    <p
                      data-step
                      className="mt-5 max-w-[34ch] text-[1.375rem] leading-snug tracking-[-0.01em] text-pretty sm:text-[1.75rem]"
                    >
                      {t.rich('problem.answer', {
                        hl: (chunks) => <span className="about-mark font-semibold">{chunks}</span>,
                      })}
                    </p>
                  </li>
                </ol>
              </div>
              <div className="hidden lg:block">
                <div className="sticky top-[max(7rem,calc(50vh-15rem))]">
                  <ProblemVisual state={3} sticky />
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* 3. Try ordering */}
        <section className="bg-forest relative overflow-hidden py-16 text-white sm:py-24">
          <Container>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
              <h2
                data-reveal
                className="text-[2.125rem] leading-[1.08] tracking-[-0.03em] text-balance sm:text-5xl lg:text-[3.25rem]"
              >
                <span className="block font-semibold">{t('order.titleLead')}</span>
                <span className="mt-1 block font-normal text-[#b4e076]">
                  {t('order.titleRest')}
                </span>
              </h2>
              <div data-reveal className="text-white/80">
                <p className="max-w-[46ch] text-lg leading-relaxed text-pretty">
                  {t('order.lead')}
                </p>
                {t('order.languageNote') ? (
                  <p className="mt-2 text-sm text-white/65">{t('order.languageNote')}</p>
                ) : null}
              </div>
            </div>
            <div data-reveal className="mt-10 sm:mt-14">
              <OrderSimulator
                product={{
                  name: DEMO_ORDER.name,
                  displayName: en ? DEMO_ORDER.nameEn : DEMO_ORDER.name,
                  price: DEMO_ORDER.price,
                  businessName: DEMO_ORDER.businessName,
                  villageName: DEMO_ORDER.villageName,
                }}
                productUrl={`${siteUrl()}${localePath(locale, `/produk/${DEMO_ORDER.slug}`)}`}
                imageUrl={demoImage}
              />
            </div>
            <div className="mt-12 flex flex-col gap-5 border-t border-white/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-[52ch] leading-relaxed text-white/75">{t('order.after')}</p>
              <Link
                href="/jelajah"
                className="text-forest hover:bg-sprout inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-7 font-semibold whitespace-nowrap transition-colors"
              >
                {t('order.cta')}
                <ArrowRight className="size-5" aria-hidden />
              </Link>
            </div>
          </Container>
        </section>

        {/* 4. Roles */}
        <section className="border-line border-b py-16 sm:py-24">
          <Container>
            <h2
              data-reveal
              className="text-[2.125rem] leading-[1.08] tracking-[-0.03em] text-balance sm:text-5xl lg:text-[3.25rem]"
            >
              <span className="font-semibold">{t('roles.titleLead')}</span>{' '}
              <span className="text-accent font-normal">{t('roles.titleRest')}</span>
            </h2>
            <p
              data-reveal
              className="text-foreground/75 mt-4 max-w-[52ch] text-lg leading-relaxed text-pretty"
            >
              {t('roles.lead')}
            </p>
            <div data-reveal className="mt-8 sm:mt-10">
              <RoleTabs
                product={{
                  name: en ? DEMO_ORDER.nameEn : DEMO_ORDER.name,
                  businessName: DEMO_ORDER.businessName,
                  villageName: DEMO_ORDER.villageName,
                  price: DEMO_ORDER.price,
                  imageUrl: demoImage,
                }}
              />
            </div>
          </Container>
        </section>

        {/* 5. Trust: the statuses a business moves through, then what Desanara protects. */}
        <section className="py-16 sm:py-24">
          <Container>
            <h2
              data-reveal
              className="max-w-[20ch] text-[2.125rem] leading-[1.08] tracking-[-0.03em] text-balance sm:text-5xl lg:text-[3.25rem]"
            >
              <span className="block font-semibold">{t('trust.titleLead')}</span>
              <span className="text-accent mt-1 block font-normal">{t('trust.titleRest')}</span>
            </h2>
            <p
              data-reveal
              className="text-foreground/75 mt-4 max-w-[52ch] text-lg leading-relaxed text-pretty"
            >
              {t('trust.lead')}
            </p>

            <ol data-sequence className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8 lg:mt-16">
              {(
                [
                  [
                    'submitted',
                    Clock3,
                    'bg-[color-mix(in_oklab,var(--warning)_12%,white)] text-[color-mix(in_oklab,var(--warning)_85%,black)]',
                  ],
                  ['checked', BadgeCheck, 'bg-accent-soft text-accent-soft-foreground'],
                  [
                    'live',
                    Radio,
                    'bg-[color-mix(in_oklab,var(--success)_12%,white)] text-[color-mix(in_oklab,var(--success)_85%,black)]',
                  ],
                ] as const
              ).map(([key, Icon, tone], i) => (
                <li
                  key={key}
                  data-step
                  data-progress-scope
                  className="relative flex gap-4 md:flex-col md:gap-5"
                >
                  {i < 2 ? (
                    <span
                      aria-hidden
                      className="bg-line-strong absolute top-10 -bottom-10 left-5 w-0.5 -translate-x-1/2 md:top-5 md:right-[-2rem] md:bottom-auto md:left-10 md:h-0.5 md:w-auto md:translate-x-0 md:-translate-y-1/2"
                    >
                      <span
                        data-progress="y"
                        className="bg-accent absolute inset-0 origin-top md:hidden"
                      />
                      <span
                        data-progress="x"
                        className="bg-accent absolute inset-0 hidden origin-left md:block"
                      />
                    </span>
                  ) : null}
                  <span className="about-step-dot bg-accent text-accent-foreground relative z-10 grid size-10 shrink-0 place-items-center rounded-full font-semibold tabular-nums">
                    {i + 1}
                  </span>
                  <div className="pt-1.5 md:pt-0">
                    <h3 className="text-xl font-semibold tracking-[-0.01em]">
                      {t(`trust.steps.${key}.title`)}
                    </h3>
                    <p className="text-foreground/75 mt-2 max-w-[36ch] leading-relaxed">
                      {t(`trust.steps.${key}.body`)}
                    </p>
                    <span
                      className={`mt-4 inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold ${tone}`}
                    >
                      <Icon className="size-3.5" aria-hidden />
                      {t(`trust.steps.${key}.status`)}
                    </span>
                  </div>
                </li>
              ))}
            </ol>

            <div className="bg-wash/50 border-line mt-16 rounded-(--radius) border p-6 sm:mt-20 sm:p-10 lg:p-12">
              <h3 className="text-2xl font-semibold tracking-[-0.02em]">
                {t('trust.promisesTitle')}
              </h3>
              <dl
                data-stagger
                className="divide-line mt-6 grid divide-y sm:mt-8 sm:grid-cols-2 sm:divide-y-0"
              >
                {(
                  [
                    ['address', LockKeyhole],
                    ['schedule', Clock3],
                    ['commission', HandCoins],
                    ['consent', FileCheck2],
                  ] as const
                ).map(([key, Icon], i) => (
                  <div
                    key={key}
                    className={`flex gap-4 py-6 sm:p-6 ${i % 2 === 0 ? 'sm:border-r sm:pl-0' : 'sm:pr-0'} ${i < 2 ? 'sm:border-b sm:pt-0' : 'sm:pb-0'} border-line`}
                  >
                    <Icon className="text-accent mt-0.5 size-5 shrink-0" aria-hidden />
                    <div>
                      <dt className="text-lg font-semibold">{t(`trust.promises.${key}.title`)}</dt>
                      <dd className="text-foreground/75 mt-1.5 leading-relaxed">
                        {t(`trust.promises.${key}.body`)}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>
          </Container>
        </section>

        {/* 6. Desa Baros: the first village, its photo and crest, its work, then the other villages. */}
        <section className="border-line border-t py-16 sm:py-24">
          <Container>
            <div className="grid gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
              <div data-reveal className="relative pb-10 lg:pb-0">
                <div className="relative aspect-[4/3] overflow-hidden rounded-(--radius) lg:aspect-[5/6]">
                  <Image
                    src={mediaUrl(BAROS.bannerKey) ?? ''}
                    alt={t('baros.photoAlt')}
                    fill
                    sizes="(min-width: 1024px) 34rem, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="bg-surface border-line absolute bottom-0 left-4 flex max-w-[calc(100%-2rem)] items-center gap-3 rounded-(--radius) border p-3 pr-5 shadow-sm sm:left-6 lg:-right-8 lg:bottom-8 lg:left-auto">
                  <VillageLogo
                    name="Desa Baros"
                    logoUrl={mediaUrl(BAROS.logoKey)}
                    crestLabel={t('baros.crestLabel')}
                    accent="#0e7490"
                    size={52}
                  />
                  <div className="min-w-0">
                    <p className="font-semibold">Desa Baros</p>
                    <p className="text-muted truncate text-xs">{t('baros.place')}</p>
                    <p className="text-accent mt-1 text-sm font-semibold">
                      {t.rich('baros.recordedLine', {
                        count: BAROS.recordedBusinesses,
                        n: (chunks) => <span data-count={BAROS.recordedBusinesses}>{chunks}</span>,
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h2
                  data-reveal
                  className="text-[2.125rem] leading-[1.08] tracking-[-0.03em] text-balance sm:text-5xl lg:text-[3.25rem]"
                >
                  <span className="block font-semibold">{t('baros.titleLead')}</span>
                  <span className="text-accent mt-1 block font-normal">{t('baros.titleRest')}</span>
                </h2>
                <p className="text-foreground/80 mt-5 max-w-[48ch] text-lg leading-relaxed text-pretty">
                  {t('baros.body')}
                </p>
                <p className="text-muted mt-8 text-sm font-semibold">
                  {t('baros.commoditiesLabel')}
                </p>
                <ul aria-label={t('baros.commoditiesLabel')} className="mt-3 flex flex-wrap gap-2">
                  {(['ubi', 'hanjeli', 'kopi', 'jagung', 'jamur'] as const).map((key) => (
                    <li
                      key={key}
                      className="bg-wash/60 border-line inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold"
                    >
                      {t(`baros.commodities.${key}`)}
                    </li>
                  ))}
                </ul>
                <p
                  data-step
                  className="mt-8 max-w-[44ch] text-xl leading-snug tracking-[-0.01em] text-pretty sm:text-[1.375rem]"
                >
                  {t.rich('baros.direction', {
                    hl: (chunks) => <span className="about-mark font-semibold">{chunks}</span>,
                  })}
                </p>
                <Link
                  href={`/desa/${BAROS.slug}`}
                  className="bg-accent text-accent-foreground mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 font-semibold whitespace-nowrap transition-colors hover:bg-[var(--accent-hover)]"
                >
                  {t('baros.visit')}
                  <ArrowRight className="size-5" aria-hidden />
                </Link>
              </div>
            </div>

            <div className="mt-16 sm:mt-24">
              <p className="text-foreground/75 mb-4 text-lg text-pretty">
                {t.rich('baros.others', {
                  count: OTHER_VILLAGES.length,
                  bandung: (chunks) => (
                    <span className="text-foreground inline-flex items-center gap-1.5 font-semibold whitespace-nowrap">
                      <span
                        aria-hidden
                        className={`size-2.5 rounded-full ${REGENCY_DOT.bandung}`}
                      />
                      {chunks}
                    </span>
                  ),
                  garut: (chunks) => (
                    <span className="text-foreground inline-flex items-center gap-1.5 font-semibold whitespace-nowrap">
                      <span aria-hidden className={`size-2.5 rounded-full ${REGENCY_DOT.garut}`} />
                      {chunks}
                    </span>
                  ),
                  sumedang: (chunks) => (
                    <span className="text-foreground inline-flex items-center gap-1.5 font-semibold whitespace-nowrap">
                      <span
                        aria-hidden
                        className={`size-2.5 rounded-full ${REGENCY_DOT.sumedang}`}
                      />
                      {chunks}
                    </span>
                  ),
                })}
              </p>
              <VillageRibbon />
            </div>
          </Container>
        </section>

        {/* 7. Journey: dated milestones, with the seminar where the page is shown as the highlight. */}
        <section className="border-line border-t py-16 sm:py-24">
          <Container className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.25fr)] lg:gap-16">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <h2
                data-reveal
                className="max-w-[16ch] text-[2.125rem] leading-[1.08] tracking-[-0.03em] text-balance sm:text-5xl lg:text-[3.25rem]"
              >
                <span className="block font-semibold">{t('journey.titleLead')}</span>
                <span className="text-accent mt-1 block font-normal">{t('journey.titleRest')}</span>
              </h2>
            </div>
            <ol>
              {(['survey', 'launch', 'seminar', 'expand', 'transact'] as const).map((key, i) => {
                const highlight = key === 'seminar'
                return (
                  <li
                    key={key}
                    data-step
                    data-progress-scope
                    className="relative pb-12 pl-10 last:pb-0"
                  >
                    {i < 4 ? (
                      <span
                        aria-hidden
                        className="bg-line-strong absolute top-6 -bottom-1 left-2 w-0.5 -translate-x-1/2"
                      >
                        <span data-progress="y" className="bg-accent absolute inset-0 origin-top" />
                      </span>
                    ) : null}
                    <span className="about-step-dot bg-accent absolute top-2 left-0 size-4 rounded-full" />
                    <div
                      className={
                        highlight
                          ? 'bg-wash/50 border-line -mt-1 rounded-(--radius) border p-5 sm:p-6'
                          : undefined
                      }
                    >
                      <span className="bg-accent-soft text-accent-soft-foreground inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold">
                        {t(`journey.items.${key}.date`)}
                      </span>
                      <h3 className="mt-3 text-xl leading-snug font-semibold tracking-[-0.01em] text-balance sm:text-2xl">
                        {t(`journey.items.${key}.title`)}
                      </h3>
                      <p className="text-foreground/75 mt-2 max-w-[56ch] leading-relaxed">
                        {t(`journey.items.${key}.body`)}
                      </p>
                      {highlight ? (
                        <p className="text-accent mt-4 flex items-center gap-2 text-sm font-semibold">
                          <MapPin className="size-4" aria-hidden />
                          {t('journey.items.seminar.place')}
                        </p>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ol>
          </Container>
        </section>

        {/* 8. Makers: who builds Desanara, and an invitation to partner with it. */}
        <section className="border-line border-t py-16 sm:py-24">
          <Container>
            <div>
              <h2
                data-reveal
                className="text-[2.125rem] leading-[1.08] tracking-[-0.03em] text-balance sm:text-5xl lg:text-[3.25rem]"
              >
                <span className="block font-semibold">{t('makers.titleLead')}</span>
                <span className="text-accent mt-1 block font-normal">{t('makers.titleRest')}</span>
              </h2>
              <p
                data-reveal
                className="text-foreground/80 mt-5 max-w-[60ch] text-lg leading-relaxed text-pretty"
              >
                {t('makers.body')}
              </p>
            </div>
            <div data-stagger className="mt-10 grid gap-4 md:grid-cols-2 lg:mt-14 lg:gap-6">
              <div className="bg-surface border-line flex flex-col rounded-(--radius) border p-6 sm:p-8">
                <h3 className="text-muted text-sm font-semibold">{t('makers.creditTitle')}</h3>
                <div className="flex flex-1 flex-col items-start justify-center gap-6 py-8 sm:flex-row sm:items-center sm:gap-10">
                  <BrandMark mark="himasif" height={44} />
                  <span aria-hidden className="bg-line-strong hidden h-12 w-px sm:block" />
                  <BrandMark mark="satu" height={58} />
                </div>
                <p className="text-foreground/70 text-sm">{t('makers.programme')}</p>
              </div>
              <div
                id="bermitra"
                className="bg-wash/50 border-line flex scroll-mt-32 flex-col items-start rounded-(--radius) border p-6 sm:p-8 lg:scroll-mt-28"
              >
                <h3 className="text-2xl font-semibold tracking-[-0.02em]">
                  {t('makers.partnerTitle')}
                </h3>
                <p className="text-foreground/75 mt-3 max-w-[44ch] flex-1 leading-relaxed text-pretty">
                  {t('makers.partnerBody')}
                </p>
                <a
                  href={HIMASIF_INSTAGRAM}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-accent text-accent-foreground mt-6 inline-flex min-h-12 items-center gap-2 rounded-full px-6 font-semibold transition-colors hover:bg-[var(--accent-hover)]"
                >
                  <InstagramIcon className="size-5" />
                  {t('makers.partnerCta')}
                </a>
              </div>
            </div>
          </Container>
        </section>

        {/* 9. Questions */}
        <section className="border-line border-t py-16 sm:py-24">
          <Container className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.3fr)] lg:gap-16">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <h2
                data-reveal
                className="text-[2.125rem] leading-[1.08] tracking-[-0.03em] text-balance sm:text-5xl lg:text-[3.25rem]"
              >
                <span className="block font-semibold">{t('faq.titleLead')}</span>
                <span className="text-accent mt-1 block font-normal">{t('faq.titleRest')}</span>
              </h2>
              <div className="bg-wash/50 border-line mt-8 hidden max-w-sm rounded-(--radius) border p-5 lg:block">
                <p className="font-semibold">{t('faq.moreTitle')}</p>
                <p className="text-foreground/75 mt-1 text-sm">{t('faq.moreBody')}</p>
                <a
                  href={HIMASIF_INSTAGRAM}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-line-strong hover:border-accent hover:text-accent mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border px-5 text-sm font-semibold transition-colors"
                >
                  <InstagramIcon className="size-4" />
                  {t('faq.moreCta')}
                </a>
              </div>
            </div>
            <AboutFaq />
          </Container>
        </section>

        {/* 10. Join. Target of every "Daftarkan UMKM" link until /gabung ships (JOIN_HREF). */}
        <section
          id="gabung"
          data-footer-flush
          className="bg-forest relative scroll-mt-32 overflow-hidden py-16 text-white sm:py-24 lg:scroll-mt-28"
        >
          <Image
            src="/brand/desanara-mark.svg"
            alt=""
            width={340}
            height={402}
            unoptimized
            className="pointer-events-none absolute -right-20 -bottom-40 w-72 opacity-10 sm:w-[28rem] lg:-right-10"
          />
          <Container className="relative">
            <h2
              data-reveal
              className="max-w-[18ch] text-[2.125rem] leading-[1.08] tracking-[-0.03em] text-balance sm:text-5xl lg:text-[3.25rem]"
            >
              <span className="block font-semibold">{t('join.titleLead')}</span>
              <span className="mt-1 block font-normal text-[#b4e076]">{t('join.titleRest')}</span>
            </h2>
            <div data-stagger className="mt-10 grid gap-4 md:grid-cols-2 lg:mt-14 lg:gap-6">
              <div className="flex flex-col items-start rounded-(--radius) border border-white/15 bg-white/8 p-6 sm:p-8">
                <div aria-hidden className="flex -space-x-3">
                  {HERO_PRODUCTS.slice(0, 5).map((product) => (
                    <span
                      key={product.slug}
                      className="bg-forest relative size-11 overflow-hidden rounded-full border-2 border-[#2f6347]"
                    >
                      <Image
                        src={mediaUrl(product.imageKey) ?? ''}
                        alt=""
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </span>
                  ))}
                </div>
                <h3 className="mt-5 text-2xl font-semibold tracking-[-0.02em]">
                  {t('join.buyerTitle')}
                </h3>
                <p className="mt-2 max-w-[42ch] flex-1 leading-relaxed text-white/80">
                  {t('join.buyerBody', { count: ABOUT_STATS.villages })}
                </p>
                <Link
                  href="/jelajah"
                  className="text-forest hover:bg-sprout mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 font-semibold whitespace-nowrap transition-colors"
                >
                  {t('join.buyerCta')}
                  <ArrowRight className="size-5" aria-hidden />
                </Link>
              </div>
              <div className="flex flex-col items-start rounded-(--radius) border border-white/15 bg-white/8 p-6 sm:p-8">
                <span
                  aria-hidden
                  className="text-forest grid size-11 place-items-center rounded-full bg-[#b4e076]"
                >
                  <Store className="size-5" />
                </span>
                <h3 className="mt-5 text-2xl font-semibold tracking-[-0.02em]">
                  {t('join.sellerTitle')}
                </h3>
                <p className="mt-2 max-w-[42ch] flex-1 leading-relaxed text-white/80">
                  {t('join.sellerBody')}
                </p>
                <a
                  href={HIMASIF_INSTAGRAM}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-sprout text-forest mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 font-semibold whitespace-nowrap transition-colors hover:bg-white"
                >
                  <InstagramIcon className="size-5" />
                  {t('join.sellerCta')}
                </a>
              </div>
            </div>
          </Container>
        </section>
      </AboutMotion>
    </>
  )
}
