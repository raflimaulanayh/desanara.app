/**
 * Builds a public URL for a stored object key (ADR storage: keys, not URLs, live in the database).
 * Locally the seed assets are served from apps/web/public/media; in production NEXT_PUBLIC_MEDIA_URL
 * points at the R2 custom domain (https://cdn.desanara.app).
 */
export function mediaUrl(key: string | null | undefined): string | null {
  if (!key) return null
  const base = process.env.NEXT_PUBLIC_MEDIA_URL || '/media'
  return `${base.replace(/\/$/, '')}/${key.replace(/^\//, '')}`
}
