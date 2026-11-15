import { getRequestListener } from '@hono/node-server'
import { bootstrap } from './bootstrap'

/**
 * Vercel Function entry (Node.js runtime, ADR 0009). scripts/build-vercel.ts bundles this file
 * with every workspace package into .vercel/output/functions/index.func/index.mjs.
 * The app is created once per instance and reused across requests.
 */
const { app } = bootstrap()

export default getRequestListener(app.fetch)
