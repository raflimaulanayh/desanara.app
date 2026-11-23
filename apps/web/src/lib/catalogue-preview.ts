import type { ProductQuery, ProductSummary } from '@/lib/data'
import { groupMapBusinesses } from './catalogue-map'

export function isCataloguePreview(env: Record<string, string | undefined> = process.env) {
  if (env.DESANARA_UI_PREVIEW !== '1') return false
  return env.VERCEL_ENV ? env.VERCEL_ENV === 'preview' : env.NODE_ENV === 'development'
}

export const previewCategories = [
  { slug: 'makanan-camilan', name: 'Makanan', nameEn: 'Food', icon: 'utensils' },
  { slug: 'minuman', name: 'Minuman', nameEn: 'Drinks', icon: 'cup' },
  { slug: 'kerajinan', name: 'Kerajinan', nameEn: 'Crafts', icon: 'scissors' },
]

export const previewRegency = { code: '32.04', name: 'Kabupaten Bandung' }

// Village centres from packages/db/data/regions/regions.csv.gz, rounded for the public preview.
const previewMapPoints = [
  { slug: 'desa-bojongsoang', lat: -6.9881, lng: 107.6429 },
  { slug: 'desa-baros', lat: -7.0658, lng: 107.6302 },
  { slug: 'desa-mekarwangi', lat: -7.1124, lng: 107.7877 },
]

const entries = [
  {
    slug: 'keripik-singkong',
    name: 'Keripik singkong',
    nameEn: 'Cassava chips',
    price: 15000,
    village: 'Desa Mekarwangi',
    business: 'Dapur Bu Euis',
    category: 'makanan-camilan',
    photo: 'chips-b.webp',
    storyPhoto: 'chips-a.webp',
    caption: 'chips',
    description: 'Keripik singkong renyah yang cocok untuk camilan dan oleh-oleh.',
    descriptionEn: 'Crispy cassava chips for snacking or gifting.',
  },
  {
    slug: 'kopi-baros',
    name: 'Kopi Baros',
    nameEn: 'Baros coffee',
    price: 25000,
    village: 'Desa Baros',
    business: 'Kopi Baros',
    category: 'minuman',
    photo: 'coffee-beans.webp',
    storyPhoto: 'coffee-beans.webp',
    caption: 'coffee',
    description: 'Biji kopi dari Desa Baros untuk diseduh di rumah.',
    descriptionEn: 'Coffee beans from Baros to brew at home.',
  },
  {
    slug: 'besek-bambu',
    name: 'Besek bambu',
    nameEn: 'Woven bamboo box',
    price: 35000,
    village: 'Desa Baros',
    business: 'Anyaman Pak Ujang',
    category: 'kerajinan',
    photo: 'besek.webp',
    storyPhoto: 'besek-trays.webp',
    caption: 'bamboo',
    description:
      'Besek bambu yang dianyam tangan untuk kemasan makanan, bingkisan, atau oleh-oleh.',
    descriptionEn: 'A handwoven bamboo box for food, gifts, or souvenirs.',
  },
  {
    slug: 'dodol-ketan',
    name: 'Dodol ketan',
    nameEn: 'Glutinous rice dodol',
    price: 28000,
    village: 'Desa Bojongsoang',
    business: 'Dodol Ibu Rina',
    category: 'makanan-camilan',
    photo: 'dodol.webp',
    description: 'Dodol ketan bertekstur kenyal untuk suguhan dan oleh-oleh.',
    descriptionEn: 'Chewy glutinous rice dodol for sharing or gifting.',
  },
] as const

function toProduct(entry: (typeof entries)[number]): ProductSummary {
  const village = entry.village.toLowerCase().replaceAll(' ', '-')
  return {
    id: entry.slug,
    slug: entry.slug,
    name: entry.name,
    nameEn: entry.nameEn,
    price: entry.price,
    compareAtPrice: null,
    isFree: false,
    isAvailable: true,
    imageKey: `seed/products/${entry.photo}`,
    isSeed: true,
    category: previewCategories.find((category) => category.slug === entry.category) ?? null,
    business: { name: entry.business, slug: entry.business.toLowerCase().replaceAll(' ', '-') },
    village: { name: entry.village, slug: village, accent: '#387b4c', isSeed: true },
  }
}

export const previewProducts = entries.map(toProduct)
export const previewStories = [entries[2], entries[0], entries[1]].map((entry) => ({
  product: toProduct(entry),
  image: `/media/seed/products/${entry.storyPhoto}`,
  caption: entry.caption,
}))

export function getPreviewProduct(slug: string) {
  const entry = entries.find((candidate) => candidate.slug === slug)
  if (!entry) return null
  const summary = toProduct(entry)

  return {
    product: {
      ...summary,
      description: entry.description,
      descriptionEn: entry.descriptionEn,
      images: [{ key: `seed/products/${entry.photo}`, alt: null }],
      more: [],
    },
    business: {
      ...summary.business,
      whatsappNumber: null,
      verifiedAt: null,
      openingHours: null,
      closedUntil: null,
      closedNote: null,
      village: { ...summary.village, theme: null, regionName: null, timezone: 'Asia/Jakarta' },
    },
  }
}

export function searchPreviewProducts({
  q,
  category,
  region,
  village,
  sort,
  page = 1,
  pageSize = 20,
}: ProductQuery) {
  const term = q?.toLowerCase()
  const data = previewProducts.filter((product) => {
    const matchesTerm =
      !term ||
      [product.name, product.nameEn, product.business.name, product.village.name].some((name) =>
        name?.toLowerCase().includes(term),
      )
    return (
      matchesTerm &&
      (!category || product.category?.slug === category) &&
      (!region || region === previewRegency.code) &&
      (!village || product.village.slug === village)
    )
  })
  if (sort === 'price_asc') data.sort((a, b) => a.price - b.price)
  if (sort === 'price_desc') data.sort((a, b) => b.price - a.price)
  return {
    data: data.slice((page - 1) * pageSize, page * pageSize),
    meta: { page, pageSize, total: data.length },
  }
}

export function groupPreviewMapBusinesses(products: ProductSummary[]) {
  return groupMapBusinesses(products, previewMapPoints)
}
