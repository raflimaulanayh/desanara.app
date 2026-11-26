import { ApiError } from '@repo/api-client'
import { expect, spyOn, test } from 'bun:test'
import {
  getMapProducts,
  getStoryProduct,
  getVillagesForFilter,
  readSection,
  searchProducts,
} from './data'

test('story product links collapse when the catalogue listing is no longer public', async () => {
  const product = { slug: 'woven-box' }
  const fetch = spyOn(globalThis, 'fetch')
    .mockResolvedValueOnce(Response.json({ data: product }))
    .mockResolvedValueOnce(new Response(null, { status: 404 }))

  try {
    expect((await getStoryProduct('woven-box'))?.slug).toBe(product.slug)
    expect(await getStoryProduct('unpublished-item')).toBeNull()
  } finally {
    fetch.mockRestore()
  }
})

test('explore separates an empty product response from a service failure', async () => {
  const empty = { data: [], meta: { page: 1, pageSize: 20, total: 0 } }
  const fetch = spyOn(globalThis, 'fetch')
    .mockResolvedValueOnce(Response.json(empty))
    .mockResolvedValueOnce(new Response(null, { status: 503 }))

  try {
    expect(await readSection(searchProducts({ q: 'kopi' }))).toEqual(empty)
    expect(await readSection(searchProducts({ q: 'kopi' }))).toBeNull()
  } finally {
    fetch.mockRestore()
  }
})

test('catalogue sections handle transport failures and propagate unexpected exceptions', async () => {
  expect(await readSection(Promise.reject(new TypeError('fetch failed')))).toBeNull()
  const unexpected = new Error('unexpected failure')
  await expect(readSection(Promise.reject(unexpected))).rejects.toBe(unexpected)
})

test('the village selector includes options from subsequent public directory pages', async () => {
  const first = { slug: 'desa-baros' }
  const last = { slug: 'desa-cipacing' }
  const fetch = spyOn(globalThis, 'fetch')
    .mockResolvedValueOnce(
      Response.json({ data: [first], meta: { page: 1, pageSize: 50, total: 51 } }),
    )
    .mockResolvedValueOnce(
      Response.json({ data: [last], meta: { page: 2, pageSize: 50, total: 51 } }),
    )
  try {
    expect((await getVillagesForFilter()).map(({ slug }) => slug)).toEqual([first.slug, last.slug])
    expect(new URL(String(fetch.mock.calls[1]?.[0])).searchParams.get('page')).toBe('2')
  } finally {
    fetch.mockRestore()
  }
})

test('a failed subsequent map page retains the first page and reports partial results', async () => {
  const product = { id: 'sample-product' }
  const fetch = spyOn(globalThis, 'fetch')
    .mockResolvedValueOnce(
      Response.json({ data: [product], meta: { page: 1, pageSize: 50, total: 51 } }),
    )
    .mockResolvedValueOnce(new Response(null, { status: 503 }))
    .mockResolvedValueOnce(new Response(null, { status: 503 }))

  try {
    expect(await getMapProducts({})).toMatchObject({ data: [product], incomplete: true })
    await expect(getMapProducts({})).rejects.toBeInstanceOf(ApiError)
  } finally {
    fetch.mockRestore()
  }
})
