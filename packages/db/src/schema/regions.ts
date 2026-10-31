import { type AnyPgColumn, index, pgTable, text } from 'drizzle-orm/pg-core'
import { regionLevel } from './enums'

/**
 * Indonesian administrative regions using the official Kemendagri codes:
 * province "32", regency "32.04", district "32.04.10", village "32.04.10.2001".
 */
export const regions = pgTable(
  'regions',
  {
    code: text().primaryKey(),
    name: text().notNull(),
    level: regionLevel().notNull(),
    parentCode: text().references((): AnyPgColumn => regions.code),
  },
  (t) => [index().on(t.parentCode), index().on(t.level)],
)
