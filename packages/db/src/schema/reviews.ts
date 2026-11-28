import { sql } from 'drizzle-orm'
import { check, index, pgTable, smallint, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { seedFlag, softDelete, timestamps } from './_shared'
import { users } from './auth'
import { businesses } from './businesses'
import { products } from './catalog'
import { locale, reviewRejectionReason, reviewStatus } from './enums'
import { villages } from './villages'

/**
 * Buyer reviews of a product (PLAN-product-reviews). Orders happen on WhatsApp, so a review is not a
 * verified purchase: village admins and assistants moderate, the business may reply once. No contact
 * details or IP addresses are stored; rate limits use hashed keys in `rate_limits`.
 */
export const productReviews = pgTable(
  'product_reviews',
  {
    id: uuid().primaryKey().defaultRandom(),
    productId: uuid()
      .notNull()
      .references(() => products.id),
    /** Denormalised tenant keys for moderation queues. */
    businessId: uuid()
      .notNull()
      .references(() => businesses.id),
    villageId: uuid()
      .notNull()
      .references(() => villages.id),
    reviewerName: text().notNull(),
    rating: smallint().notNull(),
    body: text().notNull(),
    locale: locale().notNull().default('id'),
    status: reviewStatus().notNull().default('pending'),
    rejectionReason: reviewRejectionReason(),
    moderatedBy: text().references(() => users.id),
    moderatedAt: timestamp({ withTimezone: true }),
    reply: text(),
    repliedBy: text().references(() => users.id),
    repliedAt: timestamp({ withTimezone: true }),
    ...seedFlag,
    ...softDelete,
    ...timestamps,
  },
  (t) => [
    index().on(t.productId, t.status, t.createdAt),
    index().on(t.villageId, t.status),
    index().on(t.businessId, t.status),
    check('product_reviews_rating_range', sql`${t.rating} between 1 and 5`),
  ],
)
