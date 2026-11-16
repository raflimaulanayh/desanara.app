import { afterAll, beforeAll, expect, test } from 'bun:test'
import {
  accounts,
  businessMembers,
  businesses,
  sessions,
  users,
  villageMembers,
  villages,
} from '@repo/db'
import { eq, inArray } from 'drizzle-orm'
import { createTestApp, describeDb, signUp } from '../../test/db'

describeDb('/v1/me', () => {
  const { db, auth, app } = createTestApp()
  const tag = `me${Date.now().toString(36)}`
  let me = { id: '', cookie: '' }
  let villageId = ''
  const businessIds: string[] = []

  beforeAll(async () => {
    me = await signUp(auth, `${tag}@${tag}.test.local`, 'Me')
    const [v] = await db
      .insert(villages)
      .values({ slug: tag, name: 'Desa Me' })
      .returning({ id: villages.id })
    villageId = v!.id
    const bs = await db
      .insert(businesses)
      .values([
        { villageId, slug: `${tag}-live`, name: 'Warung Hidup' },
        { villageId, slug: `${tag}-gone`, name: 'Warung Hapus', deletedAt: new Date() },
      ])
      .returning({ id: businesses.id })
    businessIds.push(...bs.map((b) => b.id))
    await db.insert(villageMembers).values({ villageId, userId: me.id, role: 'village_assistant' })
    await db.insert(businessMembers).values(
      businessIds.map((businessId) => ({
        businessId,
        userId: me.id,
        role: 'assistant' as const,
      })),
    )
  })

  afterAll(async () => {
    await db.delete(businessMembers).where(inArray(businessMembers.businessId, businessIds))
    await db.delete(businesses).where(inArray(businesses.id, businessIds))
    await db.delete(villageMembers).where(eq(villageMembers.villageId, villageId))
    await db.delete(villages).where(eq(villages.id, villageId))
    await db.delete(sessions).where(eq(sessions.userId, me.id))
    await db.delete(accounts).where(eq(accounts.userId, me.id))
    await db.delete(users).where(eq(users.id, me.id))
  })

  test('returns the names of live memberships for the dashboard', async () => {
    const res = await app.request('/v1/me', { headers: { Cookie: me.cookie } })
    expect(res.status).toBe(200)
    expect(res.headers.get('cache-control')).toBe('no-store')
    const { data } = (await res.json()) as { data: { memberships: Record<string, unknown[]> } }
    expect(data.memberships.villages).toEqual([
      { id: villageId, slug: tag, name: 'Desa Me', role: 'village_assistant' },
    ])
    expect(data.memberships.businesses).toEqual([
      {
        id: businessIds[0],
        slug: `${tag}-live`,
        name: 'Warung Hidup',
        villageId,
        role: 'assistant',
      },
    ])
  })
})
