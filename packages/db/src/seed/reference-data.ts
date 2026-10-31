/**
 * Real reference data (kept on reset).
 *
 * Regions: Jawa Barat province and its 27 regencies/cities using Kemendagri codes.
 * District (kecamatan) and village (desa) levels are imported from the official
 * dataset later (see docs/guides/seed-data.md); do not invent codes for them.
 */
type RegionLevel = 'province' | 'regency' | 'district' | 'village'
interface RegionSeed {
  code: string
  name: string
  level: RegionLevel
  parentCode: string | null
}

export const regionSeed: RegionSeed[] = [
  { code: '32', name: 'Jawa Barat', level: 'province', parentCode: null },
  ...(
    [
      ['32.01', 'Kabupaten Bogor'],
      ['32.02', 'Kabupaten Sukabumi'],
      ['32.03', 'Kabupaten Cianjur'],
      ['32.04', 'Kabupaten Bandung'],
      ['32.05', 'Kabupaten Garut'],
      ['32.06', 'Kabupaten Tasikmalaya'],
      ['32.07', 'Kabupaten Ciamis'],
      ['32.08', 'Kabupaten Kuningan'],
      ['32.09', 'Kabupaten Cirebon'],
      ['32.10', 'Kabupaten Majalengka'],
      ['32.11', 'Kabupaten Sumedang'],
      ['32.12', 'Kabupaten Indramayu'],
      ['32.13', 'Kabupaten Subang'],
      ['32.14', 'Kabupaten Purwakarta'],
      ['32.15', 'Kabupaten Karawang'],
      ['32.16', 'Kabupaten Bekasi'],
      ['32.17', 'Kabupaten Bandung Barat'],
      ['32.18', 'Kabupaten Pangandaran'],
      ['32.71', 'Kota Bogor'],
      ['32.72', 'Kota Sukabumi'],
      ['32.73', 'Kota Bandung'],
      ['32.74', 'Kota Cirebon'],
      ['32.75', 'Kota Bekasi'],
      ['32.76', 'Kota Depok'],
      ['32.77', 'Kota Cimahi'],
      ['32.78', 'Kota Tasikmalaya'],
      ['32.79', 'Kota Banjar'],
    ] as const
  ).map(([code, name]): RegionSeed => ({ code, name, level: 'regency', parentCode: '32' })),
]

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
