import { BRAND_NAME } from '@repo/i18n'
import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { ReactNode } from 'react'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { routing } from '@/i18n/routing'
import { fontVariables } from '@/lib/fonts'
import '../globals.css'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export const viewport: Viewport = { themeColor: '#ffffff' }

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
    metadataBase: new URL(process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000'),
    alternates: { languages: { id: '/id', en: '/en' } },
    openGraph: {
      siteName: BRAND_NAME,
      locale: locale === 'en' ? 'en_US' : 'id_ID',
      type: 'website',
    },
  }
}

/* The direction contract must be the first child of <body> and survive the build. */
const DIRECTION_CONTRACT = `
THESIS: Every village is a rubber stamp and every order is a nota sent straight to the maker; we refuse the marketplace grid of identical photo cards and green buttons.
OWN-WORLD: White order-book paper, blue ruling, navy printed heads in Barlow Condensed caps, tabular prices; stamp ink is the accent (platform violet, each village its own ink); round "cap desa" seals, rectangular rubber stamps for every state.
STORY: The visitor sees villages as stamps, browses products as lines on a nota, trusts the village stamp, and sends a written order on WhatsApp.
FIRST VIEWPORT: Printed headline left, search on a ruled line below it, a cluster of partner-village seals beside it (below on phones); the search submit is the primary action.
FORM: Buku Nota & Stempel, candidate 7 of 7, seed key b9d19e88.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
`

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
  const t = await getTranslations('nav')

  return (
    <html lang={locale} className={fontVariables}>
      <body className="bg-background text-foreground min-h-dvh antialiased">
        <div
          hidden
          aria-hidden
          dangerouslySetInnerHTML={{ __html: `<!--${DIRECTION_CONTRACT}-->` }}
        />
        <a
          href="#main"
          className="bg-accent text-accent-foreground sr-only z-50 px-4 py-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          {t('skip')}
        </a>
        <NextIntlClientProvider>
          <div className="flex min-h-dvh flex-col">
            <SiteHeader />
            <main id="main" className="flex-1">
              {children}
            </main>
            <SiteFooter />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
