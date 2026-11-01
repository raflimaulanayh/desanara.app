import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import type { Database } from '@repo/db'
import { schema } from '@repo/db'

/**
 * Server-only Better Auth instance. Mounted by apps/api at /api/auth/*.
 * Authentication only — authorization lives in ./permissions.ts.
 * Never import this file from apps/web or apps/dashboard (ESLint enforces it).
 */
export interface CreateAuthOptions {
  db: Database
  secret: string
  baseURL: string
  trustedOrigins: string[]
  /** Parent domain (e.g. "sudutdesa.id") so web/dashboard/api share the session cookie. */
  cookieDomain?: string
}

export function createAuth({
  db,
  secret,
  baseURL,
  trustedOrigins,
  cookieDomain,
}: CreateAuthOptions) {
  return betterAuth({
    secret,
    baseURL,
    trustedOrigins,
    database: drizzleAdapter(db, { provider: 'pg', usePlural: true, schema }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
    user: {
      additionalFields: {
        phone: { type: 'string', required: false },
        globalRole: { type: 'string', required: false, input: false },
        isSeed: { type: 'boolean', required: false, defaultValue: false, input: false },
      },
    },
    advanced: cookieDomain
      ? { crossSubDomainCookies: { enabled: true, domain: cookieDomain } }
      : undefined,
  })
}

export type Auth = ReturnType<typeof createAuth>
