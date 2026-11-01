import type { Locale } from '@repo/i18n'

/** User content is written in Indonesian; English comes from translations when present. */
export function pick(locale: string, id: string, en: string | null | undefined): string {
  return locale === 'en' && en ? en : id
}

export function asLocale(locale: string): Locale {
  return locale === 'en' ? 'en' : 'id'
}
