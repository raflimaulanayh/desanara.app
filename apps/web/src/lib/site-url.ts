import { defaultLocale, locales } from '@repo/i18n'

/**
 * Public origin of the site without a trailing slash (https://desanara.app in production).
 * A production deployment without NEXT_PUBLIC_WEB_URL fails loudly instead of publishing localhost links.
 */
export function siteUrl(env: Record<string, string | undefined> = process.env): string {
  const url = env.NEXT_PUBLIC_WEB_URL
  if (!url) {
    if (env.VERCEL_ENV === 'production') throw new Error('NEXT_PUBLIC_WEB_URL is not set')
    return 'http://localhost:3000'
  }
  return url.replace(/\/$/, '')
}

/** Absolute URL of a path in one locale: the default locale has no prefix (ADR 0008). */
export function absoluteUrl(path: string, locale: string = defaultLocale, base = siteUrl()) {
  const prefix = locale === defaultLocale ? '' : `/${locale}`
  return `${base}${prefix}${path === '/' ? '' : path}`
}

/** hreflang alternates for a path: one per locale plus x-default (the unprefixed Indonesian page). */
export function localeAlternates(path: string, base = siteUrl()): Record<string, string> {
  return {
    ...Object.fromEntries(locales.map((l) => [l, absoluteUrl(path, l, base)])),
    'x-default': absoluteUrl(path, defaultLocale, base),
  }
}

/** `metadata.alternates` for a page: its own canonical URL and the same page in every locale. */
export function pageAlternates(path: string, locale: string, base = siteUrl()) {
  return { canonical: absoluteUrl(path, locale, base), languages: localeAlternates(path, base) }
}

/**
 * Only a real production site may be indexed: on Vercel that is VERCEL_ENV=production (previews are not);
 * elsewhere (campus VPS) any non-localhost NEXT_PUBLIC_WEB_URL.
 */
export function isIndexable(env: Record<string, string | undefined> = process.env): boolean {
  if (env.VERCEL_ENV) return env.VERCEL_ENV === 'production'
  return (
    Boolean(env.NEXT_PUBLIC_WEB_URL) && !/\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(siteUrl(env))
  )
}
