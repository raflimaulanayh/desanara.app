import { DEFAULT_VILLAGE_THEME } from '@repo/validators'
import type { ProductQuery, ProductSummary, VillageDetail } from '@/lib/data'
import { groupMapBusinesses, type MapCoordinates } from './catalogue-map'
import { regencyCode } from './explore-filters'
import type { StoryStatus } from './story-order'

export function isCataloguePreview(env: Record<string, string | undefined> = process.env) {
  if (env.DESANARA_UI_PREVIEW !== '1') return false
  return env.VERCEL_ENV ? env.VERCEL_ENV === 'preview' : env.NODE_ENV === 'development'
}

export const previewCategories = [
  { slug: 'makanan-camilan', name: 'Makanan', nameEn: 'Food', icon: 'utensils' },
  { slug: 'minuman', name: 'Minuman', nameEn: 'Drinks', icon: 'cup' },
  { slug: 'kerajinan', name: 'Kerajinan', nameEn: 'Crafts', icon: 'scissors' },
]

// Village centres from packages/db/data/regions/regions.csv.gz, rounded for the public preview.
const previewMapPoints = [
  { slug: 'desa-bojongsoang', lat: -6.9881, lng: 107.6429 },
  { slug: 'desa-baros', lat: -7.0658, lng: 107.6302 },
  { slug: 'desa-mekarwangi', lat: -7.1124, lng: 107.7877 },
]

// Fictional storefront points for the two mock Baros businesses. They are used only in catalogue preview.
export const previewBusinessLocations: ReadonlyMap<string, MapCoordinates> = new Map([
  ['anyaman-pak-ujang', { lat: -7.0648, lng: 107.6294 }],
  ['kopi-baros', { lat: -7.0671, lng: 107.6327 }],
])

interface PreviewEntry {
  slug: string
  name: string
  nameEn: string
  price: number
  village: string
  business: string
  category: string
  photo: string
  gallery?: string[]
  catalogueSlug?: string
  stories: ({
    caption: string
    minutesAgo: number
    status?: StoryStatus
  } & (
    { image: string; video?: string; id?: never } | { id: string; image?: never; video?: never }
  ))[]
  description: string
  descriptionEn: string
}

