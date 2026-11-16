import { afterAll, beforeAll, expect, test } from 'bun:test'
import {
  accounts,
  auditLogs,
  businessMembers,
  businesses,
  sessions,
  users,
  villageMembers,
  villages,
} from '@repo/db'
import { and, eq, inArray, like } from 'drizzle-orm'
import { createTestApp, describeDb, signUp } from '../../test/db'

type Json = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

describeDb('/v1/manage/businesses', () => {
  const { db, auth, app } = createTestApp()
  const tag = `t${Date.now().toString(36)}`
  const emailDomain = `${tag}.test.local`
  const villageIds: string[] = []
  const people = {} as Record<
    'adminV1' | 'adminV2' | 'assistantV1' | 'stranger',
    { id: string; cookie: string }
  >
  let v1 = ''
  let v2 = ''

  const call = (who: keyof typeof people | null, method: string, path: string, body?: unknown) =>
    app.request(`/v1/manage/businesses${path === '/' ? '' : path}`, {
      method,
      headers: {
        ...(who ? { Cookie: people[who].cookie } : {}),
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  const data = async (res: Response) => ((await res.json()) as { data: Json }).data
  const reason = async (res: Response) =>
    ((await res.json()) as { error: { details: { reason: string } } }).error.details.reason

  beforeAll(async () => {
    const rows = await db
      .insert(villages)
      .values([
        { slug: `${tag}-satu`, name: 'Desa Satu', status: 'published' },
        { slug: `${tag}-dua`, name: 'Desa Dua', status: 'published' },
      ])
      .returning({ id: villages.id })
    v1 = rows[0]!.id
    v2 = rows[1]!.id
    villageIds.push(v1, v2)
    for (const key of ['adminV1', 'adminV2', 'assistantV1', 'stranger'] as const) {
      people[key] = await signUp(auth, `${key.toLowerCase()}@${emailDomain}`, key)
    }
    await db.insert(villageMembers).values([
      { villageId: v1, userId: people.adminV1.id, role: 'village_admin' },
      { villageId: v2, userId: people.adminV2.id, role: 'village_admin' },
      { villageId: v1, userId: people.assistantV1.id, role: 'village_assistant' },
    ])
  })

  afterAll(async () => {
    const userIds = (
      await db
        .select({ id: users.id })
        .from(users)
        .where(like(users.email, `%@${emailDomain}`))
    ).map((u) => u.id)
    await db.delete(auditLogs).where(inArray(auditLogs.villageId, villageIds))
    const bizIds = (
      await db
        .select({ id: businesses.id })
        .from(businesses)
        .where(inArray(businesses.villageId, villageIds))
    ).map((b) => b.id)
    if (bizIds.length) {
      await db.delete(businessMembers).where(inArray(businessMembers.businessId, bizIds))
      await db.delete(businesses).where(inArray(businesses.id, bizIds))
    }
    await db.delete(villageMembers).where(inArray(villageMembers.villageId, villageIds))
    await db.delete(villages).where(inArray(villages.id, villageIds))
    if (userIds.length) {
      await db.delete(sessions).where(inArray(sessions.userId, userIds))
      await db.delete(accounts).where(inArray(accounts.userId, userIds))
      await db.delete(users).where(inArray(users.id, userIds))
    }
  })

  let bizId = ''
  let bizSlug = ''

  test('401 without a session', async () => {
    expect((await call(null, 'GET', '/')).status).toBe(401)
    expect((await call(null, 'POST', '/', { villageId: v1, name: 'Kopi' })).status).toBe(401)
  })

  test('village assistant creates a draft; slug comes from the name; they become its assistant', async () => {
    const res = await call('assistantV1', 'POST', '/', {
      villageId: v1,
      name: `Kopi Gayo ${tag}`,
      whatsappNumber: '0812-3456-7890',
    })
    expect(res.status).toBe(201)
    const b = await data(res)
    bizId = b.id
    bizSlug = b.slug
    expect(b.slug).toBe(`kopi-gayo-${tag}`)
    expect(b.whatsappNumber).toBe('6281234567890')
    expect(b.status).toBe('draft')
    expect(b.verificationStatus).toBe('pending')
    expect(b.consentAt).toBeNull()
    expect(b.permissions).toMatchObject({ update: true, verify: false, delete: false })
    const [member] = await db
      .select()
      .from(businessMembers)
      .where(eq(businessMembers.businessId, bizId))
    expect(member).toMatchObject({ userId: people.assistantV1.id, role: 'assistant' })
    const logs = await db
      .select()
      .from(auditLogs)
      .where(and(eq(auditLogs.entityId, bizId), eq(auditLogs.action, 'business.create')))
    expect(logs).toHaveLength(1)
  })

  test('a duplicate name gets the next free slug', async () => {
    const res = await call('adminV1', 'POST', '/', { villageId: v1, name: `Kopi Gayo ${tag}` })
    expect(res.status).toBe(201)
    expect((await data(res)).slug).toBe(`kopi-gayo-${tag}-2`)
  })

  test('cannot create in another village; bad input is 422', async () => {
    expect((await call('assistantV1', 'POST', '/', { villageId: v2, name: 'Toko' })).status).toBe(
      403,
    )
    expect((await call('adminV1', 'POST', '/', { villageId: v1, name: 'ab' })).status).toBe(422)
  })

  test('other villages and strangers cannot read it', async () => {
    expect((await call('adminV2', 'GET', `/${bizId}`)).status).toBe(403)
    expect((await call('stranger', 'GET', `/${bizId}`)).status).toBe(403)
    expect((await call('adminV1', 'GET', `/${bizId}`)).status).toBe(200)
  })

  test('lists are scoped to the caller', async () => {
    const ids = async (who: keyof typeof people) =>
      ((await (await call(who, 'GET', '/')).json()) as { data: Json[] }).data.map((b) => b.id)
    expect(await ids('adminV1')).toContain(bizId)
    expect(await ids('assistantV1')).toEqual([bizId]) // only the one they are assigned to
    expect(await ids('adminV2')).not.toContain(bizId)
    expect(await ids('stranger')).toEqual([])
  })

  test('publishing needs verification first', async () => {
    const res = await call('assistantV1', 'POST', `/${bizId}/publish`)
    expect(res.status).toBe(409)
    expect(await reason(res)).toBe('NOT_VERIFIED')
  })

  test('review: only the village admin decides; rejection needs a note; editing re-queues', async () => {
    const reject = { decision: 'rejected', note: 'Foto dan alamat belum ada' }
    expect((await call('assistantV1', 'POST', `/${bizId}/verify`, reject)).status).toBe(403)
    expect((await call('adminV2', 'POST', `/${bizId}/verify`, reject)).status).toBe(403)
    expect(
      (await call('adminV1', 'POST', `/${bizId}/verify`, { decision: 'rejected' })).status,
    ).toBe(422)

    const rejected = await data(await call('adminV1', 'POST', `/${bizId}/verify`, reject))
    expect(rejected.verificationStatus).toBe('rejected')
    expect(rejected.verificationNote).toBe(reject.note)

    const edited = await data(
      await call('assistantV1', 'PATCH', `/${bizId}`, { address: 'Jl. Raya Baros 1' }),
    )
    expect(edited.verificationStatus).toBe('pending')

    const verified = await data(
      await call('adminV1', 'POST', `/${bizId}/verify`, { decision: 'verified' }),
    )
    expect(verified.verificationStatus).toBe('verified')
    expect(verified.verifiedAt).not.toBeNull()
    const again = await call('adminV1', 'POST', `/${bizId}/verify`, { decision: 'verified' })
    expect(again.status).toBe(409)
  })

  test('publishing needs consent, recorded as a paper form by the staff member', async () => {
    const res = await call('assistantV1', 'POST', `/${bizId}/publish`)
    expect(await reason(res)).toBe('NO_CONSENT')

    const b = await data(await call('assistantV1', 'PATCH', `/${bizId}`, { consentGiven: true }))
    expect(b.consentMethod).toBe('paper_form')
    const [row] = await db
      .select({ by: businesses.consentRecordedBy })
      .from(businesses)
      .where(eq(businesses.id, bizId))
    expect(row?.by).toBe(people.assistantV1.id)

    const published = await data(await call('assistantV1', 'POST', `/${bizId}/publish`))
    expect(published.status).toBe('published')
    expect((await app.request(`/v1/businesses/${bizSlug}`)).status).toBe(200)
  })

  test('internal location is saved (RT/RW padded, pin rounded) and never reaches public pages', async () => {
    await db
      .update(villages)
      .set({ centerLat: -7.0658, centerLng: 107.6302 })
      .where(eq(villages.id, v1))
    const b = await data(
      await call('assistantV1', 'PATCH', `/${bizId}`, {
        address: 'Jl. Raya Baros, dekat masjid',
        rt: '1',
        rw: '12',
        lat: -7.065772264163892,
        lng: 107.630174005714,
      }),
    )
    expect(b).toMatchObject({ rt: '001', rw: '012', lat: -7.065772, lng: 107.630174 })
    expect(b.village.center).toEqual({ lat: -7.0658, lng: 107.6302 })

    const half = await call('assistantV1', 'PATCH', `/${bizId}`, { lat: -7.06 })
    expect(half.status).toBe(422)
    const abroad = await call('assistantV1', 'PATCH', `/${bizId}`, { lat: 51.5, lng: -0.12 })
    expect(abroad.status).toBe(422)

    const pub = await app.request(`/v1/businesses/${bizSlug}`)
    expect(pub.status).toBe(200)
    const text = await pub.text()
    for (const secret of ['Jl. Raya Baros', '"rt"', '"rw"', '"lat"', '"lng"', '-7.065772']) {
      expect(text).not.toContain(secret)
    }

    const cleared = await data(
      await call('assistantV1', 'PATCH', `/${bizId}`, { rt: '', lat: null, lng: null }),
    )
    expect(cleared).toMatchObject({ rt: null, rw: '012', lat: null, lng: null })
  })

  test('editing another field keeps consent (regression: PATCH used to revoke it)', async () => {
    const b = await data(
      await call('assistantV1', 'PATCH', `/${bizId}`, { description: 'Kopi arabika' }),
    )
    expect(b.consentAt).not.toBeNull()
    expect(b.status).toBe('published')
  })

  test('empty strings clear optional fields; a WhatsApp change is audited', async () => {
    const b = await data(
      await call('assistantV1', 'PATCH', `/${bizId}`, {
        description: '',
        whatsappNumber: '081299998888',
      }),
    )
    expect(b.description).toBeNull()
    const logs = await db
      .select({ changes: auditLogs.changes })
      .from(auditLogs)
      .where(and(eq(auditLogs.entityId, bizId), eq(auditLogs.action, 'business.update')))
    const waChange = logs
      .map((l) => (l.changes as Json).whatsappNumber)
      .find((c) => c?.to === '6281299998888')
    expect(waChange).toEqual({ from: '6281234567890', to: '6281299998888' })
  })

  test('only a village admin changes the slug, and it must be free', async () => {
    expect((await call('assistantV1', 'PATCH', `/${bizId}`, { slug: `${tag}-kopi` })).status).toBe(
      403,
    )
    const taken = await call('adminV1', 'PATCH', `/${bizId}`, { slug: `kopi-gayo-${tag}-2` })
    expect(taken.status).toBe(409)
    expect(await reason(taken)).toBe('SLUG_TAKEN')
    const b = await data(await call('adminV1', 'PATCH', `/${bizId}`, { slug: `${tag}-kopi` }))
    bizSlug = b.slug
    expect(bizSlug).toBe(`${tag}-kopi`)
  })

  test('takedown hides it and blocks republishing until restored', async () => {
    const body = { reason: 'Produk tidak sesuai aturan' }
    expect((await call('assistantV1', 'POST', `/${bizId}/takedown`, body)).status).toBe(403)
    const down = await data(await call('adminV1', 'POST', `/${bizId}/takedown`, body))
    expect(down.status).toBe('draft')
    expect(down.takedownReason).toBe(body.reason)
    expect((await app.request(`/v1/businesses/${bizSlug}`)).status).toBe(404)

    const blocked = await call('assistantV1', 'POST', `/${bizId}/publish`)
    expect(await reason(blocked)).toBe('TAKEN_DOWN')

    const restored = await data(await call('adminV1', 'POST', `/${bizId}/restore`))
    expect(restored.takenDownAt).toBeNull()
    expect(restored.status).toBe('draft')
    expect((await call('assistantV1', 'POST', `/${bizId}/publish`)).status).toBe(200)
  })

  test('withdrawing consent unpublishes right away', async () => {
    const b = await data(await call('assistantV1', 'PATCH', `/${bizId}`, { consentGiven: false }))
    expect(b.consentAt).toBeNull()
    expect(b.status).toBe('draft')
  })

  test('only a village admin deletes (soft); then it is gone', async () => {
    expect((await call('assistantV1', 'DELETE', `/${bizId}`)).status).toBe(403)
    expect((await call('adminV1', 'DELETE', `/${bizId}`)).status).toBe(204)
    expect((await call('adminV1', 'GET', `/${bizId}`)).status).toBe(404)
    const [row] = await db
      .select({ deletedAt: businesses.deletedAt })
      .from(businesses)
      .where(eq(businesses.id, bizId))
    expect(row?.deletedAt).not.toBeNull()
  })
})
