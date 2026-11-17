import { locales } from '@repo/i18n'
import type { MetadataRoute } from 'next'
import { getSitemapEntries } from '@/lib/data'
import { absoluteUrl, localeAlternates } from '@/lib/site-url'

/**
 * Rendered per request: the API answer is already cached for an hour at the CDN (one cache layer), and an
 * API failure becomes an error the crawler retries instead of an empty sitemap cached for an hour.
 */
export const dynamic = 'force-dynamic'

/** Search engines read at most 50,000 URLs per sitemap file. */
const MAX_URLS = 50_000

type Entry = MetadataRoute.Sitemap[number]
type Extra = Pick<Entry, 'lastModified' | 'changeFrequency' | 'priority'>

/** One <url> per locale, each carrying the full set of hreflang alternates. */
const page = (path: string, extra: Extra): Entry[] => {
  const languages = localeAlternates(path)
  return locales.map((l) => ({ url: absoluteUrl(path, l), alternates: { languages }, ...extra }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { villages, businesses, products } = await getSitemapEntries()
  // The photo credits page is noindex, so it is not listed.
  return [
    ...page('/', { changeFrequency: 'daily', priority: 1 }),
    ...page('/jelajah', { changeFrequency: 'daily', priority: 0.9 }),
    ...page('/tentang', { changeFrequency: 'monthly', priority: 0.3 }),
    ...villages.flatMap((v) =>
      page(`/desa/${v.slug}`, {
        lastModified: v.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
      }),
    ),
    ...businesses.flatMap((b) =>
      page(`/desa/${b.villageSlug}/${b.slug}`, {
        lastModified: b.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
      }),
    ),
    ...products.flatMap((p) =>
      page(`/produk/${p.slug}`, {
        lastModified: p.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.6,
      }),
    ),
  ].slice(0, MAX_URLS)
}
