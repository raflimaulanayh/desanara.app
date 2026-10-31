import { index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { users } from './auth'
import { villages } from './villages'

/** Who changed what. Written by the API service layer on every mutation. */
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid().primaryKey().defaultRandom(),
    actorId: text().references(() => users.id, { onDelete: 'set null' }),
    villageId: uuid().references(() => villages.id, { onDelete: 'set null' }),
    /** e.g. "product.update", "business.verify". */
    action: text().notNull(),
    entityType: text().notNull(),
    entityId: text().notNull(),
    changes: jsonb(),
    requestId: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.villageId, t.createdAt), index().on(t.entityType, t.entityId)],
)
