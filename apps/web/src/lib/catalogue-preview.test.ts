import { expect, test } from 'bun:test'
import { groupMapBusinesses } from './catalogue-map'
import {
  getPreviewBusiness,
  getPreviewProduct,
  getPreviewVillageBusinesses,
  groupPreviewMapBusinesses,
  isCataloguePreview,
  previewProducts,
  previewStories,
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

test('each mock story opens its matching detail and uses locally available demo media', async () => {
  expect(previewStories).toHaveLength(11)
  expect(new Set(previewStories.map(({ product }) => product.business.slug)).size).toBe(
    previewStories.length,
  )
  for (const story of previewStories) {
    const entry = getPreviewProduct(story.product.slug)
    expect(entry?.product.isSeed).toBe(true)
    expect(entry?.product.price).toBe(story.product.price)
    expect(entry?.product.images[0]?.key).toBe(story.product.imageKey ?? undefined)
    for (const { key } of entry?.product.images ?? []) {
      expect(await Bun.file(new URL(`../../public/media/${key}`, import.meta.url)).exists()).toBe(
        true,
      )
    }
    expect(await Bun.file(new URL(`../../public${story.image}`, import.meta.url)).exists()).toBe(
      true,
    )
  }
})

test('Baros leads the mock villages and links its local media, sellers and products', async () => {
  const baros = previewVillages[0]!
  expect(baros.slug).toBe('desa-baros')
  expect(getPreviewProduct('kopi-baros')?.product.images).toHaveLength(3)
  expect(
    await Bun.file(new URL(`../../public/media/${baros.bannerKey}`, import.meta.url)).exists(),
  ).toBe(true)
  for (const village of previewVillages) {
    const businesses = getPreviewVillageBusinesses(village.slug)
    expect(village.isSeed).toBe(true)
    expect(
      await Bun.file(new URL(`../../public/media/${village.logoKey}`, import.meta.url)).exists(),
    ).toBe(true)
    expect(businesses.length).toBe(village.businessCount)
    expect(businesses.length).toBeGreaterThan(0)
    for (const business of businesses) {
      expect(getPreviewBusiness(business.slug)?.village.slug).toBe(village.slug)
      expect(searchPreviewProducts({ business: business.slug }).meta.total).toBe(
        business.productCount,
      )
    }
  }
})

test('mock catalogue searches both locales and applies filter, order and pagination', () => {
  expect(searchPreviewProducts({ q: 'cassava', category: 'makanan-camilan' }).data[0]?.slug).toBe(
    'keripik-singkong',
  )
  expect(searchPreviewProducts({ q: 'cassava', category: 'minuman' }).meta.total).toBe(0)
  expect(searchPreviewProducts({ sort: 'price_desc', page: 2, pageSize: 1 }).data[0]?.slug).toBe(
    'dodol-ketan',
  )
})

test('map marker counts unique matching businesses and its village results keep other filters', () => {
  const baros = searchPreviewProducts({ village: 'desa-baros' }).data
  expect(baros.map(({ slug }) => slug)).toEqual(['kopi-baros', 'besek-bambu'])
  const groups = groupPreviewMapBusinesses([...baros, ...baros])
  expect(groups.map(({ slug, businesses }) => [slug, businesses.length])).toEqual([
    ['desa-baros', 2],
  ])
  expect(searchPreviewProducts({ village: 'desa-baros', category: 'kerajinan' }).meta.total).toBe(1)
  expect(groupPreviewMapBusinesses(previewProducts)).toHaveLength(3)
})

test('only villages with known map coordinates receive a marker', () => {
  const points = [{ slug: 'desa-baros', lat: -7.0658, lng: 107.6302 }]
  const markers = groupMapBusinesses(previewProducts, points)
  expect(markers.map(({ slug, businesses }) => [slug, businesses.length])).toEqual([
    ['desa-baros', 2],
  ])
})
