/**
 * Copies the demo photos (apps/web/public/media/seed/**.webp) to the R2 media bucket under the same
 * keys (`seed/products/…`), so production can read every image from R2 (NEXT_PUBLIC_MEDIA_URL).
 * Skips files already there with the same size. Run from the repo root:
 *   bun --env-file=.env apps/api/scripts/upload-seed-media.ts
 */
import { readdir, stat } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { loadEnv } from '../src/env'
import { createR2Storage } from '../src/lib/storage'

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

const root = join(import.meta.dir, '../../web/public/media')

async function* webpFiles(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) yield* webpFiles(path)
    else if (entry.name.endsWith('.webp')) yield path
  }
}

let uploaded = 0
let skipped = 0
for await (const path of webpFiles(join(root, 'seed'))) {
  const key = relative(root, path).split('\\').join('/')
  const size = (await stat(path)).size
  if ((await storage.head(key))?.size === size) {
    skipped++
    continue
  }
  const url = await storage.presignPut(key, { contentType: 'image/webp', size, expiresIn: 300 })
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/webp' },
    body: Bun.file(path),
  })
  if (!res.ok) throw new Error(`Upload of ${key} failed: ${res.status} ${await res.text()}`)
  uploaded++
}
console.log(`Seed media: ${uploaded} uploaded, ${skipped} already in ${env.R2_BUCKET}.`)
