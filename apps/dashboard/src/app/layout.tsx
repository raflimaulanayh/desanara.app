import type { Metadata } from 'next'
import { OfflineNotice } from '@repo/ui/components/offline-notice'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'
import { Providers } from '@/components/providers'
import { montserrat } from '@/lib/fonts'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('dashboard')
  return { title: t('title'), robots: { index: false, follow: false } }
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [locale, states] = await Promise.all([getLocale(), getTranslations('states')])
  return (
    <html lang={locale} className={montserrat.variable}>
      <body className="bg-background text-foreground min-h-dvh antialiased">
        <NextIntlClientProvider>
          <OfflineNotice message={states('offline')} />
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
