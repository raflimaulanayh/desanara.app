import { defaultLocale } from '@repo/i18n'

/** Absolute-path URL with the locale prefix (none for the default locale), for plain <form action>. */
export function localePath(locale: string, path: string): string {
  return locale === defaultLocale ? path : `/${locale}${path === '/' ? '' : path}`
}
