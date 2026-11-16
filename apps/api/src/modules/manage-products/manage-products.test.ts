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
import { createTestApp, describeDb, signUp } from '../../test/db'

type Json = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

describeDb('/v1/manage products', () => {
  const { db, auth, app } = createTestApp()
  const tag = `p${Date.now().toString(36)}`
  const emailDomain = `${tag}.test.local`
  const villageIds: string[] = []
  const people = {} as Record<
    'adminV1' | 'adminV2' | 'assistantV1' | 'owner' | 'stranger',
    { id: string; cookie: string }
  >
  let v1 = ''
  let bizA = ''
  let bizB = ''
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
  const errorOf = async (res: Response) => ((await res.json()) as { error: Json }).error

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
    for (const key of ['adminV1', 'adminV2', 'assistantV1', 'owner', 'stranger'] as const) {
      people[key] = await signUp(auth, `${key.toLowerCase()}@${emailDomain}`, key)
    }
    await db.insert(villageMembers).values([
      { villageId: v1, userId: people.adminV1.id, role: 'village_admin' },
      { villageId: vs[1]!.id, userId: people.adminV2.id, role: 'village_admin' },
      { villageId: v1, userId: people.assistantV1.id, role: 'village_assistant' },
    ])
    // Business A is public (verified, consented, published), so its products can go live.
    const bs = await db
      .insert(businesses)
      .values([
        {
          villageId: v1,
          slug: `${tag}-warung-a`,
          name: `Warung A ${tag}`,
          whatsappNumber: '6281234567890',
          status: 'published',
          verificationStatus: 'verified',
          consentAt: new Date(),
          consentMethod: 'paper_form',
        },
        { villageId: v1, slug: `${tag}-warung-b`, name: `Warung B ${tag}` },
      ])
      .returning({ id: businesses.id })
    bizA = bs[0]!.id
    bizB = bs[1]!.id
    await db
      .insert(businessMembers)
      .values({ businessId: bizA, userId: people.owner.id, role: 'owner' })
    const [cat] = await db
      .insert(categories)
      .values({ slug: `${tag}-camilan`, name: 'Camilan' })
      .returning({ id: categories.id })
    categoryId = cat!.id
  })

  afterAll(async () => {
    const userIds = (
      await db
        .select({ id: users.id })
        .from(users)
        .where(like(users.email, `%@${emailDomain}`))
    ).map((u) => u.id)
    await db.delete(auditLogs).where(inArray(auditLogs.villageId, villageIds))
    await db.delete(products).where(inArray(products.villageId, villageIds)) // images cascade
    await db.delete(businessMembers).where(inArray(businessMembers.businessId, [bizA, bizB]))
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

  let productId = ''
  let productSlug = ''
  const keripik = () => ({ categoryId, name: `Keripik ${tag}`, price: 15000, unit: 'pack 250 gr' })

  test('401 without a session', async () => {
    expect((await call(null, 'GET', `/businesses/${bizA}/products`)).status).toBe(401)
    expect((await call(null, 'POST', `/businesses/${bizA}/products`, keripik())).status).toBe(401)
  })

  test('the owner creates a draft; slug from the name, village from the business, audited', async () => {
    const res = await call('owner', 'POST', `/businesses/${bizA}/products`, {
      ...keripik(),
      en: { name: 'Cassava Chips' },
    })
    expect(res.status).toBe(201)
    const p = await data(res)
    productId = p.id
    productSlug = p.slug
    expect(p.slug).toBe(`keripik-${tag}`)
    expect(p.villageId).toBe(v1)
    expect(p).toMatchObject({ status: 'draft', isAvailable: true, isFree: false, images: [] })
    expect(p.en).toEqual({ name: 'Cassava Chips', description: null })
    expect(p.permissions).toEqual({ update: true, publish: true, delete: true })
    const logs = await db
      .select()
      .from(auditLogs)
      .where(and(eq(auditLogs.entityId, productId), eq(auditLogs.action, 'product.create')))
    expect(logs).toHaveLength(1)
  })

  test('a taken name gets the business name, then a number', async () => {
    const first = await data(
      await call('adminV1', 'POST', `/businesses/${bizB}/products`, keripik()),
    )
    expect(first.slug).toBe(`keripik-${tag}-warung-b-${tag}`)
    const second = await data(
      await call('adminV1', 'POST', `/businesses/${bizB}/products`, keripik()),
    )
    expect(second.slug).toBe(`keripik-${tag}-warung-b-${tag}-2`)
  })

  test('bad input is 422: no category, unknown category, typo price, fake discount', async () => {
    const post = (body: unknown) => call('owner', 'POST', `/businesses/${bizA}/products`, body)
    const { categoryId: _c, ...noCategory } = keripik()
    expect((await post(noCategory)).status).toBe(422)
    const unknown = await post({ ...keripik(), categoryId: crypto.randomUUID() })
    expect(unknown.status).toBe(422)
    expect((await errorOf(unknown)).details.properties.categoryId.errors[0]).toBe(
      'Kategori tidak ditemukan',
    )
    expect((await post({ ...keripik(), price: 5 })).status).toBe(422)
    expect((await post({ ...keripik(), price: '15000' })).status).toBe(422)
    expect((await post({ ...keripik(), compareAtPrice: 15000 })).status).toBe(422)
  })

  test('access follows the business: other villages, strangers and unassigned assistants get 403', async () => {
    for (const who of ['adminV2', 'stranger', 'assistantV1'] as const) {
      expect((await call(who, 'GET', `/products/${productId}`)).status).toBe(403)
      expect((await call(who, 'PATCH', `/products/${productId}`, { price: 1000 })).status).toBe(403)
      expect((await call(who, 'POST', `/businesses/${bizA}/products`, keripik())).status).toBe(403)
    }
    expect((await call('adminV1', 'GET', `/products/${productId}`)).status).toBe(200)
  })

  test('editing the price keeps "sold out" (regression: PATCH used to reset availability)', async () => {
    await call('owner', 'PATCH', `/products/${productId}`, { isAvailable: false })
    const p = await data(await call('owner', 'PATCH', `/products/${productId}`, { price: 16000 }))
    expect(p.price).toBe(16000)
    expect(p.isAvailable).toBe(false)
    await call('owner', 'PATCH', `/products/${productId}`, { isAvailable: true })
  })

  test('struck-through price is checked against the stored price', async () => {
    const promo = await data(
      await call('owner', 'PATCH', `/products/${productId}`, { compareAtPrice: 20000 }),
    )
    expect(promo.compareAtPrice).toBe(20000)
    const tooHigh = await call('owner', 'PATCH', `/products/${productId}`, { price: 25000 })
    expect(tooHigh.status).toBe(422)
    expect((await errorOf(tooHigh)).details.properties.compareAtPrice).toBeDefined()
    const cleared = await data(
      await call('owner', 'PATCH', `/products/${productId}`, {
        price: 25000,
        compareAtPrice: null,
      }),
    )
    expect(cleared).toMatchObject({ price: 25000, compareAtPrice: null })
    const logs = await db
      .select({ changes: auditLogs.changes })
      .from(auditLogs)
      .where(and(eq(auditLogs.entityId, productId), eq(auditLogs.action, 'product.update')))
    expect(logs.some((l) => (l.changes as Json).compareAtPrice?.to === null)).toBe(true)
  })

  test('English translation: partial edit keeps the name, null removes it', async () => {
    const withDesc = await data(
      await call('owner', 'PATCH', `/products/${productId}`, {
        en: { name: 'Cassava Chips', description: 'Crunchy' },
      }),
    )
    expect(withDesc.en).toEqual({ name: 'Cassava Chips', description: 'Crunchy' })
    const renamed = await data(
      await call('owner', 'PATCH', `/products/${productId}`, { en: { name: 'Cassava Crisps' } }),
    )
    expect(renamed.en).toEqual({ name: 'Cassava Crisps', description: 'Crunchy' })
    const removed = await data(await call('owner', 'PATCH', `/products/${productId}`, { en: null }))
    expect(removed.en).toBeNull()
  })

  test('publishing needs a photo; then it is public with its promo fields', async () => {
    const noPhoto = await call('owner', 'POST', `/products/${productId}/publish`)
    expect(noPhoto.status).toBe(409)
    expect((await errorOf(noPhoto)).details.reason).toBe('NO_PHOTO')

    await db.insert(productImages).values({ productId, storageKey: `test/${tag}.webp` })
    await call('owner', 'PATCH', `/products/${productId}`, { price: 20000, compareAtPrice: 25000 })
    const published = await data(await call('owner', 'POST', `/products/${productId}/publish`))
    expect(published.status).toBe('published')
    expect(published.images).toHaveLength(1)

    const pub = await app.request(`/v1/products/${productSlug}`)
    expect(pub.status).toBe(200)
    expect(await data(pub)).toMatchObject({ price: 20000, compareAtPrice: 25000, isFree: false })
  })

  test('price 0 makes it free on public pages', async () => {
    await call('owner', 'PATCH', `/products/${productId}`, { price: 0 })
    const pub = await data(await app.request(`/v1/products/${productSlug}`))
    expect(pub).toMatchObject({ price: 0, compareAtPrice: 25000, isFree: true })
  })

  test('the business list is scoped to that business and includes drafts', async () => {
    const res = await call('adminV1', 'GET', `/businesses/${bizB}/products`)
    const list = (await res.json()) as { data: Json[]; meta: Json }
    expect(list.meta.total).toBe(2)
    expect(list.data.every((p) => p.business.id === bizB && p.status === 'draft')).toBe(true)
    const published = (await (
      await call('owner', 'GET', `/businesses/${bizA}/products?status=published`)
    ).json()) as { data: Json[] }
    expect(published.data.map((p) => p.id)).toEqual([productId])
  })

  test('unpublish hides it; soft delete removes it everywhere', async () => {
    const hidden = await data(await call('owner', 'POST', `/products/${productId}/unpublish`))
    expect(hidden.status).toBe('draft')
    expect((await app.request(`/v1/products/${productSlug}`)).status).toBe(404)

    expect((await call('owner', 'DELETE', `/products/${productId}`)).status).toBe(204)
    expect((await call('owner', 'GET', `/products/${productId}`)).status).toBe(404)
    const [row] = await db
      .select({ deletedAt: products.deletedAt })
      .from(products)
      .where(eq(products.id, productId))
    expect(row?.deletedAt).not.toBeNull()
  })
})
