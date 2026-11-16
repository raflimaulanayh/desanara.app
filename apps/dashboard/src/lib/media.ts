/**
 * Public URL of a stored object key (the database stores keys, not URLs). In production
 * NEXT_PUBLIC_MEDIA_URL is the R2 public URL; locally without it, the seed photos are served by the
 * web app from apps/web/public/media.
 */
export function mediaUrl(key: string | null | undefined): string | null {
  if (!key) return null
  const web = (process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000').replace(/\/$/, '')
  const base = process.env.NEXT_PUBLIC_MEDIA_URL || `${web}/media`
  return `${base.replace(/\/$/, '')}/${key.replace(/^\//, '')}`
}
