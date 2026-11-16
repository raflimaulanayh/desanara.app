/**
 * Deletes "orphan" files: uploaded to R2 (under villages/) but never attached to a product, business
 * or village, e.g. the tab was closed between upload and save. Only files older than 24 hours are
 * touched, so an upload in progress is never removed. Seed files (seed/…) are never touched.
 * Dry run by default; pass --apply to delete. Run from the repo root:
 *   bun --env-file=.env apps/api/scripts/clean-orphan-media.ts [--apply]
 */
import { createDb } from '@repo/db'
import { loadEnv } from '../src/env'
import { createR2Storage } from '../src/lib/storage'
import { referencedKeys } from '../src/modules/media/media.repository'
import { MANAGED_PREFIX } from '../src/modules/media/media.targets'

const apply = process.argv.includes('--apply')
const env = loadEnv()
if (!env.R2_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) {
  throw new Error('R2_ACCOUNT_ID, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY are required')
}
const storage = createR2Storage({
  accountId: env.R2_ACCOUNT_ID,
  bucket: env.R2_BUCKET,
  accessKeyId: env.R2_ACCESS_KEY_ID,
  secretAccessKey: env.R2_SECRET_ACCESS_KEY,
})
const db = createDb(env.DATABASE_URL, { max: 1 })

const cutoff = Date.now() - 24 * 60 * 60 * 1000
const used = await referencedKeys(db, MANAGED_PREFIX)
let orphans = 0
let bytes = 0
for await (const o of storage.list(MANAGED_PREFIX)) {
  if (used.has(o.key) || o.lastModified.getTime() > cutoff) continue
  orphans++
  bytes += o.size
  console.log(`${apply ? 'delete' : 'would delete'} ${o.key}`)
  if (apply) await storage.delete(o.key)
}
console.log(
  `${orphans} orphan file(s), ${(bytes / 1024 / 1024).toFixed(1)} MB${apply ? ' deleted' : ' (dry run; pass --apply to delete)'}.`,
)
process.exit(0)
