import { defaultLocale } from '@repo/i18n'

/** Absolute-path URL with the locale prefix (none for the default locale), for plain <form action>. */
export function localePath(locale: string, path: string): string {
  return locale === defaultLocale ? path : `/${locale}${path === '/' ? '' : path}`
}

/** Where "Daftarkan UMKM" leads until self-registration (/gabung, PLAN-public-structure) ships. */
export const JOIN_HREF = '/tentang#gabung'

export const VILLAGES_HASH = 'desa'
export const SETTINGS_PATH = '/pengaturan'

/** Highlights the section containing the current public page. */
export function publicNavSection(pathname: string, hash = '') {
  if (pathname === '/') return hash === `#${VILLAGES_HASH}` ? 'villages' : 'home'
  if (pathname === '/jelajah' || pathname.startsWith('/produk/')) return 'products'
  if (pathname.startsWith('/desa/')) return 'villages'
  if (pathname === SETTINGS_PATH) return 'settings'
  return null
}
