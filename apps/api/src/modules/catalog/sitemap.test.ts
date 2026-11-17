import { expect, test } from 'bun:test'
import { createTestApp, describeDb } from '../../test/db'

/** The sitemap must list exactly what the public endpoints serve: nothing hidden leaks, nothing public is missed. */
describeDb('/v1/sitemap', () => {
  const { app } = createTestApp()

  type Entry = { slug: string; updatedAt: string; villageSlug?: string }
  type Body = { data: { villages: Entry[]; businesses: Entry[]; products: Entry[] } }
  const json = async <T>(path: string) => (await (await app.request(path)).json()) as T
  const sorted = (xs: string[]) => [...xs].sort()

  test('lists the same villages, businesses and products as the public endpoints', async () => {
    const res = await app.request('/v1/sitemap')
    expect(res.status).toBe(200)
    expect(res.headers.get('cache-control')).toContain('s-maxage')
    const { data } = (await res.json()) as Body

    const villages = await json<{ data: { slug: string }[]; meta: { total: number } }>(
      '/v1/villages?pageSize=50',
    )
    expect(sorted(data.villages.map((v) => v.slug))).toEqual(
      sorted(villages.data.map((v) => v.slug)),
    )

    // One request per village (a handful), not per business.
    const perVillage = await Promise.all(
      villages.data.map(async (v) => {
        const r = await json<{ data: { slug: string }[] }>(`/v1/villages/${v.slug}/businesses`)
        return r.data.map((b) => `${v.slug}/${b.slug}`)
      }),
    )
    expect(sorted(data.businesses.map((b) => `${b.villageSlug}/${b.slug}`))).toEqual(
      sorted(perVillage.flat()),
    )

    const search = await json<{ meta: { total: number } }>('/v1/products?pageSize=1')
    expect(data.products.length).toBe(search.meta.total)
    expect(new Set(data.products.map((p) => p.slug)).size).toBe(data.products.length)

    for (const e of [...data.villages, ...data.businesses, ...data.products]) {
      expect(Number.isNaN(Date.parse(e.updatedAt))).toBe(false)
    }
  })
})
