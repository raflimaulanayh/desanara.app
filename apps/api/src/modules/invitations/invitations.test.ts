import { afterAll, beforeAll, expect, test } from 'bun:test'
import {
  accounts,
  auditLogs,
  businesses,
  businessMembers,
  invitations,
  sessions,
  users,
  verifications,
  villageMembers,
  villages,
} from '@repo/db'
import { eq, inArray, like } from 'drizzle-orm'
import { codeFrom } from '../../test/mailer'
import { TEST_PASSWORD, createTestApp, describeDb, signIn, signUp } from '../../test/db'

type Json = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

describeDb('accounts and invitations', () => {
  const { db, auth, app, mailer } = createTestApp()
  const tag = `i${Date.now().toString(36)}`
  const domain = `${tag}.test.local`
  const people = {} as Record<
    'superAdmin' | 'admin' | 'pendamping' | 'owner' | 'helper',
    { id: string; cookie: string }
  >
  let village = ''
  let business = ''
  let otherBusiness = ''

  const call = (who: keyof typeof people | null, method: string, path: string, body?: unknown) =>
    app.request(path, {
      method,
      headers: {
        ...(who ? { Cookie: people[who].cookie } : {}),
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  const invite = (who: keyof typeof people, body: Json) =>
    call(who, 'POST', '/v1/manage/invitations', body)
  const tokenOf = (url: string) => new URL(url).pathname.split('/').pop()!
  const reason = async (res: Response) =>
    ((await res.json()) as { error: { details?: { reason?: string } } }).error.details?.reason

  beforeAll(async () => {
    const [v] = await db
      .insert(villages)
      .values({ slug: `${tag}-desa`, name: `Desa ${tag}` })
      .returning({ id: villages.id })
    village = v!.id
    const rows = await db
      .insert(businesses)
      .values([
        { villageId: village, slug: `${tag}-satu`, name: 'Keripik Satu' },
        { villageId: village, slug: `${tag}-dua`, name: 'Kopi Dua' },
      ])
      .returning({ id: businesses.id })
    business = rows[0]!.id
    otherBusiness = rows[1]!.id
    for (const key of ['superAdmin', 'admin', 'pendamping', 'owner', 'helper'] as const) {
      people[key] = await signUp(auth, `${key.toLowerCase()}@${domain}`, key)
    }
    await db
      .update(users)
      .set({ globalRole: 'super_admin' })
      .where(eq(users.id, people.superAdmin.id))
    await db.insert(villageMembers).values([
      { villageId: village, userId: people.admin.id, role: 'village_admin' },
      { villageId: village, userId: people.pendamping.id, role: 'village_assistant' },
    ])
    await db.insert(businessMembers).values([
      { businessId: business, userId: people.pendamping.id, role: 'assistant' },
      { businessId: business, userId: people.owner.id, role: 'owner' },
      { businessId: business, userId: people.helper.id, role: 'assistant' },
    ])
  })

  afterAll(async () => {
    const userIds = (
      await db
        .select({ id: users.id })
        .from(users)
        .where(like(users.email, `%@${domain}`))
    ).map((u) => u.id)
    await db.delete(auditLogs).where(eq(auditLogs.villageId, village))
    await db.delete(invitations).where(eq(invitations.villageId, village))
    await db
      .delete(businessMembers)
      .where(inArray(businessMembers.businessId, [business, otherBusiness]))
    await db.delete(villageMembers).where(eq(villageMembers.villageId, village))
    await db.delete(businesses).where(eq(businesses.villageId, village))
    await db.delete(villages).where(eq(villages.id, village))
    await db.delete(verifications).where(like(verifications.identifier, `%@${domain}`))
    await db.delete(sessions).where(inArray(sessions.userId, userIds))
    await db.delete(accounts).where(inArray(accounts.userId, userIds))
    await db.delete(users).where(inArray(users.id, userIds))
  })

  test('public sign-up is closed', async () => {
    const res = await app.request('/api/auth/sign-up/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `spam@${domain}`, name: 'Spam', password: 'spam-spam-1' }),
    })
    expect(res.ok).toBe(false)
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.email, `spam@${domain}`))
    expect(row).toBeUndefined()
  })

  test('an emailed invitation creates a verified account that signs in at once', async () => {
    const email = `bu.ani@${domain}`
    const res = await invite('admin', {
      role: 'owner',
      businessId: otherBusiness,
      inviteeName: 'Bu Ani',
      inviteeEmail: email.toUpperCase(),
    })
    expect(res.status).toBe(201)
    const created = ((await res.json()) as { data: Json }).data
    expect(created.emailed).toBe(true)
    expect(created.targetName).toBe('Kopi Dua')

    const sent = mailer.last(email)!
    expect(sent.subject).toContain('Kopi Dua')
    const link = new URL(sent.text.match(/https?:\/\/\S+/)![0])
    const token = tokenOf(link.origin + link.pathname)
    const proof = link.searchParams.get('e')!

    const preview = await call(null, 'GET', `/v1/invitations/${token}`)
    expect(preview.status).toBe(200)
    const p = ((await preview.json()) as { data: Json }).data
    expect(p).toMatchObject({ role: 'owner', inviteeName: 'Bu Ani', inviteeEmail: email })

    const wrong = await call(null, 'POST', `/v1/invitations/${token}/accept`, {
      name: 'Bu Ani',
      email: `lain@${domain}`,
      password: 'kopigayo1',
      emailProof: proof,
    })
    expect(wrong.status).toBe(422)

    const ok = await call(null, 'POST', `/v1/invitations/${token}/accept`, {
      name: 'Bu Ani',
      email,
      password: 'kopigayo1',
      emailProof: proof,
    })
    expect(ok.status).toBe(200)
    expect(((await ok.json()) as { data: Json }).data.emailVerified).toBe(true)
    expect(await signIn(auth, email, 'kopigayo1')).toContain('session_token')

    const again = await call(null, 'POST', `/v1/invitations/${token}/accept`, {
      name: 'Orang Lain',
      email,
      password: 'kopigayo1',
    })
    expect(again.status).toBe(409)
    expect(await reason(again)).toBe('USED')
  })

  test('a WhatsApp invitation needs the 6-digit code, which then signs the person in', async () => {
    const email = `pak.budi@${domain}`
    const res = await invite('pendamping', { role: 'owner', businessId: business })
    expect(res.status).toBe(201)
    const created = ((await res.json()) as { data: Json }).data
    expect(created.emailed).toBe(false)
    const token = tokenOf(created.url)

    // A forged proof does not skip verification.
    const accepted = await call(null, 'POST', `/v1/invitations/${token}/accept`, {
      name: 'Pak Budi',
      email,
      password: 'dodolgarut',
      emailProof: 'x'.repeat(32),
    })
    expect(accepted.status).toBe(200)
    expect(((await accepted.json()) as { data: Json }).data.emailVerified).toBe(false)

    // Signing in is refused and sends a code.
    const refused = await auth.api.signInEmail({
      body: { email, password: 'dodolgarut' },
      asResponse: true,
    })
    expect(refused.status).toBe(403)
    const code = codeFrom(mailer.last(email))

    const bad = await auth.api.verifyEmailOTP({ body: { email, otp: '000000' }, asResponse: true })
    expect(bad.ok).toBe(false)
    const verified = await auth.api.verifyEmailOTP({ body: { email, otp: code }, asResponse: true })
    expect(verified.status).toBe(200)
    const cookie = (verified.headers.get('set-cookie') ?? '').split(';')[0]!
    expect(cookie).toContain('session_token')

    const me = await app.request('/v1/me', { headers: { Cookie: cookie } })
    expect(me.status).toBe(200)
    const [member] = await db
      .select({ role: businessMembers.role })
      .from(businessMembers)
      .innerJoin(users, eq(users.id, businessMembers.userId))
      .where(eq(users.email, email))
    expect(member?.role).toBe('owner')
  })

  test('nobody hands out a role above their own', async () => {
    expect(
      (await invite('pendamping', { role: 'village_assistant', villageId: village })).status,
    ).toBe(403)
    expect((await invite('pendamping', { role: 'owner', businessId: otherBusiness })).status).toBe(
      403,
    )
    expect((await invite('helper', { role: 'owner', businessId: business })).status).toBe(403)
    expect((await invite('helper', { role: 'assistant', businessId: business })).status).toBe(403)
    expect((await invite('admin', { role: 'village_admin', villageId: village })).status).toBe(403)
    expect((await invite('owner', { role: 'assistant', businessId: business })).status).toBe(201)
    expect((await invite('admin', { role: 'village_assistant', villageId: village })).status).toBe(
      201,
    )
    expect((await invite('superAdmin', { role: 'village_admin', villageId: village })).status).toBe(
      201,
    )
  })

  test('revoked and expired links stop working; admins see what is pending', async () => {
    const created = (
      (await (await invite('admin', { role: 'village_assistant', villageId: village })).json()) as {
        data: Json
      }
    ).data
    const pending = await call('admin', 'GET', `/v1/manage/invitations?villageId=${village}`)
    expect(pending.status).toBe(200)
    const list = ((await pending.json()) as { data: Json[] }).data
    expect(list.some((i) => i.id === created.id)).toBe(true)
    expect(
      (await call('pendamping', 'GET', `/v1/manage/invitations?villageId=${village}`)).status,
    ).toBe(403)

    expect((await call('admin', 'DELETE', `/v1/manage/invitations/${created.id}`)).status).toBe(204)
    const revoked = await call(null, 'GET', `/v1/invitations/${tokenOf(created.url)}`)
    expect(revoked.status).toBe(409)
    expect(await reason(revoked)).toBe('REVOKED')

    const old = (
      (await (await invite('admin', { role: 'village_assistant', villageId: village })).json()) as {
        data: Json
      }
    ).data
    await db
      .update(invitations)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(eq(invitations.id, old.id))
    const expired = await call(null, 'GET', `/v1/invitations/${tokenOf(old.url)}`)
    expect(await reason(expired)).toBe('EXPIRED')
  })

  test('an existing account joins with its session; another account cannot use it', async () => {
    const res = await invite('admin', {
      role: 'assistant',
      businessId: otherBusiness,
      inviteeEmail: `owner@${domain}`,
    })
    const token = tokenOf(((await res.json()) as { data: Json }).data.url)
    const preview = (
      (await (await call(null, 'GET', `/v1/invitations/${token}`)).json()) as { data: Json }
    ).data
    expect(preview.accountExists).toBe(true)

    const wrong = await call('helper', 'POST', `/v1/invitations/${token}/accept`, {})
    expect(await reason(wrong)).toBe('WRONG_ACCOUNT')
    const ok = await call('owner', 'POST', `/v1/invitations/${token}/accept`, {})
    expect(ok.status).toBe(200)
  })

  test('a member is raised to the invited role; the same or a lower role keeps the link usable', async () => {
    // The helper (assistant of `business`) is handed the business as owner.
    const res = await invite('admin', { role: 'owner', businessId: business })
    const token = tokenOf(((await res.json()) as { data: Json }).data.url)
    expect((await call('helper', 'POST', `/v1/invitations/${token}/accept`, {})).status).toBe(200)
    const [row] = await db
      .select({ role: businessMembers.role })
      .from(businessMembers)
      .where(eq(businessMembers.userId, people.helper.id))
    expect(row?.role).toBe('owner')
    await db
      .update(businessMembers)
      .set({ role: 'assistant' })
      .where(eq(businessMembers.userId, people.helper.id))

    const same = await invite('admin', { role: 'assistant', businessId: business })
    const sameToken = tokenOf(((await same.json()) as { data: Json }).data.url)
    const refused = await call('owner', 'POST', `/v1/invitations/${sameToken}/accept`, {})
    expect(await reason(refused)).toBe('ALREADY_MEMBER')
    expect((await call(null, 'GET', `/v1/invitations/${sameToken}`)).status).toBe(200)
  })

  test('only people who may invite see invitees; deleted businesses void their links', async () => {
    expect(
      (await call('helper', 'GET', `/v1/manage/invitations?businessId=${business}`)).status,
    ).toBe(403)
    expect(
      (await call('owner', 'GET', `/v1/manage/invitations?businessId=${business}`)).status,
    ).toBe(200)

    const [gone] = await db
      .insert(businesses)
      .values({ villageId: village, slug: `${tag}-hapus`, name: 'Usaha Dihapus' })
      .returning({ id: businesses.id })
    const res = await invite('admin', { role: 'owner', businessId: gone!.id })
    const token = tokenOf(((await res.json()) as { data: Json }).data.url)
    await db.update(businesses).set({ deletedAt: new Date() }).where(eq(businesses.id, gone!.id))
    expect(await reason(await call(null, 'GET', `/v1/invitations/${token}`))).toBe('REVOKED')
  })

  test('forgot password works with a code and never tells whether an email exists', async () => {
    const email = `helper@${domain}`
    const unknown = await auth.api.requestPasswordResetEmailOTP({
      body: { email: `nobody@${domain}` },
      asResponse: true,
    })
    const known = await auth.api.requestPasswordResetEmailOTP({ body: { email }, asResponse: true })
    expect(unknown.status).toBe(known.status)
    expect(await unknown.text()).toBe(await known.text())

    const code = codeFrom(mailer.last(email))
    const reset = await auth.api.resetPasswordEmailOTP({
      body: { email, otp: code, password: 'password-baru-1' },
      asResponse: true,
    })
    expect(reset.status).toBe(200)
    expect(await signIn(auth, email, 'password-baru-1')).toContain('session_token')
    const old = await auth.api.signInEmail({
      body: { email, password: TEST_PASSWORD },
      asResponse: true,
    })
    expect(old.ok).toBe(false)
  })

  test('one person may create at most 30 invitations a day', async () => {
    const now = new Date()
    await db.insert(invitations).values(
      Array.from({ length: 30 }, (_, i) => ({
        tokenHash: `${tag}-cap-${i}`,
        target: 'business' as const,
        villageId: village,
        businessId: business,
        businessRole: 'assistant' as const,
        expiresAt: now,
        createdBy: people.owner.id,
      })),
    )
    const res = await invite('owner', { role: 'assistant', businessId: business })
    expect(res.status).toBe(409)
    expect(await reason(res)).toBe('DAILY_LIMIT')
  })
})
