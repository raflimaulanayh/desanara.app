import { expect, test } from 'bun:test'
import { villageCrest } from './village-crest'
import {
  groupMapBusinesses,
  groupNearbyVillages,
  mapBusinessPins,
  pinFanOffsets,
  villageSplitZoom,
} from './catalogue-map'
import {
  getPreviewBusiness,
  getPreviewProduct,
  getPreviewVillageBusinesses,
  groupPreviewMapBusinesses,
  isCataloguePreview,
  previewBusinessLocations,
  previewProducts,
  previewStoryAccounts,
  previewVillages,
  searchPreviewProducts,
} from './catalogue-preview'

test('mock catalogue requires opt-in and runs only in development or Vercel Preview', () => {
  const optIn = { DESANARA_UI_PREVIEW: '1' }
  expect(isCataloguePreview({ ...optIn, NODE_ENV: 'development' })).toBe(true)
  expect(isCataloguePreview({ ...optIn, VERCEL_ENV: 'preview', NODE_ENV: 'production' })).toBe(true)
  expect(isCataloguePreview({ ...optIn, VERCEL_ENV: 'production' })).toBe(false)
  expect(isCataloguePreview({ ...optIn, NODE_ENV: 'production' })).toBe(false)
  expect(isCataloguePreview({ VERCEL_ENV: 'preview' })).toBe(false)
})

test('mock stories stay with their business and use locally available demo media', async () => {
  expect(previewStoryAccounts).toHaveLength(11)
  expect(new Set(previewStoryAccounts.map(({ id }) => id)).size).toBe(11)
  expect(
    previewStoryAccounts.find(({ business }) => business === 'Kopi Baros')?.stories,
  ).toHaveLength(3)
  const stories = previewStoryAccounts.flatMap(({ id, stories }) => {
    expect(stories.length).toBeGreaterThan(0)
    for (const { product } of stories) expect(product.business.slug).toBe(id)
    return stories
  })
  expect(stories).toHaveLength(19)
  expect(stories.filter(({ status }) => status).map(({ status }) => status)).toEqual([
    'preorder',
    'shop-open',
  ])
  expect(stories.filter(({ image }) => !image)).toHaveLength(2)
  const video = stories.find(({ video }) => video)
  expect(video?.catalogueSlug).toBe('anyaman-bambu-pak-ujang-besek-bambu-isi-10')
  expect(await Bun.file(new URL(`../../public${video?.video}`, import.meta.url)).exists()).toBe(
    true,
  )
  expect(new Set(stories.map(({ id }) => id)).size).toBe(stories.length)
  for (const story of stories) {
    const entry = getPreviewProduct(story.product.slug)
    expect(entry?.product.isSeed).toBe(true)
    expect(entry?.product.price).toBe(story.product.price)
    expect(entry?.product.images[0]?.key).toBe(story.product.imageKey ?? undefined)
    for (const { key } of entry?.product.images ?? []) {
      expect(await Bun.file(new URL(`../../public/media/${key}`, import.meta.url)).exists()).toBe(
        true,
      )
    }
    if (story.image) {
      expect(await Bun.file(new URL(`../../public${story.image}`, import.meta.url)).exists()).toBe(
        true,
      )
    }
  }
})

test('Baros leads the mock villages and links its local media, sellers and products', async () => {
  const baros = previewVillages[0]!
  expect(previewVillages).toHaveLength(27)
  expect(new Set(previewVillages.map(({ slug }) => slug)).size).toBe(27)
  expect(baros.slug).toBe('desa-baros')
  expect(getPreviewProduct('kopi-baros')?.product.images).toHaveLength(3)
  expect(
    await Bun.file(new URL(`../../public/media/${baros.bannerKey}`, import.meta.url)).exists(),
  ).toBe(true)
  for (const village of previewVillages) {
    const crest = villageCrest(village, true)
    const businesses = getPreviewVillageBusinesses(village.slug)
    expect(village.isSeed).toBe(true)
    expect(await Bun.file(new URL(`../../public${crest.url}`, import.meta.url)).exists()).toBe(true)
    expect(businesses.length).toBe(village.businessCount)
    for (const business of businesses) {
      expect(getPreviewBusiness(business.slug)?.village.slug).toBe(village.slug)
      expect(searchPreviewProducts({ business: business.slug }).meta.total).toBe(
        business.productCount,
      )
    }
  }
  expect(getPreviewVillageBusinesses(baros.slug).length).toBeGreaterThan(0)
})

