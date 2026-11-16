import { describe } from 'bun:test'
import { createAuth } from '@repo/auth/server'
import { createDb, type Database } from '@repo/db'
import { createApp } from '../app'
import { type Storage, createMemoryStorage } from '../lib/storage'

/**
 * Integration tests run against a real, migrated Postgres given by TEST_DATABASE_URL.
 * Without it they are skipped (so `bun test` works on a laptop with no database).
 * They refuse any non-local host: never point them at Supabase or the VPS.
 */
export const testDatabaseUrl = process.env.TEST_DATABASE_URL

if (testDatabaseUrl) {
  const host = new URL(testDatabaseUrl).hostname
  if (!['localhost', '127.0.0.1', '::1', 'postgres'].includes(host)) {
    throw new Error(`TEST_DATABASE_URL must point to a local database, got host "${host}"`)
  }
}

export const describeDb = testDatabaseUrl ? describe : describe.skip

/** `storage: null` simulates an API without R2 configured. */
export function createTestApp({
  storage = createMemoryStorage(),
}: { storage?: ReturnType<typeof createMemoryStorage> | Storage | null } = {}) {
  const db: Database = createDb(testDatabaseUrl!, { max: 4 })
  const auth = createAuth({
    db,
    secret: 'test-secret-test-secret-test-secret',
    baseURL: 'http://localhost:8787',
    trustedOrigins: [],
  })
  const app = createApp({ db, auth, storage, trustedOrigins: [], logRequests: false })
  return { db, auth, app, storage }
}

/** Signs up a user through Better Auth and returns its id and session cookie. */
export async function signUp(auth: ReturnType<typeof createAuth>, email: string, name: string) {
  const res = await auth.api.signUpEmail({
    body: { email, name, password: 'test-password-123' },
    asResponse: true,
  })
  if (!res.ok) throw new Error(`sign-up failed: ${res.status} ${await res.text()}`)
  const body = (await res.json()) as { user: { id: string } }
  const cookie = (res.headers.get('set-cookie') ?? '').split(';')[0]!
  return { id: body.user.id, cookie }
}
