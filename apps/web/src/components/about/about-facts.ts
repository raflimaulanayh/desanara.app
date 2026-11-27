/**
 * Fixed figures for the about page (PLAN-about-page §3.1). They are written in, not fetched: the page
 * tells the Desanara story and should not change with every new listing.
 *
 * Source: public API (api.desanara.app/v1 villages, products, sitemap, categories), read on 2026-11-27.
 * Desa Baros facts: HIMASIF field survey notes, 24 October 2026. Update both before the public launch
 * once real data replaces the current catalogue.
 */
export const ABOUT_STATS = {
  villages: 27,
  businesses: 136,
  products: 38,
  categories: 6,
  regencies: 3,
} as const

/** Partner villages per regency (Kemendagri codes 32.04, 32.05, 32.11). */
export const ABOUT_REGENCIES = [
  { name: 'Kabupaten Bandung', villages: 13 },
  { name: 'Kabupaten Garut', villages: 7 },
  { name: 'Kabupaten Sumedang', villages: 7 },
] as const

export const BAROS = {
  slug: 'baros',
  recordedBusinesses: 78,
  listedBusinesses: 6,
  bannerKey: 'seed/villages/baros/banner.webp',
  logoKey: 'seed/villages/baros/logo.webp',
} as const

/** The other partner villages with their regency (Kemendagri code), linked from the Baros section. */
export type Regency = 'bandung' | 'garut' | 'sumedang'
/** One colour per regency, shared by the village ribbon and the legend in the sentence above it. */
export const REGENCY_DOT: Record<Regency, string> = {
  bandung: 'bg-leaf',
  garut: 'bg-sun',
  sumedang: 'bg-clay',
}
export const OTHER_VILLAGES: readonly (readonly [slug: string, name: string, regency: Regency])[] =
  [
    ['desa-bojongsari', 'Bojongsari', 'bandung'],
    ['desa-cibeusi', 'Cibeusi', 'sumedang'],
    ['desa-ciburial', 'Ciburial', 'bandung'],
    ['desa-ciburuy', 'Ciburuy', 'garut'],
    ['desa-cikadut', 'Cikadut', 'bandung'],
    ['desa-cikajang', 'Cikajang', 'garut'],
    ['desa-cikandang', 'Cikandang', 'garut'],
    ['desa-cikeruh', 'Cikeruh', 'sumedang'],
    ['desa-cilayung', 'Cilayung', 'sumedang'],
    ['desa-cileles', 'Cileles', 'sumedang'],
    ['desa-cilengkrang', 'Cilengkrang', 'bandung'],
    ['desa-cileunyi-kulon', 'Cileunyi Kulon', 'bandung'],
    ['desa-cileunyi-wetan', 'Cileunyi Wetan', 'bandung'],
    ['desa-cimekar', 'Cimekar', 'bandung'],
    ['desa-cimenyan', 'Cimenyan', 'bandung'],
    ['desa-cinunuk', 'Cinunuk', 'bandung'],
    ['desa-cipacing', 'Cipacing', 'sumedang'],
    ['desa-cisurupan', 'Cisurupan', 'garut'],
    ['desa-girimekar', 'Girimekar', 'bandung'],
    ['mekarwangi', 'Mekarwangi', 'garut'],
    ['desa-sangkanhurip', 'Sangkanhurip', 'bandung'],
    ['desa-sayang', 'Sayang', 'sumedang'],
    ['sindangjaya', 'Sindangjaya', 'sumedang'],
    ['desa-sukawening', 'Sukawening', 'garut'],
    ['desa-tegalluar', 'Tegalluar', 'bandung'],
    ['desa-wanajaya', 'Wanajaya', 'garut'],
  ]

/**
 * Hero strip: listed products from different villages and categories, in display order. Keep the count
 * even so the square and portrait photos keep alternating across the loop.
 */
export const HERO_PRODUCTS = [
  {
    slug: 'kopi-gunung-baros-arabika-bubuk-200g',
    name: 'Kopi Arabika Bubuk 200 gr',
    nameEn: 'Ground Arabica Coffee 200 g',
    village: 'Desa Baros',
    imageKey: 'seed/products/coffee-ground.webp',
  },
  {
    slug: 'batik-tulis-mekarwangi-kain-batik-tulis',
    name: 'Kain Batik Tulis 2 m',
    nameEn: 'Hand-drawn Batik Cloth 2 m',
    village: 'Desa Mekarwangi',
    imageKey: 'seed/products/batik.webp',
  },
  {
    slug: 'madu-hutan-baros-madu-hutan-250ml',
    name: 'Madu Hutan 250 ml',
    nameEn: 'Wild Forest Honey 250 ml',
    village: 'Desa Baros',
    imageKey: 'seed/products/honey-a.webp',
  },
  {
    slug: 'ukir-kayu-sindangjaya-talenan-kayu-jati',
    name: 'Talenan Kayu Jati',
    nameEn: 'Teak Cutting Board',
    village: 'Desa Sindangjaya',
    imageKey: 'seed/products/board.webp',
  },
  {
    slug: 'anyaman-bambu-pak-ujang-lampu-hias-bambu',
    name: 'Lampu Hias Bambu',
    nameEn: 'Bamboo Pendant Lamp',
    village: 'Desa Baros',
    imageKey: 'seed/products/lamp.webp',
  },
  {
    slug: 'sale-pisang-bu-entin-sale-pisang-basah',
    name: 'Sale Pisang Basah 250 gr',
    nameEn: 'Dried Banana 250 g',
    village: 'Desa Sindangjaya',
    imageKey: 'seed/products/sale-a.webp',
  },
  {
    slug: 'anyaman-bambu-pak-ujang-besek-bambu-isi-10',
    name: 'Besek Bambu (isi 10)',
    nameEn: 'Bamboo Boxes (10 pcs)',
    village: 'Desa Baros',
    imageKey: 'seed/products/besek.webp',
  },
  {
    slug: 'jeruk-garut-pak-darma-jeruk-keprok-1kg',
    name: 'Jeruk Keprok 1 kg',
    nameEn: 'Tangerines 1 kg',
    village: 'Desa Mekarwangi',
    imageKey: 'seed/products/tangerine.webp',
  },
  {
    slug: 'keripik-bu-ani-keripik-singkong-balado',
    name: 'Keripik Singkong Balado 250 gr',
    nameEn: 'Spicy Balado Cassava Chips 250 g',
    village: 'Desa Baros',
    imageKey: 'seed/products/chips-b.webp',
  },
  {
    slug: 'ubi-madu-pak-endang-ubi-oven-1kg',
    name: 'Ubi Madu Oven 1 kg',
    nameEn: 'Oven-roasted Honey Sweet Potato 1 kg',
    village: 'Desa Sindangjaya',
    imageKey: 'seed/products/ubi-roasted.webp',
  },
] as const

/** The product used in the order simulator. */
export const DEMO_ORDER = {
  slug: 'kopi-gunung-baros-arabika-bubuk-200g',
  name: 'Kopi Arabika Bubuk 200 gr',
  nameEn: 'Ground Arabica Coffee 200 g',
  price: 60000,
  businessName: 'Kopi Gunung Baros',
  villageName: 'Desa Baros',
  imageKey: 'seed/products/coffee-ground.webp',
} as const

export { HIMASIF_INSTAGRAM } from '@/lib/paths'
