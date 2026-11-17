import { Container } from '@repo/ui/components/container'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { BadgeCheck, GraduationCap, HandCoins } from 'lucide-react'
import { BrandMark } from '@/components/brand-mark'
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

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const [t, th] = await Promise.all([getTranslations('about'), getTranslations('home')])
  return (
    <Container className="py-10 sm:py-14">
      <h1 className="max-w-3xl text-[clamp(2rem,6vw,3.25rem)] leading-tight font-extrabold tracking-tight text-balance">
        {t('title')}
      </h1>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex max-w-[66ch] flex-col gap-5 text-lg leading-relaxed">
          <p>{t('lead')}</p>
          <p>{t('how')}</p>
          <p className="text-muted">{t('pilot')}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-8 gap-y-4">
            <BrandMark mark="himasif" height={36} />
            <BrandMark mark="satu" height={48} />
          </div>
        </div>
        <ul className="bg-wash flex flex-col gap-5 self-start rounded-3xl p-6">
          {TRUST.map(([k, Icon]) => (
            <li key={k} className="flex gap-3">
              <span className="bg-accent-soft text-accent-soft-foreground grid size-10 shrink-0 place-items-center rounded-full">
                <Icon className="size-5" aria-hidden />
              </span>
              <div>
                <h2 className="font-bold">{th(`trust.${k}.title`)}</h2>
                <p className="text-muted mt-1 text-sm">{th(`trust.${k}.body`)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Container>
  )
}
