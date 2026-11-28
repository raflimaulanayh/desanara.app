import { ApiError } from '@repo/api-client'
import { expect, spyOn, test } from 'bun:test'
import {
  getMapProducts,
  getStoryProduct,
  getVillageDirectory,
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

test('load more keeps previously visible villages alongside the next batch', async () => {
  const villages = Array.from({ length: 27 }, (_, index) => ({ slug: `desa-${index + 1}` }))
  const fetch = spyOn(globalThis, 'fetch')
    .mockResolvedValueOnce(Response.json({ data: villages.slice(0, 12), meta: { total: 27 } }))
    .mockResolvedValueOnce(Response.json({ data: villages.slice(0, 24), meta: { total: 27 } }))
  try {
    const first = await getVillageDirectory(1, '')
    const more = await getVillageDirectory(2, '')
    expect(first.data).toHaveLength(12)
    expect(more.data).toHaveLength(24)
    expect(more.data.slice(0, 12)).toEqual(first.data)
    expect(more.total).toBe(27)
    expect(
      fetch.mock.calls.map(([url]) => new URL(String(url)).searchParams.get('pageSize')),
    ).toEqual(['12', '24'])
  } finally {
    fetch.mockRestore()
  }
})

test('village search finds names beyond the first API page with multiple case-insensitive terms', async () => {
  const fetch = spyOn(globalThis, 'fetch')
    .mockResolvedValueOnce(Response.json({ data: [{ name: 'Desa Baros' }], meta: { total: 51 } }))
    .mockResolvedValueOnce(
      Response.json({ data: [{ name: 'Desa Cileunyi Wetan' }], meta: { total: 51 } }),
    )
  try {
    expect(await getVillageDirectory(1, 'WETAN cileunyi')).toMatchObject({
      data: [{ name: 'Desa Cileunyi Wetan' }],
      total: 1,
    })
  } finally {
    fetch.mockRestore()
  }
})

test('the directory map includes every village matching search and regency across API pages', async () => {
  const matching = Array.from({ length: 13 }, (_, index) => ({
    name: `Desa Mekar ${index + 1}`,
    regionCode: '32.04.05.2001',
  }))
  const fetch = spyOn(globalThis, 'fetch')
    .mockResolvedValueOnce(
      Response.json({
        data: [
          ...matching.slice(0, 12),
          { name: 'Desa Mekar Garut', regionCode: '32.05.03.2011' },
          { name: 'Desa Baros', regionCode: '32.04.16.2005' },
        ],
        meta: { total: 51 },
      }),
    )
    .mockResolvedValueOnce(Response.json({ data: matching.slice(12), meta: { total: 51 } }))

  try {
    expect(await getVillageDirectory(undefined, 'mekar', '32.04')).toMatchObject({
      data: matching,
      total: 13,
    })
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
