import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

/** Old English URLs (ADR 0006) → Indonesian ones (ADR 0008). Kept so shared links never die. */
const SEGMENTS: [string, string][] = [
  ['explore', 'jelajah'],
  ['about', 'tentang'],
  ['villages', 'desa'],
  ['products', 'produk'],
]

const legacyRedirects = () => {
  const rules: { source: string; destination: string; permanent: true }[] = []
  for (const [from, to] of SEGMENTS) {
    const tail = from === 'explore' || from === 'about' ? '' : '/:path*'
    // /id/<old> → /<new> ; /en/<old> → /en/<new> ; /<old> → /<new>
    rules.push({ source: `/id/${from}${tail}`, destination: `/${to}${tail}`, permanent: true })
    rules.push({ source: `/en/${from}${tail}`, destination: `/en/${to}${tail}`, permanent: true })
    rules.push({ source: `/${from}${tail}`, destination: `/${to}${tail}`, permanent: true })
  }
  rules.push({ source: '/id/:path*', destination: '/:path*', permanent: true })
  return rules
}

/** Lets next/image load photos from the R2 public URL (https://cdn.desanara.app). */
const mediaBase = process.env.NEXT_PUBLIC_MEDIA_URL?.replace(/\/$/, '')
const images: NextConfig['images'] = {
  qualities: [60, 75],
  remotePatterns: mediaBase ? [new URL(`${mediaBase}/**`)] : [],
}

const nextConfig: NextConfig = {
  // Local servers can share the checkout while keeping their Next.js artifacts separate.
  distDir:
    process.env.NODE_ENV === 'development'
      ? process.env.DESANARA_WEB_DEV_DIST_DIR ||
        (process.env.DESANARA_UI_PREVIEW === '1' ? '.next/preview' : undefined)
      : undefined,
  devIndicators: process.env.DESANARA_UI_PREVIEW === '1' ? false : undefined,
  images,
  serverExternalPackages: ['web-push'],
  transpilePackages: ['@repo/ui', '@repo/i18n', '@repo/api-client', '@repo/validators'],
  typedRoutes: false,
  redirects: async () => legacyRedirects(),
  headers: async () => [
    {
      source: '/sw.js',
      headers: [
        { key: 'Cache-Control', value: 'no-cache' },
        { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self'" },
      ],
    },
  ],
}

export default createNextIntlPlugin('./src/i18n/request.ts')(nextConfig)
