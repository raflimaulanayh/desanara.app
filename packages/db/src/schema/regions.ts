import { sql } from 'drizzle-orm'
import {
  type AnyPgColumn,
  doublePrecision,
  index,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { regionLevel } from './enums'

/**
 * Indonesian administrative regions using the official Kemendagri codes:
 * province "32", regency "32.04", district "32.04.16", village "32.04.16.2005".
 *
 * Reference data, filled by `bun run db:regions:import` from packages/db/data/regions (91,599 rows,
 * Kepmendagri 2025). The code is the key and encodes the hierarchy, so "everything in Kabupaten
 * Bandung" is `code LIKE '32.04.%'` (index with text_pattern_ops). Rows are never deleted: a code
 * the government retires gets `retiredAt`, so villages and businesses pointing at it stay valid.
 */
export const regions = pgTable(
  'regions',
  {
    code: text().primaryKey(),
    name: text().notNull(),
    level: regionLevel().notNull(),
    parentCode: text().references((): AnyPgColumn => regions.code),
    /** "Baros, Kec. Arjasari, Kabupaten Bandung, Jawa Barat": shown and searched by the region picker. */
    fullName: text().notNull().default(''),
    /** Centre point (WGS84) from the open boundaries dataset; the default map centre for a village. */
    lat: doublePrecision(),
    lng: doublePrecision(),
    /** Dataset version that last wrote this row (REGION_DATASET_VERSION). */
    sourceVersion: text(),
    /** Set when a newer dataset no longer has this code (split or merged regions). */
    retiredAt: timestamp({ withTimezone: true }),
  },
  (t) => [
    index().on(t.parentCode),
    index().on(t.level),
    index('regions_code_prefix_idx').on(sql`${t.code} text_pattern_ops`),
    index('regions_full_name_trgm_idx').using('gin', sql`lower(${t.fullName}) gin_trgm_ops`),
  ],
)