const storyEntries: PreviewEntry[] = [
  {
    slug: 'keripik-singkong',
    name: 'Keripik singkong',
    nameEn: 'Cassava chips',
    price: 15000,
    village: 'Desa Mekarwangi',
    business: 'Dapur Bu Euis',
    category: 'makanan-camilan',
    photo: 'chips-b.webp',
    gallery: ['chips-a.webp'],
    stories: [
      { image: 'cassava-frying', caption: 'chips-frying', minutesAgo: 95 },
      { image: 'cassava-packing', caption: 'chips-packing', minutesAgo: 47 },
      { image: 'cassava-ready', caption: 'chips', minutesAgo: 2 },
      { id: 'cassava-note', caption: 'chips-note', minutesAgo: 1, status: 'preorder' },
    ],
    description: 'Keripik singkong renyah yang cocok untuk camilan dan oleh-oleh.',
    descriptionEn: 'Crispy cassava chips for snacking or gifting.',
  },
  {
    slug: 'kopi-baros',
    catalogueSlug: 'kopi-gunung-baros-arabika-biji-200g',
    name: 'Kopi Baros',
    nameEn: 'Baros coffee',
    price: 25000,
    village: 'Desa Baros',
    business: 'Kopi Baros',
    category: 'minuman',
    photo: 'coffee-beans.webp',
    gallery: ['coffee-ground.webp', 'coffee-iced.webp'],
    stories: [
      { image: 'coffee-roasting', caption: 'coffee-roasting', minutesAgo: 110 },
      { image: 'coffee-brewing', caption: 'coffee-brewing', minutesAgo: 64 },
      { image: 'coffee-ready', caption: 'coffee', minutesAgo: 9 },
    ],
    description: 'Biji kopi dari Desa Baros untuk diseduh di rumah.',
    descriptionEn: 'Coffee beans from Baros to brew at home.',
  },
  {
    slug: 'besek-bambu',
    catalogueSlug: 'anyaman-bambu-pak-ujang-besek-bambu-isi-10',
    name: 'Besek bambu',
    nameEn: 'Woven bamboo box',
    price: 35000,
    village: 'Desa Baros',
    business: 'Anyaman Pak Ujang',
    category: 'kerajinan',
    photo: 'besek.webp',
    gallery: ['besek-trays.webp'],
    stories: [
      {
        image: 'bamboo-weaving',
        video: 'bamboo-story.mp4',
        caption: 'bamboo-weaving',
        minutesAgo: 122,
      },
      { image: 'bamboo-finished', caption: 'bamboo', minutesAgo: 76 },
      { image: 'bamboo-detail', caption: 'bamboo-detail', minutesAgo: 16 },
      { id: 'bamboo-note', caption: 'bamboo-note', minutesAgo: 3, status: 'shop-open' },
    ],
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
    stories: [{ image: 'dodol', caption: 'dodol', minutesAgo: 38 }],
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
    stories: [{ image: 'dried-banana', caption: 'sale-pisang', minutesAgo: 25 }],
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
    stories: [{ image: 'ginger-bandrek', caption: 'bandrek-jahe', minutesAgo: 80 }],
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
    stories: [{ image: 'sweet-potato-chips', caption: 'keripik-ubi', minutesAgo: 54 }],
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
    stories: [{ image: 'salted-eggs', caption: 'telur-asin', minutesAgo: 140 }],
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
    stories: [{ image: 'garden-honey', caption: 'madu-kebun', minutesAgo: 71 }],
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
    stories: [{ image: 'wooden-spoons', caption: 'sendok-kayu', minutesAgo: 106 }],
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
    stories: [{ image: 'leather-wallet', caption: 'dompet-kulit', minutesAgo: 180 }],
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
    // Preview mode is fictional and has no review API: a stable rating per slug keeps cards realistic.
    ratingAverage:
      4.5 + (Array.from(entry.slug).reduce((sum, c) => sum + c.charCodeAt(0), 0) % 5) / 10,
    ratingCount: 6 + (entry.slug.length % 17),
    isSeed: true,
    category: previewCategories.find((category) => category.slug === entry.category) ?? null,
    business: { name: entry.business, slug: entry.business.toLowerCase().replaceAll(' ', '-') },
    village: { name: entry.village, slug: village, accent: '#387b4c', isSeed: true },
  }
}

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

// Preview village centres are rounded from packages/db/data/regions/regions.csv.gz.
const additionalVillageLocations: [
  name: string,
  district: string,
  regionCode: string,
  lat: number,
  lng: number,
][] = [
  ['Cileunyi Kulon', 'Cileunyi', '32.04.05.2001', -6.9442, 107.74],
  ['Cileunyi Wetan', 'Cileunyi', '32.04.05.2002', -6.9327, 107.7495],
  ['Cimekar', 'Cileunyi', '32.04.05.2003', -6.9362, 107.7381],
  ['Cinunuk', 'Cileunyi', '32.04.05.2004', -6.932, 107.7329],
  ['Cimenyan', 'Cimenyan', '32.04.06.2003', -6.8587, 107.6693],
  ['Cikadut', 'Cimenyan', '32.04.06.2005', -6.8816, 107.6796],
  ['Ciburial', 'Cimenyan', '32.04.06.2006', -6.8496, 107.6496],
  ['Cilengkrang', 'Cilengkrang', '32.04.07.2002', -6.8907, 107.7338],
  ['Girimekar', 'Cilengkrang', '32.04.07.2006', -6.8713, 107.7045],
  ['Bojongsari', 'Bojongsoang', '32.04.08.2005', -6.9999, 107.6516],
  ['Tegalluar', 'Bojongsoang', '32.04.08.2006', -6.9797, 107.6899],
  ['Sangkanhurip', 'Katapang', '32.04.11.2001', -6.9986, 107.5669],
  ['Wanajaya', 'Wanaraja', '32.05.03.2011', -7.1682, 107.9846],
  ['Sukawening', 'Sukawening', '32.05.15.2001', -7.1487, 108.001],
  ['Ciburuy', 'Bayongbong', '32.05.17.2009', -7.2835, 107.8172],
  ['Cisurupan', 'Cisurupan', '32.05.20.2001', -7.3186, 107.7594],
  ['Cikajang', 'Cikajang', '32.05.22.2001', -7.3611, 107.8066],
  ['Cikandang', 'Cikajang', '32.05.22.2008', -7.3788, 107.7497],
  ['Cikeruh', 'Jatinangor', '32.11.15.2001', -6.9382, 107.775],
  ['Cibeusi', 'Jatinangor', '32.11.15.2003', -6.9301, 107.7618],
  ['Cipacing', 'Jatinangor', '32.11.15.2004', -6.949, 107.7617],
  ['Sayang', 'Jatinangor', '32.11.15.2005', -6.9387, 107.7697],
  ['Cileles', 'Jatinangor', '32.11.15.2011', -6.9137, 107.7738],
  ['Cilayung', 'Jatinangor', '32.11.15.2012', -6.9017, 107.7759],
]

