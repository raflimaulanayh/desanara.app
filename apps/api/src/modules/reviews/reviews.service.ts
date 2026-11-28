import type { Database } from '@repo/db'
import type { ProductReviewCreateInput } from '@repo/validators'
import { AppError } from '../../lib/errors'
import * as repo from './reviews.repository'

/**
 * Public buyer reviews (PLAN-product-reviews). Anyone may write one without an account; it stays
 * `pending` until a village admin or assistant approves it (manage-reviews). Only approved reviews are
 * listed or counted. Tenant keys come from the product row, never from input.
 */

const STARS = ['1', '2', '3', '4', '5'] as const

export async function listReviews(
  db: Database,
  slug: string,
  { page, pageSize }: { page: number; pageSize: number },
) {
  const product = await repo.findPublicProduct(db, slug)
  if (!product) throw AppError.notFound('Product')
  const [rows, distributionRows] = await Promise.all([
    repo.listApproved(db, product.id, page, pageSize),
    repo.ratingDistribution(db, product.id),
  ])
  const distribution = Object.fromEntries(STARS.map((star) => [star, 0])) as Record<
    (typeof STARS)[number],
    number
  >
  let total = 0
  let sum = 0
  for (const { rating, total: n } of distributionRows) {
    distribution[String(rating) as (typeof STARS)[number]] = n
    total += n
    sum += rating * n
  }
  return {
    data: rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      repliedAt: r.repliedAt?.toISOString() ?? null,
    })),
    meta: {
      page,
      pageSize,
      total,
      summary: {
        average: total ? Math.round((sum / total) * 10) / 10 : null,
        count: total,
        distribution,
      },
    },
  }
}

/** Limits per hashed client address: a few reviews an hour, one per product a day. */
export const REVIEW_LIMITS = {
  perHour: { limit: 3, windowMs: 60 * 60 * 1000 },
  perProductDay: { limit: 1, windowMs: 24 * 60 * 60 * 1000 },
} as const

export async function createReview(
  db: Database,
  slug: string,
  input: ProductReviewCreateInput,
  allow: (productId: string) => Promise<boolean>,
) {
  const product = await repo.findPublicProduct(db, slug)
  if (!product) throw AppError.notFound('Product')
  // Honeypot filled in: answer like a success so the bot learns nothing, store nothing.
  if (input.website) return { data: { status: 'pending' as const } }
  if (!(await allow(product.id))) throw AppError.rateLimited()
  await repo.insertReview(db, {
    productId: product.id,
    businessId: product.businessId,
    villageId: product.villageId,
    reviewerName: input.reviewerName,
    rating: input.rating,
    body: input.body,
    locale: input.locale,
  })
  return { data: { status: 'pending' as const } }
}
