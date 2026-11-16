import { afterAll, beforeAll, expect, test } from 'bun:test'
import {
  accounts,
  auditLogs,
  businessMembers,
  businesses,
  categories,
  productImages,
  products,
  sessions,
  users,
  villageMembers,
  villages,
} from '@repo/db'
import { and, eq, inArray, like } from 'drizzle-orm'
import { createMemoryStorage } from '../../lib/storage'
import { createTestApp, describeDb, signUp } from '../../test/db'

type Json = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

describeDb('/v1/manage/media', () => {
  const storage = createMemoryStorage()
  const { db, auth, app } = createTestApp({ storage })
  const tag = `m${Date.now().toString(36)}`
  const emailDomain = `${tag}.test.local`
  const villageIds: string[] = []
  const people = {} as Record<
    'adminV1' | 'adminV2' | 'owner' | 'stranger',
    { id: string; cookie: string }
  >
  let v1 = ''
  let bizId = ''
  let productId = ''
  let otherProductId = ''
  let categoryId = ''

  const call = (who: keyof typeof people | null, method: string, path: string, body?: unknown) =>
    app.request(`/v1/manage${path}`, {
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

  /** presign → simulated browser PUT → attach. */
  const upload = async (
    who: keyof typeof people,
    target: string,
    id: string,
    stored: { size?: number; type?: string } = {},
  ) => {
    const presigned = await call(who, 'POST', '/media/presign', {
      target,
      id,
      contentType: 'image/webp',
      size: 1000,
    })
    if (presigned.status !== 200) return { presigned, attached: null, key: '' }
    const { key } = await data(presigned)
    storage.put(key, stored.size ?? 1000, stored.type ?? 'image/webp')
    const attached = await call(who, 'POST', '/media', { target, id, key })
    return { presigned, attached, key: key as string }
  }

  beforeAll(async () => {
    const vs = await db
      .insert(villages)
      .values([
        { slug: `${tag}-satu`, name: 'Desa Satu', status: 'published' },
        { slug: `${tag}-dua`, name: 'Desa Dua', status: 'published' },
      ])
      .returning({ id: villages.id })
    v1 = vs[0]!.id
    villageIds.push(v1, vs[1]!.id)
    for (const key of ['adminV1', 'adminV2', 'owner', 'stranger'] as const) {
      people[key] = await signUp(auth, `${key.toLowerCase()}@${emailDomain}`, key)
    }
    await db.insert(villageMembers).values([
      { villageId: v1, userId: people.adminV1.id, role: 'village_admin' },
      { villageId: vs[1]!.id, userId: people.adminV2.id, role: 'village_admin' },
    ])
    const [biz] = await db
      .insert(businesses)
      .values({ villageId: v1, slug: `${tag}-warung`, name: 'Warung' })
      .returning({ id: businesses.id })
    bizId = biz!.id
    await db
      .insert(businessMembers)
      .values({ businessId: bizId, userId: people.owner.id, role: 'owner' })
    const [cat] = await db
      .insert(categories)
      .values({ slug: `${tag}-cat`, name: 'Cat' })
      .returning({ id: categories.id })
    categoryId = cat!.id
    const ps = await db
      .insert(products)
      .values([
        { businessId: bizId, villageId: v1, categoryId, slug: `${tag}-a`, name: 'A', price: 1000 },
        { businessId: bizId, villageId: v1, categoryId, slug: `${tag}-b`, name: 'B', price: 1000 },
      ])
      .returning({ id: products.id })
    productId = ps[0]!.id
    otherProductId = ps[1]!.id
  })

  afterAll(async () => {
    const userIds = (
      await db
        .select({ id: users.id })
        .from(users)
        .where(like(users.email, `%@${emailDomain}`))
    ).map((u) => u.id)
    await db.delete(auditLogs).where(inArray(auditLogs.villageId, villageIds))
    await db.delete(products).where(inArray(products.villageId, villageIds))
    await db.delete(businessMembers).where(eq(businessMembers.businessId, bizId))
    await db.delete(businesses).where(inArray(businesses.villageId, villageIds))
    await db.delete(categories).where(eq(categories.id, categoryId))
    await db.delete(villageMembers).where(inArray(villageMembers.villageId, villageIds))
    await db.delete(villages).where(inArray(villages.id, villageIds))
    if (userIds.length) {
      await db.delete(sessions).where(inArray(sessions.userId, userIds))
      await db.delete(accounts).where(inArray(accounts.userId, userIds))
      await db.delete(users).where(inArray(users.id, userIds))
    }
  })

  const presignBody = () => ({
    target: 'product_image',
    id: productId,
    contentType: 'image/webp',
    size: 1000,
  })

  test('401 without a session; 403 for other villages and strangers', async () => {
    expect((await call(null, 'POST', '/media/presign', presignBody())).status).toBe(401)
    expect((await call('adminV2', 'POST', '/media/presign', presignBody())).status).toBe(403)
    expect((await call('stranger', 'POST', '/media/presign', presignBody())).status).toBe(403)
  })

  test('presign gives a key inside the product folder; limits are 422', async () => {
    const res = await call('owner', 'POST', '/media/presign', presignBody())
    expect(res.status).toBe(200)
    const p = await data(res)
    expect(p.key).toStartWith(`villages/${v1}/businesses/${bizId}/products/${productId}/`)
    expect(p.key).toEndWith('.webp')
    expect(p.headers).toEqual({ 'Content-Type': 'image/webp' })
    const big = { ...presignBody(), size: 3 * 1024 * 1024 }
    expect((await call('owner', 'POST', '/media/presign', big)).status).toBe(422)
    const png = { ...presignBody(), contentType: 'image/png' }
    expect((await call('owner', 'POST', '/media/presign', png)).status).toBe(422)
  })

  test('attach checks the file really is in storage and belongs to that product', async () => {
    const { key } = await data(await call('owner', 'POST', '/media/presign', presignBody()))
    const notUploaded = await call('owner', 'POST', '/media', {
      target: 'product_image',
      id: productId,
      key,
    })
    expect(notUploaded.status).toBe(422)
    storage.put(key, 1000, 'image/webp')
    const wrongProduct = await call('owner', 'POST', '/media', {
      target: 'product_image',
      id: otherProductId,
      key,
    })
    expect(wrongProduct.status).toBe(422)
    const forged = await call('owner', 'POST', '/media', {
      target: 'product_image',
      id: productId,
      key: `villages/${v1}/businesses/${bizId}/products/${productId}/../../x.webp`,
    })
    expect(forged.status).toBe(422)
  })

  test('an oversized or non-image object is rejected and deleted', async () => {
    const big = await upload('owner', 'product_image', productId, { size: 3 * 1024 * 1024 })
    expect(big.attached!.status).toBe(422)
    expect(storage.has(big.key)).toBe(false)
    const svg = await upload('owner', 'product_image', productId, { type: 'image/svg+xml' })
    expect(svg.attached!.status).toBe(422)
    expect(storage.has(svg.key)).toBe(false)
  })

  let firstKey = ''
  test('a valid upload is attached, ordered and audited', async () => {
    const first = await upload('owner', 'product_image', productId)
    firstKey = first.key
    expect(await data(first.attached!)).toEqual({ keys: [first.key] })
    const second = await upload('owner', 'product_image', productId)
    expect((await data(second.attached!)).keys).toEqual([first.key, second.key])
    const logs = await db
      .select()
      .from(auditLogs)
      .where(and(eq(auditLogs.entityId, productId), eq(auditLogs.action, 'media.attach')))
    expect(logs).toHaveLength(2)
  })

  test('reorder sets the cover; it must list every photo once', async () => {
    const before = await data(await call('owner', 'GET', `/products/${productId}`))
    const ids = (before.images as Json[]).map((i) => i.id)
    const after = await data(
      await call('owner', 'PATCH', `/products/${productId}/images`, { order: [...ids].reverse() }),
    )
    expect((after.images as Json[]).map((i) => i.id)).toEqual([...ids].reverse())
    expect(after.images[0].sortOrder).toBe(0)
    const missing = await call('owner', 'PATCH', `/products/${productId}/images`, {
      order: [ids[0]],
    })
    expect(missing.status).toBe(422)
  })

  test('at most 10 photos per product', async () => {
    const extra = Array.from({ length: 8 }, (_, i) => ({
      productId,
      storageKey: `test/${tag}/${i}.webp`,
      sortOrder: 10 + i,
    }))
    await db.insert(productImages).values(extra)
    const full = await call('owner', 'POST', '/media/presign', presignBody())
    expect(full.status).toBe(409)
    expect(await reason(full)).toBe('TOO_MANY_FILES')
    await db.delete(productImages).where(like(productImages.storageKey, `test/${tag}/%`))
  })

  test('a published product keeps its last photo; removing deletes the file', async () => {
    const removed = await call(
      'owner',
      'DELETE',
      `/media?target=product_image&id=${productId}&key=${encodeURIComponent(firstKey)}`,
    )
    expect(removed.status).toBe(200)
    expect(storage.has(firstKey)).toBe(false)
    const [last] = (await data(await call('owner', 'GET', `/products/${productId}`)))
      .images as Json[]

    expect((await call('owner', 'POST', `/products/${productId}/publish`)).status).toBe(200)
    const blocked = await call(
      'owner',
      'DELETE',
      `/media?target=product_image&id=${productId}&key=${encodeURIComponent(last!.key)}`,
    )
    expect(blocked.status).toBe(409)
    expect(await reason(blocked)).toBe('LAST_PHOTO')
  })

  test('a business logo is a single slot: a new one replaces and deletes the old file', async () => {
    const first = await upload('owner', 'business_logo', bizId)
    expect(await data(first.attached!)).toEqual({ keys: [first.key] })
    expect(first.key).toStartWith(`villages/${v1}/businesses/${bizId}/logo/`)
    const second = await upload('owner', 'business_logo', bizId)
    expect(await data(second.attached!)).toEqual({ keys: [second.key] })
    expect(storage.has(first.key)).toBe(false)
    const [row] = await db
      .select({ logoKey: businesses.logoKey })
      .from(businesses)
      .where(eq(businesses.id, bizId))
    expect(row?.logoKey).toBe(second.key)

    const cleared = await call(
      'owner',
      'DELETE',
      `/media?target=business_logo&id=${bizId}&key=${encodeURIComponent(second.key)}`,
    )
    expect(await data(cleared)).toEqual({ keys: [] })
  })

  test('village banner: only the village admin', async () => {
    const byOwner = await upload('owner', 'village_banner', v1)
    expect(byOwner.presigned.status).toBe(403)
    const byAdmin = await upload('adminV1', 'village_banner', v1)
    expect(byAdmin.attached!.status).toBe(200)
    expect(byAdmin.key).toStartWith(`villages/${v1}/banner/`)
  })

  test('without storage configured, uploads answer 503', async () => {
    const { app: bare } = createTestApp({ storage: null })
    const res = await bare.request('/v1/manage/media/presign', {
      method: 'POST',
      headers: { Cookie: people.owner.cookie, 'Content-Type': 'application/json' },
      body: JSON.stringify(presignBody()),
    })
    expect(res.status).toBe(503)
  })
})