const previewRegencyNames: Record<string, string> = {
  '32.04': 'Kabupaten Bandung',
  '32.05': 'Kabupaten Garut',
  '32.11': 'Kabupaten Sumedang',
}

export const previewRegencies = Object.entries(previewRegencyNames).map(([code, name]) => ({
  code,
  name,
}))

const additionalVillages = additionalVillageLocations.map(
  ([name, district, regionCode, lat, lng]) => ({
    slug: `desa-${name.toLowerCase().replaceAll(' ', '-')}`,
    name: `Desa ${name}`,
    regionCode,
    point: { lat, lng },
    regionName: `Kec. ${district}, ${previewRegencyNames[regionCode.slice(0, 5)]}`,
    logoKey: null,
    bannerKey: null,
  }),
)

const sampleSellers = ['Dapur', 'Kedai', 'Karya']
const additionalProducts = additionalVillages.flatMap((village, index) =>
  storyEntries.slice(0, (index % sampleSellers.length) + 1).map((product, seller) => ({
    ...product,
    slug: `${product.slug}-${village.slug}`,
    village: village.name,
    business: `${sampleSellers[seller]} ${village.name.slice(5)}`,
    catalogueSlug: undefined,
    stories: [],
  })),
)
const entries = [...storyEntries, ...additionalProducts]
export const previewProducts = entries.map(toProduct)

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
  ...additionalVillages.map(({ point: _point, ...village }) => village),
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

interface PreviewStoryAccount {
  id: string
  business: string
  village: string
  stories: {
    id: string
    image?: string
    video?: string
    caption: string
    publishedAt: number
    status?: StoryStatus
    product: ProductSummary
    catalogueSlug?: string
  }[]
}

const previewRegencyByVillage = new Map(
  previewVillages.map((village) => [village.slug, regencyCode(village.regionCode)]),
)

const previewStoryReferenceTime = Date.UTC(2026, 10, 26, 5)
const storyAccounts = new Map<string, PreviewStoryAccount>()
for (const entry of storyEntries) {
  const product = toProduct(entry)
  const id = product.business.slug
  const account = storyAccounts.get(id) ?? {
    id,
    business: product.business.name,
    village: product.village.name,
    stories: [],
  }
  account.stories.push(
    ...entry.stories.map(({ id, image, video, caption, minutesAgo, status }) => ({
      id: image ?? id,
      image: image && `/media/seed/stories/${image}.webp`,
      video: video && `/media/seed/stories/${video}`,
      caption,
      publishedAt: previewStoryReferenceTime - minutesAgo * 60_000,
      status,
      product,
      catalogueSlug: entry.catalogueSlug,
    })),
  )
  storyAccounts.set(id, account)
}
export const previewStoryAccounts = [...storyAccounts.values()]

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
      (!region || region === previewRegencyByVillage.get(product.village.slug)) &&
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

export const previewVillagePoints = [
  ...previewMapPoints,
  ...additionalVillages.map(({ slug, point }) => ({ slug, ...point })),
]

export function groupPreviewMapBusinesses(products: ProductSummary[]) {
  return groupMapBusinesses(products, previewVillagePoints)
}
