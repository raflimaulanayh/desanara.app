import { afterAll, beforeAll, expect, test } from 'bun:test'
import { regions } from '@repo/db'
import { like, or, eq } from 'drizzle-orm'
import { createTestApp, describeDb } from '../../test/db'

/** Province code 99 is unused in Indonesia (highest is 96), so these rows never clash with real data. */
describeDb('/v1/regions', () => {
  const { db, app } = createTestApp()
  const tag = `zq${Date.now().toString(36)}`
  const rows = [
    { code: '99', name: `Prov ${tag}`, level: 'province' as const, parentCode: null },
    { code: '99.01', name: `Kabupaten ${tag}`, level: 'regency' as const, parentCode: '99' },
    { code: '99.01.01', name: `Arjasari${tag}`, level: 'district' as const, parentCode: '99.01' },
    {
      code: '99.01.01.2001',
      name: `Baros${tag}`,
      level: 'village' as const,
      parentCode: '99.01.01',
    },
    {
      code: '99.01.01.2002',
      name: `Mekar${tag}`,
      level: 'village' as const,
      parentCode: '99.01.01',
    },
    {
      code: '99.01.01.2003',
      name: `Lama${tag}`,
      level: 'village' as const,
      parentCode: '99.01.01',
      retiredAt: new Date(),
    },
  ]
  const fullName = (code: string) => {
    const chain: string[] = []
    for (let n = code.split('.').length; n >= 1; n--) {
      const c = code.split('.').slice(0, n).join('.')
      const r = rows.find((x) => x.code === c)!
      chain.push(n === 3 ? `Kec. ${r.name}` : r.name)
    }
    return chain.join(', ')
  }

  beforeAll(async () => {
    await db.delete(regions).where(or(eq(regions.code, '99'), like(regions.code, '99.%')))
    await db
      .insert(regions)
      .values(rows.map((r) => ({ ...r, fullName: fullName(r.code), lat: -7.06, lng: 107.63 })))
  })

  afterAll(async () => {
    // Children first (self-referencing foreign key).
    for (const len of [4, 3, 2, 1]) {
      for (const r of rows.filter((x) => x.code.split('.').length === len)) {
        await db.delete(regions).where(eq(regions.code, r.code))
      }
    }
  })

  type Body = { data: { code: string; fullName: string; lat: number | null }[] }
  const get = async (path: string) => {
    const res = await app.request(path)
    return { res, body: (await res.json()) as Body }
  }

  test('every word must match, the full name explains where the region is', async () => {
    const { res, body } = await get(`/v1/regions/search?q=baros${tag}+arjasari${tag}`)
    expect(res.status).toBe(200)
    expect(res.headers.get('cache-control')).toContain('s-maxage')
    expect(body.data.map((r) => r.code)).toEqual(['99.01.01.2001'])
    expect(body.data[0]!.fullName).toBe(
      `Baros${tag}, Kec. Arjasari${tag}, Kabupaten ${tag}, Prov ${tag}`,
    )
    expect(body.data[0]!.lat).toBe(-7.06)
  })

  test('a shared word lists higher levels first and hides retired codes', async () => {
    const { body } = await get(`/v1/regions/search?q=${tag}&within=99&limit=20`)
    const codes = body.data.map((r) => r.code)
    // `within` means strictly inside: the province itself is not listed.
    expect(codes.slice(0, 2)).toEqual(['99.01', '99.01.01'])
    expect(codes).not.toContain('99')
    expect(codes).not.toContain('99.01.01.2003')
  })

  test('level filter and LIKE wildcards in the query', async () => {
    const villages = await get(`/v1/regions/search?q=${tag}&level=village`)
    expect(villages.body.data.map((r) => r.code).sort()).toEqual(['99.01.01.2001', '99.01.01.2002'])
    const wildcard = await get(`/v1/regions/search?q=${encodeURIComponent('%%')}`)
    expect(wildcard.body.data).toEqual([])
  })

  test('children for a cascading picker; unknown parent is 404', async () => {
    const { body } = await get('/v1/regions?parent=99.01.01')
    expect(body.data.map((r) => r.code)).toEqual(['99.01.01.2001', '99.01.01.2002'])
    expect((await app.request('/v1/regions?parent=98.77')).status).toBe(404)
  })

  test('one region by code; malformed code is 422', async () => {
    const { res, body } = await get('/v1/regions/99.01')
    expect(res.status).toBe(200)
    expect((body as unknown as { data: { code: string } }).data.code).toBe('99.01')
    expect((await app.request('/v1/regions/99.1')).status).toBe(422)
  })
})
