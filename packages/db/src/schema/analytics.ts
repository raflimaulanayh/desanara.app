import { index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { seedFlag } from './_shared'
import { businesses } from './businesses'
import { products } from './catalog'
import { analyticsEventType } from './enums'
import { villages } from './villages'

/** Lightweight impact tracking: views and WhatsApp/marketplace clicks. No personal data. */
export const analyticsEvents = pgTable(
  'analytics_events',
  {
    id: uuid().primaryKey().defaultRandom(),
    type: analyticsEventType().notNull(),
    villageId: uuid().references(() => villages.id, { onDelete: 'cascade' }),
    businessId: uuid().references(() => businesses.id, { onDelete: 'cascade' }),
    productId: uuid().references(() => products.id, { onDelete: 'cascade' }),
    locale: text(),
    referrer: text(),
    meta: jsonb(),
    ...seedFlag,
    occurredAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index().on(t.villageId, t.occurredAt),
    index().on(t.businessId, t.occurredAt),
    index().on(t.type),
  ],
)
