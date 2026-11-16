import { sql } from 'drizzle-orm'
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  uuid,
} from 'drizzle-orm/pg-core'
import { seedFlag, softDelete, timestamps } from './_shared'
import { users } from './auth'
import { businesses } from './businesses'
import { locale, recordStatus } from './enums'
import { villages } from './villages'

export const categories = pgTable('categories', {
  id: uuid().primaryKey().defaultRandom(),
  slug: text().notNull().unique(),
  /** Indonesian name; English lives in category_translations. */
  name: text().notNull(),
  icon: text(),
  sortOrder: integer().notNull().default(0),
  ...timestamps,
})

export const categoryTranslations = pgTable(
  'category_translations',
  {
    categoryId: uuid()
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
    locale: locale().notNull(),
    name: text().notNull(),
  },
  (t) => [primaryKey({ columns: [t.categoryId, t.locale] })],
)

export const products = pgTable(
  'products',
  {
    id: uuid().primaryKey().defaultRandom(),
    businessId: uuid()
      .notNull()
      .references(() => businesses.id),
    /** Denormalised tenant key for fast village-scoped queries. */
    villageId: uuid()
      .notNull()
      .references(() => villages.id),
    categoryId: uuid().references(() => categories.id),
    slug: text().notNull().unique(),
    name: text().notNull(),
    description: text(),
    /** Selling price in whole rupiah (no decimals). 0 = free ("Gratis"). */
    price: integer().notNull(),
    /**
     * Normal price shown struck through (discount or free promo). Must be a real earlier price:
     * misleading "harga coret" is a consumer-protection problem. Null = no strikethrough.
     */
    compareAtPrice: integer(),
    /** e.g. "pcs", "pack 250 gr", "kg". */
    unit: text(),
    isAvailable: boolean().notNull().default(true),
    status: recordStatus().notNull().default('draft'),
    createdBy: text().references(() => users.id),
    updatedBy: text().references(() => users.id),
    ...seedFlag,
    ...softDelete,
    ...timestamps,
  },
  (t) => [
    index().on(t.businessId),
    index().on(t.villageId),
    index().on(t.categoryId),
    index().on(t.status),
    check('products_price_non_negative', sql`${t.price} >= 0`),
    check(
      'products_compare_at_price_above_price',
      sql`${t.compareAtPrice} is null or ${t.compareAtPrice} > ${t.price}`,
    ),
  ],
)

/** Optional translations of user content; fall back to the Indonesian row when missing. */
export const productTranslations = pgTable(
  'product_translations',
  {
    productId: uuid()
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    locale: locale().notNull(),
    name: text().notNull(),
    description: text(),
  },
  (t) => [primaryKey({ columns: [t.productId, t.locale] })],
)

export const productImages = pgTable(
  'product_images',
  {
    id: uuid().primaryKey().defaultRandom(),
    productId: uuid()
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    /** Object key in Cloudflare R2. */
    storageKey: text().notNull(),
    alt: text(),
    sortOrder: integer().notNull().default(0),
    ...timestamps,
  },
  (t) => [index().on(t.productId)],
)
