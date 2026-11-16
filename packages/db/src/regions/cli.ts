/**
 * bun run db:regions:import [--force]
 * Loads packages/db/data/regions into the database in DATABASE_URL (see import.ts).
 */
import { createDb } from '../index'
import { REGION_DATASET_VERSION } from './dataset'
import { importRegions } from './import'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}
const db = createDb(url, { max: 1 })
const started = Date.now()
const result = await importRegions(db, { force: process.argv.includes('--force') })
console.log(
  result.skipped
    ? `Regions already at ${REGION_DATASET_VERSION}; nothing to do (use --force to rewrite).`
    : `Imported ${result.upserted} regions (${REGION_DATASET_VERSION}), retired ${result.retired}, in ${((Date.now() - started) / 1000).toFixed(1)}s.`,
)
process.exit(0)
