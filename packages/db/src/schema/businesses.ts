import {
  doublePrecision,
  index,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { seedFlag, softDelete, timestamps } from './_shared'
import { users } from './auth'
import { businessRole, consentMethod, recordStatus, verificationStatus } from './enums'
import { villages } from './villages'

/** A UMKM (micro/small business) that belongs to exactly one village. */
export const businesses = pgTable(
  'businesses',
  {
    id: uuid().primaryKey().defaultRandom(),
    villageId: uuid()
      .notNull()
      .references(() => villages.id),
    slug: text().notNull().unique(),
    name: text().notNull(),
    ownerName: text(),
    description: text(),
    /** International format without "+", e.g. 6281234567890 (used for wa.me links). */
    whatsappNumber: text(),
    /**
     * Internal location: street or landmark, RT/RW (three digits, "001") and map pin (WGS84). Never
     * returned by public endpoints; a public location stops at the village (data-model.md).
     */
    address: text(),
    rt: text(),
    rw: text(),
    lat: doublePrecision(),
    lng: doublePrecision(),
    logoKey: text(),
    shopeeUrl: text(),
    tokopediaUrl: text(),
    tiktokShopUrl: text(),
    instagramUrl: text(),
    /** Nomor Induk Berusaha (optional business licence number). */
    nib: text(),
    /** Weekly schedule, shape = OpeningHours in @repo/validators. Null = status not shown. */
    openingHours: jsonb().$type<Record<string, unknown>>(),
    /** "Tutup sementara" override; status is computed, never toggled by hand. */
    closedUntil: timestamp({ withTimezone: true }),
    closedNote: text(),
    verificationStatus: verificationStatus().notNull().default('pending'),
    verifiedAt: timestamp({ withTimezone: true }),
    verifiedBy: text().references(() => users.id),
    /** Reason given by the village admin on the last decision (shown to the assistant on rejection). */
    verificationNote: text(),
    /** When the owner consented to publishing their data (UU PDP). Required before publish. */
    consentAt: timestamp({ withTimezone: true }),
    /** Who recorded the consent (staff for a paper form, the owner for in-app). */
    consentRecordedBy: text().references(() => users.id),
    consentMethod: consentMethod(),
    /** Set by a village admin; while set the business is hidden and cannot be republished. */
    takenDownAt: timestamp({ withTimezone: true }),
    takenDownBy: text().references(() => users.id),
    takedownReason: text(),
    status: recordStatus().notNull().default('draft'),
    createdBy: text().references(() => users.id),
    updatedBy: text().references(() => users.id),
    ...seedFlag,
    ...softDelete,
    ...timestamps,
  },
  (t) => [index().on(t.villageId), index().on(t.status), index().on(t.verificationStatus)],
)

/** owner = the UMKM owner; assistant = pendamping who manages it on the owner's behalf. */
export const businessMembers = pgTable(
  'business_members',
  {
    businessId: uuid()
      .notNull()
      .references(() => businesses.id, { onDelete: 'cascade' }),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: businessRole().notNull(),
    ...timestamps,
  },
  (t) => [primaryKey({ columns: [t.businessId, t.userId] }), index().on(t.userId)],
)
