import { describe } from 'bun:test'
import { createAuth } from '@repo/auth/server'
import { createDb, type Database } from '@repo/db'
import { createApp } from '../app'
import { createCredentialUser } from '../lib/accounts'
import { type Storage, createMemoryStorage } from '../lib/storage'
import { createTestMailer } from './mailer'

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

/** Which database each test auth instance writes to (for signUp). */
const databaseOf = new WeakMap<object, Database>()

/** `storage: null` simulates an API without R2 configured. */
export function createTestApp({
  storage = createMemoryStorage(),
}: { storage?: ReturnType<typeof createMemoryStorage> | Storage | null } = {}) {
  const db: Database = createDb(testDatabaseUrl!, { max: 4 })
  const mailer = createTestMailer()
  const secret = 'test-secret-test-secret-test-secret'
  const auth = createAuth({
    db,
    secret,
    baseURL: 'http://localhost:8787',
    trustedOrigins: [],
    mailer,
  })
  const app = createApp({
    db,
    auth,
    storage,
    mailer,
    secret,
    dashboardUrl: 'http://localhost:3001',
    trustedOrigins: [],
    logRequests: false,
  })
  databaseOf.set(auth, db)
  return { db, auth, app, storage, mailer }
}

export const TEST_PASSWORD = 'test-password-123'

/** Signs in through Better Auth and returns the session cookie. */
export async function signIn(
  auth: ReturnType<typeof createAuth>,
  email: string,
  password = TEST_PASSWORD,
) {
  const res = await auth.api.signInEmail({ body: { email, password }, asResponse: true })
  if (!res.ok) throw new Error(`sign-in failed: ${res.status} ${await res.text()}`)
  return (res.headers.get('set-cookie') ?? '').split(';')[0]!
}

/**
 * Creates a verified account (public sign-up is off) and signs it in.
 * Returns its id and session cookie.
 */
export async function signUp(auth: ReturnType<typeof createAuth>, email: string, name: string) {
  const database = databaseOf.get(auth)
  if (!database) throw new Error('signUp needs an auth instance from createTestApp()')
  const id = await createCredentialUser(database, {
    name,
    email,
    password: TEST_PASSWORD,
    emailVerified: true,
  })
  return { id, cookie: await signIn(auth, email) }
}