test('mock catalogue searches both locales and applies filter, order and pagination', () => {
  expect(searchPreviewProducts({ q: 'cassava', category: 'makanan-camilan' }).data[0]?.slug).toBe(
    'keripik-singkong',
  )
  expect(searchPreviewProducts({ q: 'cassava', category: 'minuman' }).meta.total).toBe(0)
  expect(
    searchPreviewProducts({ village: 'desa-bojongsoang', sort: 'price_desc', page: 1, pageSize: 1 })
      .data[0]?.slug,
  ).toBe('dodol-ketan')
})

test('map marker counts unique matching businesses and its village results keep other filters', () => {
  const baros = searchPreviewProducts({ village: 'desa-baros' }).data
  expect(baros.map(({ slug }) => slug)).toEqual(['kopi-baros', 'besek-bambu'])
  const groups = groupPreviewMapBusinesses([...baros, ...baros])
  expect(groups.map(({ slug, businesses }) => [slug, businesses.length])).toEqual([
    ['desa-baros', 2],
  ])
  expect(searchPreviewProducts({ village: 'desa-baros', category: 'kerajinan' }).meta.total).toBe(1)
  expect(groupPreviewMapBusinesses(previewProducts)).toHaveLength(27)
  const garut = searchPreviewProducts({ region: '32.05' }).data
  expect(groupPreviewMapBusinesses(garut)).toHaveLength(6)
  expect(searchPreviewProducts({ region: '32.05', village: 'desa-cipacing' }).data).toEqual([])
  expect(
    groupPreviewMapBusinesses(
      searchPreviewProducts({ region: '32.11', village: 'desa-cipacing' }).data,
    ).map(({ slug }) => slug),
  ).toEqual(['desa-cipacing'])
})

test('only villages with known map coordinates receive a marker', () => {
  const points = [{ slug: 'desa-baros', lat: -7.0658, lng: 107.6302 }]
  const markers = groupMapBusinesses(previewProducts, points)
  expect(markers.map(({ slug, businesses }) => [slug, businesses.length])).toEqual([
    ['desa-baros', 2],
  ])
})

test('business pins use only the provided shop coordinates and match the filtered products', () => {
  const products = searchPreviewProducts({ village: 'desa-baros' }).data
  expect(mapBusinessPins(products)).toEqual([])
  const coffeeLocation = previewBusinessLocations.get('kopi-baros')!
  const locations = new Map([
    ['kopi-baros', coffeeLocation],
    ['unrelated', { lat: -7.1, lng: 107.7 }],
  ])
  expect(mapBusinessPins(products, locations)).toEqual([
    {
      ...coffeeLocation,
      slug: 'business:kopi-baros',
      name: 'Kopi Baros',
      href: '/produk/kopi-baros',
    },
  ])
})

test('nearby pins group at the current scale and the selected village keeps its own marker', () => {
  const locations = [
    { slug: 'desa-baros', lat: 0, lng: 0 },
    { slug: 'desa-baru', lat: 0, lng: 20 },
    { slug: 'desa-jauh', lat: 0, lng: 60 },
  ]
  const project =
    (scale: number) =>
    ({ lng, lat }: { lng: number; lat: number }) => ({
      x: lng * scale,
      y: lat * scale,
    })
  expect(groupNearbyVillages(locations, project(1)).map(({ members }) => members.length)).toEqual([
    2, 1,
  ])
  expect(groupNearbyVillages(locations, project(3))).toHaveLength(3)
  expect(groupNearbyVillages(locations, project(1), 'desa-baru')).toHaveLength(3)
})

test('tapping a tight cluster reaches the first separating scale and caps coincident points', () => {
  const villages = [
    { slug: 'a', lat: 0, lng: 0 },
    { slug: 'b', lat: 0, lng: 4 },
  ]
  const project = ({ lng, lat }: (typeof villages)[number], zoom: number) => ({
    x: lng * 2 ** (zoom - 10),
    y: lat * 2 ** (zoom - 10),
  })
  expect(villageSplitZoom(villages, 10, project)).toBe(13.5)
  expect(villageSplitZoom([villages[0]!, { slug: 'b', lat: 0, lng: 0 }], 10, project)).toBe(19)
  expect(pinFanOffsets(2)).toEqual([
    { x: 64, y: 0 },
    { x: -64, y: 0 },
  ])
  expect(new Set(pinFanOffsets(20).map(({ x, y }) => `${x},${y}`)).size).toBe(20)
})
