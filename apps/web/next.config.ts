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
  rules.push({ source: '/id', destination: '/', permanent: true })
  return rules
}

const nextConfig: NextConfig = {
  transpilePackages: ['@repo/ui', '@repo/i18n', '@repo/api-client', '@repo/validators'],
  typedRoutes: false,
  redirects: async () => legacyRedirects(),
}

export default createNextIntlPlugin('./src/i18n/request.ts')(nextConfig)
