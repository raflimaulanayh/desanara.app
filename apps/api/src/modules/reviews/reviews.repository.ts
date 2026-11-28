import { type Database, businesses, productReviews, products, villages } from '@repo/db'
import { and, count, desc, eq, isNull, sql } from 'drizzle-orm'
import { publicBusiness, publicProduct, publicVillage } from '../../lib/visibility'

/** Reviews the public may read: approved and not deleted. */
export const publicReview = and(
  eq(productReviews.status, 'approved'),
  isNull(productReviews.deletedAt),
)

/** A product that is public right now, with its tenant keys taken from the database. */
export async function findPublicProduct(db: Database, slug: string) {
  const [row] = await db
    .select({ id: products.id, businessId: products.businessId, villageId: products.villageId })
    .from(products)
    .innerJoin(businesses, eq(businesses.id, products.businessId))
    .innerJoin(villages, eq(villages.id, products.villageId))
    .where(and(eq(products.slug, slug), publicProduct, publicBusiness, publicVillage))
  return row ?? null
}

export async function listApproved(db: Database, productId: string, page: number, size: number) {
  return db
    .select({
      id: productReviews.id,
      reviewerName: productReviews.reviewerName,
      rating: productReviews.rating,
      body: productReviews.body,
      locale: productReviews.locale,
      reply: productReviews.reply,
      repliedAt: productReviews.repliedAt,
      createdAt: productReviews.createdAt,
    })
    .from(productReviews)
    .where(and(eq(productReviews.productId, productId), publicReview))
    .orderBy(desc(productReviews.createdAt), desc(productReviews.id))
    .limit(size)
    .offset((page - 1) * size)
}

export async function ratingDistribution(db: Database, productId: string) {
  return db
    .select({ rating: productReviews.rating, total: count() })
    .from(productReviews)
    .where(and(eq(productReviews.productId, productId), publicReview))
    .groupBy(productReviews.rating)
}

export async function insertReview(
  db: Database,
  values: typeof productReviews.$inferInsert,
): Promise<void> {
  await db.insert(productReviews).values(values)
}

/** Correlated subqueries for catalog rows (average to one decimal, count), approved reviews only. */
export const ratingAverageSql = sql<string | null>`(
  select round(avg(${productReviews.rating})::numeric, 1) from ${productReviews}
  where ${productReviews.productId} = ${products.id}
    and ${productReviews.status} = 'approved' and ${productReviews.deletedAt} is null
)`
export const ratingCountSql = sql<number>`(
  select count(*)::int from ${productReviews}
  where ${productReviews.productId} = ${products.id}
    and ${productReviews.status} = 'approved' and ${productReviews.deletedAt} is null
)`
