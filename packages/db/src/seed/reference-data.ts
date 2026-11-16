/**
 * Real reference data (kept on reset). Regions are not here: they come from the Kemendagri dataset
 * (packages/db/data/regions, imported by `importRegions`).
 */
export const categorySeed = [
  { slug: 'makanan-camilan', name: 'Makanan & Camilan', en: 'Food & Snacks', icon: 'utensils' },
  { slug: 'minuman', name: 'Minuman', en: 'Beverages', icon: 'cup' },
  { slug: 'kerajinan', name: 'Kerajinan Tangan', en: 'Handicrafts', icon: 'scissors' },
  { slug: 'fesyen', name: 'Fesyen & Kain', en: 'Fashion & Textiles', icon: 'shirt' },
  { slug: 'hasil-tani', name: 'Hasil Tani & Kebun', en: 'Farm Produce', icon: 'sprout' },
  {
    slug: 'peternakan-perikanan',
    name: 'Peternakan & Perikanan',
    en: 'Livestock & Fishery',
    icon: 'fish',
  },
] as const

export type CategorySlug = (typeof categorySeed)[number]['slug']
