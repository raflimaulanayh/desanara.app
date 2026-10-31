import { defaultLocale, locales } from '@repo/i18n'
import { defineRouting } from 'next-intl/routing'

/**
 * URL segments are English for every locale (ADR 0006): /id/explore, /en/explore.
 * Content slugs stay in the content language.
 */
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
})
