import { afterAll, expect, test } from 'bun:test'
import { createAuth } from '@repo/auth/server'
import { createDb, rateLimits } from '@repo/db'
import { like } from 'drizzle-orm'
import { describeDb, testDatabaseUrl } from '../../test/db'
import { createTestMailer } from '../../test/mailer'

/** Counters live in the database, so every Vercel function instance shares them. */
describeDb('auth rate limits', () => {
  const db = createDb(testDatabaseUrl!, { max: 2 })
  const ip = `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.7`
  const auth = createAuth({
    db,
    secret: 'test-secret-test-secret-test-secret',
    baseURL: 'http://localhost:8787',
    trustedOrigins: [],
    mailer: createTestMailer(),
    rateLimit: true,
  })

  afterAll(async () => {
    await db.delete(rateLimits).where(like(rateLimits.key, `${ip}%`))
  })

  test('the sixth sign-in attempt in a minute from one address is refused', async () => {
    const attempt = () =>
      auth.handler(
        new Request('http://localhost:8787/api/auth/sign-in/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': ip },
          body: JSON.stringify({ email: 'nobody@rate.test.local', password: 'wrong-password' }),
        }),
      )
    const statuses: number[] = []
    for (let i = 0; i < 6; i++) statuses.push((await attempt()).status)
    expect(statuses.slice(0, 5).every((s) => s !== 429)).toBe(true)
    expect(statuses[5]).toBe(429)
    const rows = await db
      .select()
      .from(rateLimits)
      .where(like(rateLimits.key, `${ip}%`))
    expect(rows.length).toBeGreaterThan(0)
  })
})
