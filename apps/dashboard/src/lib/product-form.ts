import { COMPARE_AT_PRICE_MESSAGE, MIN_PRODUCT_PRICE } from '@repo/validators'
import type { Product } from './products'

/**
 * Pure helpers for the product form (no React), so the rules are unit-tested.
 * Prices are edited as digit strings and shown with thousand dots ("15.000"); only digits are
 * kept, so "15,5" can never become a decimal (rupiah has none) and nothing is guessed.
 */
export interface ProductFormValues {
  name: string
  categoryId: string
  description: string
  /** Digits only, '' = not filled. Ignored when `isFree`. */
  price: string
  isFree: boolean
  onPromo: boolean
  /** Digits only; used only when `onPromo`. */
  compareAtPrice: string
  isAvailable: boolean
  enName: string
  enDescription: string
}

const MAX_DIGITS = 10

/** Keeps digits only, without leading zeros: what the price input stores. */
export function digitsOnly(text: string): string {
  return text
    .replace(/\D/g, '')
    .replace(/^0+(?=\d)/, '')
    .slice(0, MAX_DIGITS)
}

/** "15000" → "15.000" (Indonesian thousand separator). */
export function formatDigits(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export function valuesFrom(p: Product | null): ProductFormValues {
  return {
    name: p?.name ?? '',
    categoryId: p?.category?.id ?? '',
    description: p?.description ?? '',
    price: p && p.price > 0 ? String(p.price) : '',
    isFree: p?.isFree ?? false,
    onPromo: Boolean(p?.compareAtPrice),
    compareAtPrice: p?.compareAtPrice ? String(p.compareAtPrice) : '',
    isAvailable: p?.isAvailable ?? true,
    enName: p?.en?.name ?? '',
    enDescription: p?.en?.description ?? '',
  }
}

/** Selling price the form will send, or null while it is not filled. */
export function priceOf(v: ProductFormValues): number | null {
  if (v.isFree) return 0
  return v.price ? Number(v.price) : null
}

export function compareAtOf(v: ProductFormValues): number | null {
  return v.onPromo && v.compareAtPrice ? Number(v.compareAtPrice) : null
}

/** Body for POST /v1/manage/businesses/{id}/products: trimmed, empty optional fields left out. */
export function toCreateInput(v: ProductFormValues) {
  const out: Record<string, unknown> = {
    categoryId: v.categoryId,
    name: v.name.trim(),
    price: priceOf(v) ?? undefined,
    isAvailable: v.isAvailable,
  }
  if (v.description.trim()) out.description = v.description.trim()
  const compareAt = compareAtOf(v)
  if (compareAt !== null) out.compareAtPrice = compareAt
  if (v.enName.trim()) {
    out.en = { name: v.enName.trim(), description: v.enDescription.trim() || undefined }
  }
  return out
}

/** Body for PATCH: only what changed; '' or null clears an optional field. */
export function toPatch(original: Product, v: ProductFormValues) {
  const out: Record<string, unknown> = {}
  if (v.name.trim() !== original.name) out.name = v.name.trim()
  if (v.categoryId && v.categoryId !== (original.category?.id ?? '')) out.categoryId = v.categoryId
  if (v.description.trim() !== (original.description ?? '')) out.description = v.description.trim()
  const price = priceOf(v)
  if (price !== null && price !== original.price) out.price = price
  const compareAt = compareAtOf(v)
  if (compareAt !== original.compareAtPrice) out.compareAtPrice = compareAt
  if (v.isAvailable !== original.isAvailable) out.isAvailable = v.isAvailable

  const enName = v.enName.trim()
  const enDescription = v.enDescription.trim()
  if (!enName && original.en) out.en = null
  else if (
    enName &&
    (enName !== original.en?.name || enDescription !== (original.en?.description ?? ''))
  ) {
    out.en = { name: enName, description: enDescription }
  }
  return out
}

/**
 * Checks the schema cannot express on its own: an empty price (the form asks for it in words),
 * and the struck-through price against the price on screen (the API checks it against the row).
 */
export function priceErrors(
  v: ProductFormValues,
  t: (key: string, values?: Record<string, string | number>) => string,
): Record<string, string> {
  const out: Record<string, string> = {}
  const price = priceOf(v)
  if (price === null) out.price = t('productForm.priceRequired')
  else if (price > 0 && price < MIN_PRODUCT_PRICE) out.price = t('productForm.priceTooLow')
  if (v.onPromo) {
    const compareAt = compareAtOf(v)
    if (compareAt === null) out.compareAtPrice = t('productForm.compareAtRequired')
    else if (price !== null && compareAt <= price) out.compareAtPrice = COMPARE_AT_PRICE_MESSAGE
  }
  return out
}

/** Moves one item to another position; out-of-range moves return the list unchanged. */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) {
    return [...list]
  }
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item as T)
  return next
}
