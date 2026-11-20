import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { emailOTP } from 'better-auth/plugins'
import type { Database } from '@repo/db'
import { schema } from '@repo/db'
import { type Mailer, codeEmail } from '@repo/email'

/** Better Auth's password hash (scrypt), for accounts created outside its sign-up endpoint. */
export { hashPassword } from 'better-auth/crypto'

/**
 * Server-only Better Auth instance. Mounted by apps/api at /api/auth/*.
 * Authentication only — authorization lives in ./permissions.ts.
 * Never import this file from apps/web or apps/dashboard (ESLint enforces it).
 *
 * Accounts are created only from invitations (apps/api, module invitations): public sign-up is off.
 * Email is verified with a 6-digit code typed on the same screen (docs/plan/PLAN-registration-email.md).
 */
export interface CreateAuthOptions {
  db: Database
  secret: string
  baseURL: string
  trustedOrigins: string[]
  /** Parent domain (e.g. "desanara.app") so web/dashboard/api share the session cookie. */
  cookieDomain?: string
  /** Sends the one-time codes. */
  mailer: Mailer
  /** Rate limits stored in the database. Off in tests and local development. */
  rateLimit?: boolean
  /**
   * Keeps a serverless function alive for work after the response (Vercel `waitUntil`). With it,
   * code emails are sent in the background, so the answer takes the same time whether or not the
   * email has an account. Without it (tests) they are awaited.
   */
  backgroundTask?: (promise: Promise<unknown>) => void
}

/** One-time codes: 6 digits, 10 minutes, 5 tries. */
export const OTP_MINUTES = 10

export function createAuth({
  db,
  secret,
  baseURL,
  trustedOrigins,
  cookieDomain,
  mailer,
  rateLimit = false,
  backgroundTask,
}: CreateAuthOptions) {
  return betterAuth({
    secret,
    baseURL,
    trustedOrigins,
    database: drizzleAdapter(db, { provider: 'pg', usePlural: true, schema }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      // Accounts come from invitations only.
      disableSignUp: true,
      requireEmailVerification: true,
      revokeSessionsOnPasswordReset: true,
    },
    emailVerification: {
      // Signing in with an unverified email sends a fresh code, so the login page can ask for it.
      sendOnSignIn: true,
      // A correct code signs the person in: no second login.
      autoSignInAfterVerification: true,
    },
    plugins: [
      emailOTP({
        otpLength: 6,
        expiresIn: OTP_MINUTES * 60,
        allowedAttempts: 5,
        // Codes never create accounts.
        disableSignUp: true,
        overrideDefaultEmailVerification: true,
        storeOTP: 'hashed',
        async sendVerificationOTP({ email, otp, type }) {
          // A failed send is logged, never surfaced: an error only for existing accounts would tell
          // an attacker which emails are registered.
          try {
            await mailer.send(
              codeEmail({ to: email, code: otp, purpose: type, minutes: OTP_MINUTES }),
            )
          } catch (e) {
            console.error(`[auth] code email (${type}) failed:`, (e as Error).message)
          }
        },
      }),
    ],
    rateLimit: {
      enabled: rateLimit,
      // Memory counters are per function instance on Vercel, so they would not limit anything.
      storage: 'database',
      window: 60,
      max: 100,
      customRules: {
        '/sign-in/email': { window: 60, max: 5 },
        '/email-otp/send-verification-otp': { window: 60, max: 3 },
        '/email-otp/request-password-reset': { window: 60, max: 3 },
        '/email-otp/verify-email': { window: 60, max: 10 },
        '/email-otp/reset-password': { window: 60, max: 10 },
      },
    },
    user: {
      additionalFields: {
        phone: { type: 'string', required: false },
        globalRole: { type: 'string', required: false, input: false },
        isSeed: { type: 'boolean', required: false, defaultValue: false, input: false },
      },
    },
    advanced: {
      ...(cookieDomain ? { crossSubDomainCookies: { enabled: true, domain: cookieDomain } } : {}),
      ...(backgroundTask ? { backgroundTasks: { handler: backgroundTask } } : {}),
    },
  })
}

export type Auth = ReturnType<typeof createAuth>
