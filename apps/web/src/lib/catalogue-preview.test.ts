import { expect, test } from 'bun:test'
import {
  getPreviewProduct,
  groupPreviewMapBusinesses,
  isCataloguePreview,
  previewProducts,
  previewStories,
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
  for (const story of previewStories) {
    const entry = getPreviewProduct(story.product.slug)
    expect(entry?.product.isSeed).toBe(true)
    expect(entry?.product.price).toBe(story.product.price)
    expect(entry?.product.images[0]?.key).toBe(story.product.imageKey ?? undefined)
    expect(await Bun.file(new URL(`../../public${story.image}`, import.meta.url)).exists()).toBe(
      true,
    )
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
