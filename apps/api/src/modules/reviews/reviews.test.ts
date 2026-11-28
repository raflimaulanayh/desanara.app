import { afterAll, beforeAll, expect, test } from 'bun:test'
import {
  accounts,
  auditLogs,
  businessMembers,
  businesses,
  productReviews,
  products,
  rateLimits,
  sessions,
  users,
  villageMembers,
  villages,
} from '@repo/db'
import { inArray, like } from 'drizzle-orm'
import { createTestApp, describeDb, signUp } from '../../test/db'

type Json = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

/** Public buyer reviews and their moderation (PLAN-product-reviews). */
describeDb('product reviews', () => {
  const { db, auth, app } = createTestApp()
  const tag = `r${Date.now().toString(36)}`
  const emailDomain = `${tag}.test.local`
  const villageIds: string[] = []
  const businessIds: string[] = []
  const people = {} as Record<
    'adminV1' | 'adminV2' | 'assistantV1' | 'owner' | 'stranger',
    { id: string; cookie: string }
  >
  let v1 = ''
  let slug = ''
  let draftSlug = ''
  let productId = ''
  let ip = 0

  /** Every call comes from a fresh address unless one is given, so the limits do not leak between tests. */
  const send = (path: string, body: unknown, address = `10.9.${tag.length}.${++ip}`) =>
    app.request(`/v1${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': address },
      body: JSON.stringify(body),
    })
  const manage = (who: keyof typeof people, method: string, path: string, body?: unknown) =>
    app.request(`/v1/manage/reviews${path}`, {
      method,
      headers: {
        Cookie: people[who].cookie,
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  const json = async (res: Response) => (await res.json()) as Json
  const review = (overrides: Json = {}) => ({
    reviewerName: 'Rina S.',
    rating: 5,
    body: 'Keripiknya renyah dan bumbunya pas.',
    ...overrides,
  })

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
    const [biz] = await db
      .insert(businesses)
      .values({
        villageId: v1,
        slug: `${tag}-warung`,
        name: `Warung ${tag}`,
        whatsappNumber: '6281234567890',
        status: 'published',
        verificationStatus: 'verified',
        consentAt: new Date(),
        consentMethod: 'paper_form',
      })
      .returning({ id: businesses.id })
    businessIds.push(biz!.id)
    await db
      .insert(businessMembers)
      .values({ businessId: biz!.id, userId: people.owner.id, role: 'owner' })
    slug = `${tag}-keripik`
    draftSlug = `${tag}-draf`
    const ps = await db
      .insert(products)
      .values([
        {
          businessId: biz!.id,
          villageId: v1,
          slug,
          name: 'Keripik',
          price: 15000,
          status: 'published',
        },
        { businessId: biz!.id, villageId: v1, slug: draftSlug, name: 'Draf', price: 1000 },
      ])
      .returning({ id: products.id })
    productId = ps[0]!.id
  })

  afterAll(async () => {
    const userIds = (
      await db
        .select({ id: users.id })
        .from(users)
        .where(like(users.email, `%@${emailDomain}`))
    ).map((u) => u.id)
    await db.delete(auditLogs).where(inArray(auditLogs.villageId, villageIds))
    await db.delete(productReviews).where(inArray(productReviews.villageId, villageIds))
    await db.delete(products).where(inArray(products.villageId, villageIds))
    await db.delete(businessMembers).where(inArray(businessMembers.businessId, businessIds))
    await db.delete(businesses).where(inArray(businesses.villageId, villageIds))
    await db.delete(villageMembers).where(inArray(villageMembers.villageId, villageIds))
    await db.delete(villages).where(inArray(villages.id, villageIds))
    await db.delete(rateLimits).where(like(rateLimits.key, 'review:%'))
    if (userIds.length) {
      await db.delete(sessions).where(inArray(sessions.userId, userIds))
      await db.delete(accounts).where(inArray(accounts.userId, userIds))
      await db.delete(users).where(inArray(users.id, userIds))
    }
  })

  test('a new review waits for moderation and is not public yet', async () => {
    const res = await send(`/products/${slug}/reviews`, review())
    expect(res.status).toBe(202)
    expect((await json(res)).data.status).toBe('pending')
    const list = await json(await app.request(`/v1/products/${slug}/reviews`))
    expect(list.data).toHaveLength(0)
    expect(list.meta.summary).toEqual({
      average: null,
      count: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    })
  })

  test('drafts, unknown products and invalid input are refused', async () => {
    expect((await send(`/products/${draftSlug}/reviews`, review())).status).toBe(404)
    expect((await send(`/products/${tag}-nope/reviews`, review())).status).toBe(404)
    expect((await send(`/products/${slug}/reviews`, review({ rating: 7 }))).status).toBe(422)
    expect((await send(`/products/${slug}/reviews`, review({ body: 'ok' }))).status).toBe(422)
  })

  test('a filled honeypot looks accepted but stores nothing', async () => {
    const before = await db.$count(productReviews, inArray(productReviews.villageId, villageIds))
    const res = await send(`/products/${slug}/reviews`, review({ website: 'http://spam.test' }))
    expect(res.status).toBe(202)
    expect(await db.$count(productReviews, inArray(productReviews.villageId, villageIds))).toBe(
      before,
    )
  })

  test('one address may review a product once a day', async () => {
    const address = `10.8.0.${++ip}`
    expect((await send(`/products/${slug}/reviews`, review(), address)).status).toBe(202)
    const again = await send(`/products/${slug}/reviews`, review(), address)
    expect(again.status).toBe(429)
    expect((await json(again)).error.code).toBe('RATE_LIMITED')
  })

  test('the business sees its queue but cannot moderate', async () => {
    const queue = await json(await manage('owner', 'GET', `?businessId=${businessIds[0]}`))
    expect(queue.meta.counts.pending).toBe(2)
    const first = queue.data[0]
    expect(first.canModerate).toBe(false)
    expect(first.canReply).toBe(false)
    expect((await manage('owner', 'PATCH', `/${first.id}`, { status: 'approved' })).status).toBe(
      403,
    )
    expect((await manage('owner', 'GET', `?villageId=${v1}`)).status).toBe(403)
  })

  test('other villages and strangers see nothing', async () => {
    const [row] = await db
      .select({ id: productReviews.id })
      .from(productReviews)
      .where(inArray(productReviews.villageId, villageIds))
    expect((await manage('adminV2', 'PATCH', `/${row!.id}`, { status: 'approved' })).status).toBe(
      404,
    )
    expect((await manage('stranger', 'GET', `?villageId=${v1}`)).status).toBe(403)
    expect((await manage('stranger', 'GET', '')).status).toBe(422)
  })

  test('the village assistant approves, the summary counts it, the owner replies', async () => {
    const queue = await json(await manage('assistantV1', 'GET', `?villageId=${v1}&status=pending`))
    const [first, second] = queue.data
    expect(first.canModerate).toBe(true)

    expect(
      (await manage('assistantV1', 'PATCH', `/${second.id}`, { status: 'rejected' })).status,
    ).toBe(422)
    const rejected = await json(
      await manage('assistantV1', 'PATCH', `/${second.id}`, {
        status: 'rejected',
        rejectionReason: 'spam',
      }),
    )
    expect(rejected.data.rejectionReason).toBe('spam')

    const approved = await json(
      await manage('assistantV1', 'PATCH', `/${first.id}`, { status: 'approved' }),
    )
    expect(approved.data.status).toBe('approved')

    const list = await json(await app.request(`/v1/products/${slug}/reviews`))
    expect(list.data).toHaveLength(1)
    expect(list.meta.summary.average).toBe(5)
    expect(list.meta.summary.count).toBe(1)

    const product = await json(await app.request(`/v1/products/${slug}`))
    expect(product.data.ratingAverage).toBe(5)
    expect(product.data.ratingCount).toBe(1)

    expect(
      (await manage('owner', 'PUT', `/${second.id}/reply`, { reply: 'Terima kasih' })).status,
    ).toBe(409)
    const replied = await json(
      await manage('owner', 'PUT', `/${first.id}/reply`, { reply: ' Terima kasih, Bu! ' }),
    )
    expect(replied.data.reply).toBe('Terima kasih, Bu!')
    const publicList = await json(await app.request(`/v1/products/${slug}/reviews`))
    expect(publicList.data[0].reply).toBe('Terima kasih, Bu!')

    const removed = await json(await manage('owner', 'DELETE', `/${first.id}/reply`))
    expect(removed.data.reply).toBeNull()

    const audit = await db
      .select({ action: auditLogs.action })
      .from(auditLogs)
      .where(inArray(auditLogs.entityId, [first.id, second.id]))
    expect(audit.map((a) => a.action).sort()).toEqual([
      'review.moderate',
      'review.moderate',
      'review.reply',
      'review.reply',
    ])
    expect(productId).toBeTruthy()
  })
})
