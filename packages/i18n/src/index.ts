export const locales = ['id', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'id'

const intlLocale: Record<Locale, string> = { id: 'id-ID', en: 'en-US' }

/** 15000 → "Rp15.000" (prices are always IDR, whatever the UI language). */
export function formatRupiah(amount: number, locale: Locale = 'id'): string {
  return new Intl.NumberFormat(intlLocale[locale], {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string, locale: Locale = 'id'): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { dateStyle: 'medium' }).format(new Date(date))
}

/** Builds a wa.me link with a prefilled order message. `phone` must be 628xxx. */
export function buildWhatsAppLink(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

/**
 * Platform brand name (chosen 2026-11-01).
 * Changing the brand: update this constant and `common.appName` / `meta` in every messages/*.json.
 */
export const BRAND_NAME = 'Sudut Desa'
