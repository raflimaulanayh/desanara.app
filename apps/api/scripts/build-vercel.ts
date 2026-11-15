/**
 * Builds the API for Vercel with the Build Output API v3 (ADR 0009).
 *
 * Bun bundles src/vercel.ts together with every workspace package (@repo/db, @repo/auth, …) into
 * one ESM file, so Vercel never has to compile TypeScript from the monorepo. Output:
 *   .vercel/output/config.json                       routes everything to the function + daily cron
 *   .vercel/output/functions/index.func/index.mjs    the bundled app (Node.js runtime)
 *
 * Run from apps/api: `bun run build:vercel` (Vercel's build command for this project).
 */
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const out = join(import.meta.dir, '..', '.vercel', 'output')
const func = join(out, 'functions', 'index.func')

await rm(out, { recursive: true, force: true })
await mkdir(func, { recursive: true })

const result = await Bun.build({
  entrypoints: [join(import.meta.dir, '..', 'src', 'vercel.ts')],
  target: 'node',
  format: 'esm',
  minify: { syntax: true, whitespace: true },
  sourcemap: 'linked',
  naming: 'index.mjs',
  outdir: func,
})
if (!result.success) {
  for (const log of result.logs) console.error(log)
  process.exit(1)
}

await writeFile(
  join(func, '.vc-config.json'),
  JSON.stringify(
    {
      runtime: 'nodejs22.x',
      handler: 'index.mjs',
      launcherType: 'Nodejs',
      shouldAddHelpers: false,
      shouldAddSourcemapSupport: true,
      maxDuration: 15,
    },
    null,
    2,
  ),
)

await writeFile(
  join(out, 'config.json'),
  JSON.stringify(
    {
      version: 3,
      routes: [{ src: '/(.*)', dest: '/index' }],
      // Daily DB ping keeps a Supabase Free project from pausing after 7 idle days.
      crons: [{ path: '/health/ready', schedule: '0 3 * * *' }],
    },
    null,
    2,
  ),
)

const size = result.outputs.reduce((n, o) => n + o.size, 0)
console.log(`Vercel output written to ${out} (${(size / 1024).toFixed(0)} KB)`)
