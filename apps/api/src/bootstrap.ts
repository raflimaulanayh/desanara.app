import { createAuth } from '@repo/auth/server'
import { createDb } from '@repo/db'
import { createApp, type DocsAccess } from './app'
import { type Env, loadEnv } from './env'

/**
 * Wires env → database → auth → app. Shared by the local Bun server (src/index.ts) and the
 * Vercel function (src/vercel.ts) so both run the exact same app.
 */
export function bootstrap(env: Env = loadEnv()) {
  const db = createDb(env.DATABASE_URL, { max: env.DB_POOL_MAX })
  const auth = createAuth({
    db,
    secret: env.BETTER_AUTH_SECRET,
    // Public origin the browser sees for /api/auth/* (the dashboard when it proxies the API).
    baseURL: env.AUTH_BASE_URL ?? env.API_URL,
    trustedOrigins: env.TRUSTED_ORIGINS,
    cookieDomain: env.COOKIE_DOMAIN,
  })
  const docs: DocsAccess = env.DOCS_PASSWORD
    ? { mode: 'password', username: env.DOCS_USERNAME, password: env.DOCS_PASSWORD }
    : env.NODE_ENV === 'production'
      ? { mode: 'off' }
      : { mode: 'open' }
  const app = createApp({ db, auth, trustedOrigins: env.TRUSTED_ORIGINS, docs })
  return { env, app }
}
