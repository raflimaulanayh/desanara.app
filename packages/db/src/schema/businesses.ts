import { index, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { seedFlag, softDelete, timestamps } from './_shared'
import { users } from './auth'
import { businessRole, recordStatus, verificationStatus } from './enums'
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
    address: text(),
    logoKey: text(),
    shopeeUrl: text(),
    tokopediaUrl: text(),
    tiktokShopUrl: text(),
    instagramUrl: text(),
    /** Nomor Induk Berusaha (optional business licence number). */
    nib: text(),
    verificationStatus: verificationStatus().notNull().default('pending'),
    verifiedAt: timestamp({ withTimezone: true }),
    verifiedBy: text().references(() => users.id),
    /** When the owner consented to publishing their data (UU PDP). Required before publish. */
    consentAt: timestamp({ withTimezone: true }),
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
