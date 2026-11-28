import { type Database, rateLimits } from '@repo/db'
import { sql } from 'drizzle-orm'
import type { Context } from 'hono'
import type { AppEnv } from './context'

/**
 * Client address for rate limiting: the first `X-Forwarded-For` hop (set by Vercel and the VPS proxy),
 * else `X-Real-IP`. Only ever stored hashed (see `hashedClientKey`).
 */
export function clientAddress(c: Context<AppEnv>) {
  const forwarded = c.req.header('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || c.req.header('x-real-ip') || 'unknown'
}

/** SHA-256 of the address with the app secret, so `rate_limits` never holds a real IP. */
export async function hashedClientKey(c: Context<AppEnv>) {
  const data = new TextEncoder().encode(`${c.get('secret')}:${clientAddress(c)}`)
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', data))
  return Array.from(digest.slice(0, 16), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Fixed-window counter in the shared `rate_limits` table (the same one Better Auth uses), so every
 * function instance sees the same count. Returns false when this call goes over `limit` in `windowMs`.
 */
export async function hit(db: Database, key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const windowStart = now - windowMs
  const [row] = await db
    .insert(rateLimits)
    .values({ id: crypto.randomUUID(), key, count: 1, lastRequest: now })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`case when ${rateLimits.lastRequest} < ${windowStart} then 1 else ${rateLimits.count} + 1 end`,
        lastRequest: sql`case when ${rateLimits.lastRequest} < ${windowStart} then ${now} else ${rateLimits.lastRequest} end`,
      },
    })
    .returning({ count: rateLimits.count })
  return (row?.count ?? 1) <= limit
}
