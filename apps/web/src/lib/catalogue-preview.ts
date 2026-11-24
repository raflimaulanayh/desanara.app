import { DEFAULT_VILLAGE_THEME } from '@repo/validators'
import type { ProductQuery, ProductSummary, VillageDetail } from '@/lib/data'
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

interface PreviewEntry {
  slug: string
  name: string
  nameEn: string
  price: number
  village: string
  business: string
  category: string
  photo: string
  storyPhoto?: string
  gallery?: string[]
  caption: string
  description: string
  descriptionEn: string
}

const entries: PreviewEntry[] = [
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
    gallery: ['chips-a.webp'],
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
    gallery: ['coffee-ground.webp', 'coffee-iced.webp'],
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
    gallery: ['besek-trays.webp'],
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
    caption: 'dodol',
    description: 'Dodol ketan bertekstur kenyal untuk suguhan dan oleh-oleh.',
    descriptionEn: 'Chewy glutinous rice dodol for sharing or gifting.',
  },
  {
    slug: 'sale-pisang',
    name: 'Sale pisang',
    nameEn: 'Dried banana',
    price: 18000,
    village: 'Desa Mekarwangi',
    business: 'Pawon Pisang',
    category: 'makanan-camilan',
    photo: 'sale-a.webp',
    gallery: ['sale-b.webp'],
    caption: 'sale-pisang',
    description: 'Irisan pisang matang yang dikeringkan, manis alami dan sedikit kenyal.',
    descriptionEn: 'Dried slices of ripe banana with a naturally sweet, chewy bite.',
  },
  {
    slug: 'bandrek-jahe',
    name: 'Bandrek jahe',
    nameEn: 'Ginger bandrek',
    price: 22000,
    village: 'Desa Bojongsoang',
    business: 'Dapur Rempah',
    category: 'minuman',
    photo: 'bandrek.webp',
    caption: 'bandrek-jahe',
    description: 'Minuman jahe dan gula aren dengan aroma kayu manis. Seduh dengan air panas.',
    descriptionEn: 'A warming ginger drink with palm sugar and cinnamon. Just add hot water.',
  },
  {
    slug: 'keripik-ubi',
    name: 'Keripik ubi',
    nameEn: 'Sweet potato chips',
    price: 16000,
    village: 'Desa Mekarwangi',
    business: 'Pawon Ubi',
    category: 'makanan-camilan',
    photo: 'ubi-chips.webp',
    caption: 'keripik-ubi',
    description: 'Ubi diiris tipis dan digoreng hingga renyah. Cocok untuk camilan atau oleh-oleh.',
    descriptionEn: 'Thin-cut sweet potatoes fried until crisp, for snacking or gifting.',
  },
  {
    slug: 'telur-asin',
    name: 'Telur asin',
    nameEn: 'Salted eggs',
    price: 12000,
    village: 'Desa Bojongsoang',
    business: 'Telur Asin Bu Sari',
    category: 'makanan-camilan',
    photo: 'egg-salted.webp',
    caption: 'telur-asin',
    description: 'Telur bebek asin dengan kuning telur yang gurih. Enak untuk teman nasi hangat.',
    descriptionEn: 'Salted duck eggs with rich, savoury yolks, best served with warm rice.',
  },
  {
    slug: 'madu-kebun',
    name: 'Madu kebun',
    nameEn: 'Garden honey',
    price: 24000,
    village: 'Desa Mekarwangi',
    business: 'Kebun Madu',
    category: 'makanan-camilan',
    photo: 'honey-a.webp',
    gallery: ['honey-b.webp'],
    caption: 'madu-kebun',
    description: 'Madu dari kebun, cocok untuk campuran teh, roti, atau sarapan.',
    descriptionEn: 'Garden honey for stirring into tea or drizzling over toast.',
  },
  {
    slug: 'sendok-kayu',
    name: 'Sendok kayu',
    nameEn: 'Wooden spoon',
    price: 20000,
    village: 'Desa Bojongsoang',
    business: 'Kayu Rupa',
    category: 'kerajinan',
    photo: 'spoons.webp',
    caption: 'sendok-kayu',
    description: 'Sendok kayu yang dihaluskan dengan tangan untuk mengaduk dan menyajikan makanan.',
    descriptionEn: 'A hand-sanded wooden spoon for stirring and serving.',
  },
  {
    slug: 'dompet-kulit',
    name: 'Dompet kulit',
    nameEn: 'Leather wallet',
    price: 23000,
    village: 'Desa Mekarwangi',
    business: 'Rupa Kulit',
    category: 'kerajinan',
    photo: 'wallet.webp',
    caption: 'dompet-kulit',
    description: 'Dompet kulit jahit tangan dengan ruang untuk kartu dan uang kertas.',
    descriptionEn: 'A hand-stitched leather wallet with space for cards and notes.',
  },
]

