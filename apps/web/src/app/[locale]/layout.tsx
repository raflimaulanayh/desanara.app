import { BRAND_NAME } from '@repo/i18n'
import { OfflineNotice } from '@repo/ui/components/offline-notice'
import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { ReactNode } from 'react'
import { MobileNavigation } from '@/components/mobile-navigation'
import { PwaProvider } from '@/components/pwa-provider'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { routing } from '@/i18n/routing'
import { fontVariables } from '@/lib/fonts'
import { pageAlternates, siteUrl } from '@/lib/site-url'
import '../globals.css'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export const viewport: Viewport = { themeColor: '#ffffff', viewportFit: 'cover' }

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title: { default: t('title'), template: `%s · ${BRAND_NAME}` },
    description: t('description'),
    manifest: `/api/pwa/manifest/${locale}`,
    metadataBase: new URL(siteUrl()),
    // Pages override this with their own path; the home page keeps it.
    alternates: pageAlternates('/', locale),
    openGraph: {
      siteName: BRAND_NAME,
      locale: locale === 'en' ? 'en_US' : 'id_ID',
      type: 'website',
      images: [{ url: '/brand/og-default.png', width: 1200, height: 630, alt: BRAND_NAME }],
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const [t, states] = await Promise.all([getTranslations('nav'), getTranslations('states')])

  return (
    <html lang={locale} className={fontVariables}>
      <body className="bg-background text-foreground min-h-dvh antialiased">
        <a
          href="#main"
          className="bg-accent text-accent-foreground sr-only z-50 rounded-full px-4 py-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          {t('skip')}
        </a>
        <NextIntlClientProvider>
          <PwaProvider>
            <div className="site-shell flex min-h-dvh flex-col pb-(--mobile-nav-space) lg:pb-0">
              <OfflineNotice message={states('offline')} />
              <SiteHeader />
              <main id="main" className="flex-1">
                {children}
              </main>
              <SiteFooter />
              <MobileNavigation />
            </div>
          </PwaProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
