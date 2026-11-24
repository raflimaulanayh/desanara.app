import { BRAND_NAME, locales } from '@repo/i18n'
import type { MetadataRoute } from 'next'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { localePath } from '@/lib/paths'

export const dynamic = 'force-static'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function GET(_: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(locales, locale)) return new Response(null, { status: 404 })
  const t = await getTranslations({ locale, namespace: 'meta' })
  const manifest: MetadataRoute.Manifest = {
    id: '/',
    name: BRAND_NAME,
    short_name: BRAND_NAME,
    description: t('description'),
    lang: locale,
    start_url: localePath(locale, '/'),
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      { src: '/brand/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/brand/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/brand/pwa-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }

  return Response.json(manifest, { headers: { 'Content-Type': 'application/manifest+json' } })
}
