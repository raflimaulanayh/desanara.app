/**
 * Turns a name into a URL slug that satisfies `slugSchema`: lowercase ASCII, digits and single hyphens,
 * 3–60 characters. Accents are stripped ("Kopi Gayo Pak Ujang" → "kopi-gayo-pak-ujang").
 * Uniqueness is the caller's job (the API appends -2, -3, … when a slug is taken).
 */
export function toSlug(name: string, fallback = 'umkm'): string {
  const slug = name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' dan ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '')
  return slug.length >= 3 ? slug : fallback
}

/** `base`, `base-2`, `base-3`, … kept within 60 characters. */
export function slugWithSuffix(base: string, n: number): string {
  if (n <= 1) return base
  const suffix = `-${n}`
  return `${base.slice(0, 60 - suffix.length).replace(/-+$/g, '')}${suffix}`
}
