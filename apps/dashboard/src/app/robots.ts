import type { MetadataRoute } from 'next'

/** The dashboard is a logged-in tool: nothing here belongs in search results. */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', disallow: '/' } }
}
