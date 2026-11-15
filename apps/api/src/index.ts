import { bootstrap } from './bootstrap'

/** Local server (Bun). Production on Vercel uses src/vercel.ts. */
const { env, app } = bootstrap()

console.log(`API listening on http://localhost:${env.API_PORT} (docs: /docs)`)

export default {
  port: env.API_PORT,
  fetch: app.fetch,
}