function toProduct(entry: PreviewEntry): ProductSummary {
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

export function getPreviewVillageBusinesses(slug: string) {
  const sellers = new Map<string, { business: ProductSummary['business']; count: number }>()
  for (const { village, business } of previewProducts) {
    if (village.slug !== slug) continue
    const seller = sellers.get(business.slug)
    if (seller) seller.count++
    else sellers.set(business.slug, { business, count: 1 })
  }
  return [...sellers.values()].map(({ business, count }) => ({
    ...business,
    id: business.slug,
    ownerName: null,
    description: null,
    logoKey: null,
    whatsappNumber: null,
    shopeeUrl: null,
    tokopediaUrl: null,
    tiktokShopUrl: null,
    instagramUrl: null,
    openingHours: null,
    closedUntil: null,
    closedNote: null,
    verifiedAt: null,
    productCount: count,
    isSeed: true,
  }))
}

const bandungCrest = 'seed/villages/bandung-regency.webp'

export const previewVillages: VillageDetail[] = [
  {
    slug: 'desa-baros',
    name: 'Desa Baros',
    regionCode: '32.04.16.2005',
    regionName: 'Kec. Arjasari, Kabupaten Bandung',
    logoKey: 'seed/villages/baros/logo.webp',
    bannerKey: 'seed/villages/baros/banner.webp',
  },
  {
    slug: 'desa-bojongsoang',
    name: 'Desa Bojongsoang',
    regionCode: '32.04.08.2002',
    regionName: 'Kec. Bojongsoang, Kabupaten Bandung',
    logoKey: bandungCrest,
    bannerKey: null,
  },
  {
    slug: 'desa-mekarwangi',
    name: 'Desa Mekarwangi',
    regionCode: '32.04.36.2008',
    regionName: 'Kec. Ibun, Kabupaten Bandung',
    logoKey: bandungCrest,
    bannerKey: null,
  },
].map((village) => ({
  ...village,
  id: village.slug,
  description: null,
  businessCount: getPreviewVillageBusinesses(village.slug).length,
  address: null,
  contactPhone: null,
  contactEmail: null,
  timezone: 'Asia/Jakarta',
  accent: '#387b4c',
  isSeed: true,
  theme: { ...DEFAULT_VILLAGE_THEME, accent: '#387b4c', radius: 'rounded' },
}))

export function getPreviewBusiness(slug: string) {
  for (const village of previewVillages) {
    const business = getPreviewVillageBusinesses(village.slug).find((item) => item.slug === slug)
    if (business) return { ...business, village }
  }
  return null
}

export const previewStories = entries.map((entry) => ({
  product: toProduct(entry),
  image: `/media/seed/products/${entry.storyPhoto ?? entry.photo}`,
  caption: entry.caption,
}))

export function getPreviewProduct(slug: string) {
  const entry = entries.find((candidate) => candidate.slug === slug)
  if (!entry) return null
  const summary = toProduct(entry)
  const business = getPreviewBusiness(summary.business.slug)
  if (!business) return null

  return {
    product: {
      ...summary,
      description: entry.description,
      descriptionEn: entry.descriptionEn,
      images: [entry.photo, ...(entry.gallery ?? [])].map((photo) => ({
        key: `seed/products/${photo}`,
        alt: null,
      })),
      more: [],
    },
    business,
  }
}

export function searchPreviewProducts({
  q,
  category,
  region,
  village,
  business,
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
      (!village || product.village.slug === village) &&
      (!business || product.business.slug === business)
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
