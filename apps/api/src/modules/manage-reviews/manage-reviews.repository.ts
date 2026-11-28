import { type Database, businesses, productReviews, products } from '@repo/db'
import { and, count, desc, eq, inArray, isNull, type SQL } from 'drizzle-orm'

const columns = {
  id: productReviews.id,
  villageId: productReviews.villageId,
  businessId: productReviews.businessId,
  businessName: businesses.name,
  productId: productReviews.productId,
  productSlug: products.slug,
  productName: products.name,
  reviewerName: productReviews.reviewerName,
  rating: productReviews.rating,
  body: productReviews.body,
  locale: productReviews.locale,
  status: productReviews.status,
  rejectionReason: productReviews.rejectionReason,
  moderatedAt: productReviews.moderatedAt,
  reply: productReviews.reply,
  repliedAt: productReviews.repliedAt,
  createdAt: productReviews.createdAt,
}

export interface ReviewScope {
  villageIds?: string[]
  businessIds?: string[]
}

function scopeWhere(scope: ReviewScope): SQL[] {
  const where: SQL[] = [isNull(productReviews.deletedAt), isNull(products.deletedAt)]
  if (scope.villageIds) where.push(inArray(productReviews.villageId, scope.villageIds))
  if (scope.businessIds) where.push(inArray(productReviews.businessId, scope.businessIds))
  return where
}

function base(db: Database) {
  return db
    .select(columns)
    .from(productReviews)
    .innerJoin(products, eq(products.id, productReviews.productId))
    .innerJoin(businesses, eq(businesses.id, productReviews.businessId))
}

export async function list(
  db: Database,
  scope: ReviewScope,
  status: 'pending' | 'approved' | 'rejected' | undefined,
  page: number,
  pageSize: number,
) {
  const where = scopeWhere(scope)
  if (status) where.push(eq(productReviews.status, status))
  return base(db)
    .where(and(...where))
    .orderBy(desc(productReviews.createdAt), desc(productReviews.id))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
}

/** Reviews per status inside the scope (tabs and the pending badge). */
export async function countByStatus(db: Database, scope: ReviewScope) {
  return db
    .select({ status: productReviews.status, total: count() })
    .from(productReviews)
    .innerJoin(products, eq(products.id, productReviews.productId))
    .where(and(...scopeWhere(scope)))
    .groupBy(productReviews.status)
}

export async function findById(db: Database, id: string) {
  const [row] = await base(db).where(
    and(eq(productReviews.id, id), isNull(productReviews.deletedAt), isNull(products.deletedAt)),
  )
  return row
}

export async function update(
  db: Parameters<Parameters<Database['transaction']>[0]>[0],
  id: string,
  values: Partial<typeof productReviews.$inferInsert>,
) {
  await db.update(productReviews).set(values).where(eq(productReviews.id, id))
}

export async function findBusiness(db: Database, id: string) {
  const [row] = await db
    .select({ id: businesses.id, villageId: businesses.villageId })
    .from(businesses)
    .where(and(eq(businesses.id, id), isNull(businesses.deletedAt)))
  return row
}
