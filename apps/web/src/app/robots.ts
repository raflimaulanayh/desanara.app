import type { MetadataRoute } from 'next'
import { isIndexable, siteUrl } from '@/lib/site-url'

/**
 * Only the production site may be indexed. Vercel previews and local builds answer "disallow everything"
 * so a preview URL never shows up in search results next to desanara.app.
 */
export default function robots(): MetadataRoute.Robots {
  if (!isIndexable()) return { rules: { userAgent: '*', disallow: '/' } }
  const base = siteUrl()
  return { rules: { userAgent: '*', allow: '/' }, sitemap: `${base}/sitemap.xml`, host: base }
}
