import { boolean, timestamp } from 'drizzle-orm/pg-core'

/** createdAt/updatedAt columns shared by every domain table. */
export const timestamps = {
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}

/** Soft delete marker. Queries for live data must filter `deletedAt IS NULL`. */
export const softDelete = {
  deletedAt: timestamp({ withTimezone: true }),
}

/** Rows created by the demo seed script; `db:seed:reset` deletes only these. */
export const seedFlag = {
  isSeed: boolean().notNull().default(false),
}
