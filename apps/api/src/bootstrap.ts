import { createAuth } from '@repo/auth/server'
import { createDb } from '@repo/db'
import { createMailer } from '@repo/email'
import { waitUntil } from '@vercel/functions'
import { createApp, type DocsAccess } from './app'
import { type Env, loadEnv } from './env'
import { createR2Storage } from './lib/storage'

/**
 * Wires env → database → auth → app. Shared by the local Bun server (src/index.ts) and the
 * Vercel function (src/vercel.ts) so both run the exact same app.
 */
export function bootstrap(env: Env = loadEnv()) {
  const db = createDb(env.DATABASE_URL, { max: env.DB_POOL_MAX })
  const mailer = createMailer({
    apiKey: env.RESEND_API_KEY,
    from: env.EMAIL_FROM,
    replyTo: env.EMAIL_REPLY_TO,
  })
  const auth = createAuth({
    db,
    secret: env.BETTER_AUTH_SECRET,
    // Public origin the browser sees for /api/auth/* (the dashboard when it proxies the API).
    baseURL: env.AUTH_BASE_URL ?? env.API_URL,
    trustedOrigins: env.TRUSTED_ORIGINS,
    cookieDomain: env.COOKIE_DOMAIN,
    mailer,
    rateLimit: env.NODE_ENV === 'production',
    // On Vercel this keeps the function alive until the email is sent; elsewhere it just runs.
    backgroundTask: waitUntil,
  })
  const docs: DocsAccess = env.DOCS_PASSWORD
    ? { mode: 'password', username: env.DOCS_USERNAME, password: env.DOCS_PASSWORD }
    : env.NODE_ENV === 'production'
      ? { mode: 'off' }
      : { mode: 'open' }
  const storage =
    env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY
      ? createR2Storage({
          accountId: env.R2_ACCOUNT_ID,
          bucket: env.R2_BUCKET,
          accessKeyId: env.R2_ACCESS_KEY_ID,
          secretAccessKey: env.R2_SECRET_ACCESS_KEY,
        })
      : null
  const app = createApp({
    db,
    auth,
    storage,
    mailer,
    secret: env.BETTER_AUTH_SECRET,
    dashboardUrl: env.DASHBOARD_URL,
    trustedOrigins: env.TRUSTED_ORIGINS,
    docs,
  })
  return { env, app }
}
