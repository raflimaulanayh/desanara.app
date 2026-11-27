import { defaultLocale } from '@repo/i18n'

/** Absolute-path URL with the locale prefix (none for the default locale), for plain <form action>. */
export function localePath(locale: string, path: string): string {
  return locale === defaultLocale ? path : `/${locale}${path === '/' ? '' : path}`
}

/** Where "Daftarkan UMKM" leads until self-registration (/gabung, PLAN-public-structure) ships. */
export const JOIN_HREF = '/tentang#gabung'

export const VILLAGES_HASH = 'desa'
export const VILLAGES_PATH = '/desa'
export const SETTINGS_PATH = '/pengaturan'

/** HIMASIF's Instagram: the public contact for sign-up and partnership until /gabung ships. */
export const HIMASIF_INSTAGRAM = 'https://www.instagram.com/himasif.su/'

/** HIMASIF uses the same handle, @himasif.su, on every network. */
export const HIMASIF_SOCIALS = [
  { network: 'instagram', label: 'Instagram', href: HIMASIF_INSTAGRAM },
  { network: 'tiktok', label: 'TikTok', href: 'https://www.tiktok.com/@himasif.su' },
  { network: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/@himasif.su' },
] as const

/** Highlights the section containing the current public page. */
export function publicNavSection(pathname: string, hash = '') {
  if (pathname === '/') return hash === `#${VILLAGES_HASH}` ? 'villages' : 'home'
  if (pathname === '/jelajah' || pathname.startsWith('/produk/')) return 'products'
  if (pathname === VILLAGES_PATH || pathname.startsWith(`${VILLAGES_PATH}/`)) return 'villages'
  if (pathname === SETTINGS_PATH) return 'settings'
  return null
}
