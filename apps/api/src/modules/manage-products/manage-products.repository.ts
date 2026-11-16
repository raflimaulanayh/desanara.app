import {
  businesses,
  categories,
  productImages,
  products,
  productTranslations,
  villages,
} from '@repo/db'
import { and, asc, count, desc, eq, ilike, inArray, isNull, like, or, sql } from 'drizzle-orm'
import type { DbOrTx } from '../../lib/audit'

/**
 * Data access for the dashboard view of products. No authorization here: the service checks
 * `can()` with the ids from these rows. Every query excludes soft-deleted products, businesses and
 * villages.
 */

const enName = sql<string | null>`(
  select ${productTranslations.name} from ${productTranslations}
  where ${productTranslations.productId} = ${products.id} and ${productTranslations.locale} = 'en'
)`
const enDescription = sql<string | null>`(
  select ${productTranslations.description} from ${productTranslations}
  where ${productTranslations.productId} = ${products.id} and ${productTranslations.locale} = 'en'
)`

export const manageColumns = {
  id: products.id,
  villageId: products.villageId,
  businessId: businesses.id,
  businessSlug: businesses.slug,
  businessName: businesses.name,
  categoryId: categories.id,
  categorySlug: categories.slug,
  categoryName: categories.name,
  slug: products.slug,
  name: products.name,
  description: products.description,
  price: products.price,
  compareAtPrice: products.compareAtPrice,
  isAvailable: products.isAvailable,
  status: products.status,
  nameEn: enName,
  descriptionEn: enDescription,
  isSeed: products.isSeed,
  createdAt: products.createdAt,
  updatedAt: products.updatedAt,
}

export type ManageProductRow = NonNullable<Awaited<ReturnType<typeof findById>>>

const live = and(
  isNull(products.deletedAt),
  isNull(businesses.deletedAt),
  isNull(villages.deletedAt),
)

const escapeLike = (v: string) => v.replace(/[\\%_]/g, (m) => `\\${m}`)

function base(db: DbOrTx) {
  return db
    .select(manageColumns)
    .from(products)
    .innerJoin(businesses, eq(businesses.id, products.businessId))
    .innerJoin(villages, eq(villages.id, products.villageId))
    .leftJoin(categories, eq(categories.id, products.categoryId))
}

export async function findById(db: DbOrTx, id: string) {
  const [row] = await base(db).where(and(eq(products.id, id), live))
  return row ?? null
}

export interface ListFilters {
  page: number
  pageSize: number
  status?: 'draft' | 'published' | 'archived'
  q?: string
}

export async function listForBusiness(db: DbOrTx, businessId: string, f: ListFilters) {
  const where = and(
    eq(products.businessId, businessId),
    live,
    f.status ? eq(products.status, f.status) : undefined,
    f.q ? ilike(products.name, `%${escapeLike(f.q)}%`) : undefined,
  )
  const [rows, [totalRow]] = await Promise.all([
    base(db)
      .where(where)
      .orderBy(desc(products.updatedAt), asc(products.name))
      .limit(f.pageSize)
      .offset((f.page - 1) * f.pageSize),
    db
      .select({ total: count() })
      .from(products)
      .innerJoin(businesses, eq(businesses.id, products.businessId))
      .innerJoin(villages, eq(villages.id, products.villageId))
      .where(where),
  ])
  return { rows, total: totalRow?.total ?? 0 }
}

/** Images of several products, in display order. */
export async function imagesFor(db: DbOrTx, productIds: string[]) {
  if (productIds.length === 0) return []
  return db
    .select({
      id: productImages.id,
      productId: productImages.productId,
      key: productImages.storageKey,
      alt: productImages.alt,
      sortOrder: productImages.sortOrder,
    })
    .from(productImages)
    .where(inArray(productImages.productId, productIds))
    .orderBy(asc(productImages.sortOrder), asc(productImages.createdAt))
}

export async function findLiveBusiness(db: DbOrTx, id: string) {
  const [row] = await db
    .select({
      id: businesses.id,
      villageId: businesses.villageId,
      name: businesses.name,
    })
    .from(businesses)
    .innerJoin(villages, eq(villages.id, businesses.villageId))
    .where(and(eq(businesses.id, id), isNull(businesses.deletedAt), isNull(villages.deletedAt)))
  return row ?? null
}

export async function categoryExists(db: DbOrTx, id: string) {
  const [row] = await db.select({ id: categories.id }).from(categories).where(eq(categories.id, id))
  return Boolean(row)
}

/** Slugs already used by `base` or `base-N` (soft-deleted rows included: the column is unique). */
export async function slugsLike(db: DbOrTx, base: string) {
  const rows = await db
    .select({ slug: products.slug })
    .from(products)
    .where(or(eq(products.slug, base), like(products.slug, `${escapeLike(base)}-%`)))
  return rows.map((r) => r.slug)
}

export async function insertProduct(db: DbOrTx, values: typeof products.$inferInsert) {
  const [row] = await db.insert(products).values(values).returning({ id: products.id })
  return row!.id
}

export async function updateProduct(
  db: DbOrTx,
  id: string,
  values: Partial<typeof products.$inferInsert>,
) {
  await db.update(products).set(values).where(eq(products.id, id))
}

export async function upsertEnglish(
  db: DbOrTx,
  productId: string,
  en: { name: string; description: string | null },
) {
  await db
    .insert(productTranslations)
    .values({ productId, locale: 'en', ...en })
    .onConflictDoUpdate({
      target: [productTranslations.productId, productTranslations.locale],
      set: en,
    })
}

export async function deleteEnglish(db: DbOrTx, productId: string) {
  await db
    .delete(productTranslations)
    .where(and(eq(productTranslations.productId, productId), eq(productTranslations.locale, 'en')))
}

/** Rewrites the display order (0 = cover). */
export async function setImageOrder(db: DbOrTx, productId: string, order: string[]) {
  for (const [i, id] of order.entries()) {
    await db
      .update(productImages)
      .set({ sortOrder: i })
      .where(and(eq(productImages.id, id), eq(productImages.productId, productId)))
  }
}
