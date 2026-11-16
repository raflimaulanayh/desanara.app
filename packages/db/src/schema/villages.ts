import { sql } from 'drizzle-orm'
import {
  doublePrecision,
  index,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { seedFlag, softDelete, timestamps } from './_shared'
import { users } from './auth'
import { recordStatus, villageRole } from './enums'
import { regions } from './regions'

/** A village is the tenant. Every tenant-owned row carries `villageId`. */
export const villages = pgTable(
  'villages',
  {
    id: uuid().primaryKey().defaultRandom(),
    slug: text().notNull().unique(),
    name: text().notNull(),
    /**
     * Most specific known region, ideally the village-level Kemendagri code. One live tenant per code
     * (unique index below), so the same desa cannot be registered twice.
     */
    regionCode: text().references(() => regions.code),
    /**
     * Village centre on maps (WGS84). Starts from the region's centre point; the village admin can
     * move it. Null = fall back to the region's point.
     */
    centerLat: doublePrecision(),
    centerLng: doublePrecision(),
    description: text(),
    bannerKey: text(),
    logoKey: text(),
    contactPhone: text(),
    contactEmail: text(),
    address: text(),
    /** IANA zone used to compute business open/closed status (WIB/WITA/WIT). */
    timezone: text().notNull().default('Asia/Jakarta'),
    /**
     * Published branding (ADR 0007). Shape = VillageTheme from @repo/validators; always read with
     * parseVillageTheme() so invalid/old values fall back to the default. Null = default theme.
     */
    theme: jsonb().$type<Record<string, unknown>>(),
    /** Draft edited in the dashboard with live preview; copied to `theme` on "Terapkan". */
    themeDraft: jsonb().$type<Record<string, unknown>>(),
    themePublishedAt: timestamp({ withTimezone: true }),
    status: recordStatus().notNull().default('draft'),
    ...seedFlag,
    ...softDelete,
    ...timestamps,
  },
  (t) => [
    index().on(t.regionCode),
    index().on(t.status),
    uniqueIndex('villages_region_code_live_idx')
      .on(t.regionCode)
      .where(sql`${t.deletedAt} is null`),
  ],
)

export const villageMembers = pgTable(
  'village_members',
  {
    villageId: uuid()
      .notNull()
      .references(() => villages.id, { onDelete: 'cascade' }),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: villageRole().notNull(),
    ...timestamps,
  },
  (t) => [primaryKey({ columns: [t.villageId, t.userId] }), index().on(t.userId)],
)
