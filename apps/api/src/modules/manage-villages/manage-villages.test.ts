import { afterAll, beforeAll, expect, test } from 'bun:test'
import { accounts, auditLogs, regions, sessions, users, villageMembers, villages } from '@repo/db'
import { and, eq, inArray, like } from 'drizzle-orm'
import { createTestApp, describeDb, signUp } from '../../test/db'

type Json = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

describeDb('/v1/manage/villages', () => {
  const { db, auth, app } = createTestApp()
  const tag = `v${Date.now().toString(36)}`
  const emailDomain = `${tag}.test.local`
  /** Unused province code 98, so the region never clashes with real data. */
  const regionCode = '98'
  const people = {} as Record<
    'admin' | 'assistant' | 'otherAdmin' | 'superAdmin',
    { id: string; cookie: string }
  >
  let v1 = ''
  let v2 = ''

  const call = (who: keyof typeof people | null, method: string, id: string, body?: unknown) =>
    app.request(`/v1/manage/villages/${id}`, {
      method,
      headers: {
        ...(who ? { Cookie: people[who].cookie } : {}),
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  const data = async (res: Response) => ((await res.json()) as { data: Json }).data

  beforeAll(async () => {
    await db.delete(regions).where(eq(regions.code, regionCode))
    await db.insert(regions).values({
      code: regionCode,
      name: `Prov ${tag}`,
      level: 'province',
      fullName: `Prov ${tag}`,
      lat: -6.9,
      lng: 107.6,
    })
    const rows = await db
      .insert(villages)
      .values([
        { slug: `${tag}-satu`, name: 'Desa Satu', regionCode },
        { slug: `${tag}-dua`, name: 'Desa Dua' },
      ])
      .returning({ id: villages.id })
    v1 = rows[0]!.id
    v2 = rows[1]!.id
    for (const key of ['admin', 'assistant', 'otherAdmin', 'superAdmin'] as const) {
      people[key] = await signUp(auth, `${key.toLowerCase()}@${emailDomain}`, key)
    }
    await db
      .update(users)
      .set({ globalRole: 'super_admin' })
      .where(eq(users.id, people.superAdmin.id))
    await db.insert(villageMembers).values([
      { villageId: v1, userId: people.admin.id, role: 'village_admin' },
      { villageId: v1, userId: people.assistant.id, role: 'village_assistant' },
      { villageId: v2, userId: people.otherAdmin.id, role: 'village_admin' },
    ])
  })

  afterAll(async () => {
    const ids = [v1, v2]
    const userIds = (
      await db
        .select({ id: users.id })
        .from(users)
        .where(like(users.email, `%@${emailDomain}`))
    ).map((u) => u.id)
    await db.delete(auditLogs).where(inArray(auditLogs.villageId, ids))
    await db.delete(villageMembers).where(inArray(villageMembers.villageId, ids))
    await db.delete(villages).where(inArray(villages.id, ids))
    await db.delete(regions).where(eq(regions.code, regionCode))
    await db.delete(sessions).where(inArray(sessions.userId, userIds))
    await db.delete(accounts).where(inArray(accounts.userId, userIds))
    await db.delete(users).where(inArray(users.id, userIds))
  })

  test('the village team reads it; the map opens on the region point until a centre is chosen', async () => {
    const res = await call('assistant', 'GET', v1)
    expect(res.status).toBe(200)
    expect(res.headers.get('cache-control')).toBe('no-store')
    const v = await data(res)
    expect(v.region).toEqual({
      code: regionCode,
      fullName: `Prov ${tag}`,
      point: { lat: -6.9, lng: 107.6 },
    })
    expect(v.center).toBeNull()
    expect(v.mapCenter).toEqual({ lat: -6.9, lng: 107.6 })
    expect(v.permissions).toEqual({ update: false })
    expect((await data(await call('admin', 'GET', v1))).permissions).toEqual({ update: true })
  })

  test('outsiders get 403, nobody gets in without a session', async () => {
    expect((await call('otherAdmin', 'GET', v1)).status).toBe(403)
    expect((await call(null, 'GET', v1)).status).toBe(401)
  })

  test('only its admin edits; the change is audited', async () => {
    expect((await call('assistant', 'PATCH', v1, { description: 'x' })).status).toBe(403)
    expect((await call('otherAdmin', 'PATCH', v1, { description: 'x' })).status).toBe(403)

    const v = await data(
      await call('admin', 'PATCH', v1, {
        centerLat: -7.065772264,
        centerLng: 107.630174005,
        contactPhone: '022-5950 123',
        description: 'Desa wisata di kaki Gunung Malabar.',
      }),
    )
    expect(v.center).toEqual({ lat: -7.065772, lng: 107.630174 })
    expect(v.mapCenter).toEqual(v.center)
    expect(v.contactPhone).toBe('022-5950 123')
    const logs = await db
      .select()
      .from(auditLogs)
      .where(and(eq(auditLogs.entityId, v1), eq(auditLogs.action, 'village.update')))
    expect(logs).toHaveLength(1)
  })

  test('a half pin or a point abroad is 422; null on both resets to the region point', async () => {
    expect((await call('admin', 'PATCH', v1, { centerLat: -7.06 })).status).toBe(422)
    expect((await call('admin', 'PATCH', v1, { centerLat: 51.5, centerLng: -0.12 })).status).toBe(
      422,
    )
    const v = await data(await call('admin', 'PATCH', v1, { centerLat: null, centerLng: null }))
    expect(v.center).toBeNull()
    expect(v.mapCenter).toEqual({ lat: -6.9, lng: 107.6 })
  })

  test('a village without a region has no map centre yet', async () => {
    const v = await data(await call('otherAdmin', 'GET', v2))
    expect(v.region).toBeNull()
    expect(v.mapCenter).toBeNull()
  })

  test('settings list: own villages for staff, every village (drafts too) for a super admin', async () => {
    const list = async (who: keyof typeof people, query = '') => {
      const res = await app.request(`/v1/manage/villages${query}`, {
        headers: { Cookie: people[who].cookie },
      })
      return ((await res.json()) as { data: Json[]; meta: Json }).data
    }
    expect((await list('admin')).map((v) => [v.id, v.permissions.update])).toEqual([[v1, true]])
    expect((await list('assistant')).map((v) => [v.id, v.permissions.update])).toEqual([
      [v1, false],
    ])
    expect((await list('otherAdmin')).map((v) => v.id)).toEqual([v2])

    const found = await list('superAdmin', `?q=${tag}&pageSize=50`)
    expect(found.length).toBe(0) // names are "Desa Satu"/"Desa Dua"; the tag is only in the slug
    const drafts = await list('superAdmin', '?q=Desa%20Satu&pageSize=50')
    expect(drafts.some((v) => v.id === v1 && v.status === 'draft')).toBe(true)
    expect(drafts.find((v) => v.id === v1)?.regionFullName).toBe(`Prov ${tag}`)
  })
})
