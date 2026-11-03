import { defaultLocale, locales } from '@repo/i18n'
import { defineRouting } from 'next-intl/routing'

/**
 * URL segments are Indonesian for every locale (ADR 0008): /desa/baros and /en/desa/baros.
 * The default locale (id) has no prefix. Content slugs stay in the content language.
 */
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
})
