import { createAuth } from '@repo/auth/server'
import { createDb } from '@repo/db'
import { createApp } from './app'
import { loadEnv } from './env'

const env = loadEnv()
const db = createDb(env.DATABASE_URL)
const auth = createAuth({
  db,
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.API_URL,
  trustedOrigins: env.TRUSTED_ORIGINS,
  cookieDomain: env.COOKIE_DOMAIN,
})

const app = createApp({ db, auth, trustedOrigins: env.TRUSTED_ORIGINS })

console.log(`API listening on http://localhost:${env.API_PORT} (docs: /docs)`)

export default {
  port: env.API_PORT,
  fetch: app.fetch,
}
