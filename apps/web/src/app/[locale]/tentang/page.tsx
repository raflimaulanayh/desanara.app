import { Container } from '@repo/ui/components/container'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ArrowRight, BadgeCheck, GraduationCap, HandCoins } from 'lucide-react'
import { BrandMark } from '@/components/brand-mark'
import { LogoVertical } from '@/components/brand/logo'
import { VillageScene } from '@/components/home/village-scene'
import { Link } from '@/i18n/navigation'
import { pageAlternates } from '@/lib/site-url'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })
  return { title: t('title'), alternates: pageAlternates('/tentang', locale) }
}

const TRUST = [
  ['verified', BadgeCheck],
  ['direct', HandCoins],
  ['mentored', GraduationCap],
] as const

/** Introduces Desanara (PLAN-public-structure §3.2): the splash hero, what it is, how ordering works, who runs it. */
export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('about')
  return (
    <>
      <section className="bg-wash overflow-hidden">
        <Container className="grid items-center pt-5 pb-2 md:grid-cols-[1.1fr_1fr] md:gap-10 md:py-14 lg:gap-14">
          <LogoVertical width={150} className="mx-auto md:hidden" />
          <div className="-mx-4 mt-1 md:col-start-2 md:row-start-1 md:mx-0 md:mt-0 md:[mask-image:linear-gradient(to_right,transparent,#000_14%,#000_86%,transparent)]">
            <VillageScene className="text-wash" />
          </div>
          <div className="mt-2 text-center md:col-start-1 md:row-start-1 md:mt-0 md:text-left">
            <h1 className="display-title text-accent">{t('hero.title')}</h1>
            <p className="text-muted mx-auto mt-3 max-w-[40ch] text-base text-pretty md:mx-0">
              {t('hero.subtitle')}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center md:justify-start">
              <Link
                href="/jelajah"
                className="bg-accent text-accent-foreground inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 font-bold whitespace-nowrap transition-colors hover:bg-[var(--accent-hover)]"
              >
                {t('hero.explore')}
                <ArrowRight className="size-5" aria-hidden />
              </Link>
              <a
                href="#gabung"
                className="border-line-strong bg-surface hover:border-accent hover:text-accent inline-flex h-12 items-center justify-center rounded-full border px-7 font-bold whitespace-nowrap transition-colors"
              >
                {t('hero.join')}
              </a>
            </div>
          </div>
        </Container>
      </section>

      <Container className="pt-12 sm:pt-16">
        <h2 className="section-title max-w-3xl text-balance">{t('title')}</h2>
        <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex max-w-[66ch] flex-col gap-5 text-base leading-relaxed">
            <p>{t('lead')}</p>
            <p>{t('how')}</p>
            <p className="text-muted">{t('pilot')}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-8 gap-y-4">
              <BrandMark mark="himasif" height={36} />
              <BrandMark mark="satu" height={48} />
            </div>
          </div>
          <ul className="bg-wash flex flex-col gap-5 self-start rounded-2xl p-6">
            {TRUST.map(([k, Icon]) => (
              <li key={k} className="flex gap-3">
                <span className="bg-accent-soft text-accent-soft-foreground grid size-10 shrink-0 place-items-center rounded-full">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div>
                  <h3 className="font-bold">{t(`trust.${k}.title`)}</h3>
                  <p className="text-muted mt-1 text-sm">{t(`trust.${k}.body`)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <section className="pt-14">
          <h2 className="section-title">{t('orderTitle')}</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {(['1', '2', '3'] as const).map((n) => (
              <li key={n} className="border-line rounded-(--radius) border p-5">
                <span className="bg-accent text-accent-foreground grid size-8 place-items-center rounded-full text-sm font-bold">
                  {n}
                </span>
                <p className="mt-3 font-bold">{t(`order.${n}.title`)}</p>
                <p className="text-muted mt-1 text-sm leading-relaxed">{t(`order.${n}.body`)}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Target of every "Daftarkan UMKM" link until self-registration (/gabung) ships. */}
        <section
          id="gabung"
          className="bg-wash mt-14 scroll-mt-32 rounded-2xl p-6 sm:p-8 lg:scroll-mt-20"
        >
          <h2 className="section-title">{t('joinTitle')}</h2>
          <p className="text-muted mt-2 max-w-[60ch] text-base leading-relaxed">
            {t('joinBody')}{' '}
            <a
              href="https://www.instagram.com/himasif.su/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent font-bold underline underline-offset-4"
            >
              @himasif.su
            </a>
            .
          </p>
        </section>
      </Container>
    </>
  )
}
