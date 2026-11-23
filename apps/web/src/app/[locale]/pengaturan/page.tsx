import { locales } from '@repo/i18n'
import { Container } from '@repo/ui/components/container'
import { Check, ChevronRight, Languages } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getPathname } from '@/i18n/navigation'
import { SETTINGS_PATH } from '@/lib/paths'
import { pageAlternates } from '@/lib/site-url'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'settings' })
  return {
    title: t('title'),
    description: t('description'),
    alternates: pageAlternates(SETTINGS_PATH, locale),
    robots: { index: false, follow: true },
  }
}

export default async function SettingsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('settings')

  return (
    <Container className="py-6 sm:py-10">
      <h1 className="page-title">{t('title')}</h1>
      <section
        aria-labelledby="display-language"
        className="border-line bg-surface mt-5 max-w-xl overflow-hidden rounded-2xl border"
      >
        <div className="bg-wash/55 flex items-center gap-3 px-4 py-3.5 sm:px-5">
          <Languages className="text-accent size-5 shrink-0" aria-hidden />
          <h2 id="display-language" className="font-bold">
            {t('language')}
          </h2>
        </div>
        <ul className="divide-line divide-y">
          {locales.map((language) => {
            const active = language === locale
            // A full request lets next-intl save the locale and redirect to its canonical URL.
            const href = getPathname({
              href: SETTINGS_PATH,
              locale: language,
              forcePrefix: !active,
            })
            return (
              <li key={language}>
                <a
                  href={href}
                  hrefLang={language}
                  aria-current={active ? 'true' : undefined}
                  className="hover:bg-wash/55 flex min-h-14 items-center justify-between gap-3 px-4 py-3 font-semibold transition-colors focus-visible:outline-offset-[-3px] sm:px-5"
                >
                  <span lang={language}>{t(`languages.${language}`)}</span>
                  {active ? (
                    <span className="text-accent inline-flex items-center gap-1.5 text-sm">
                      {t('selected')}
                      <Check className="size-4 shrink-0" aria-hidden />
                    </span>
                  ) : (
                    <ChevronRight className="text-muted size-4 shrink-0" aria-hidden />
                  )}
                </a>
              </li>
            )
          })}
        </ul>
      </section>
    </Container>
  )
}
