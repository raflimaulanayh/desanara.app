import { businesses, products, villages } from '@repo/db'
import { and, eq, isNull } from 'drizzle-orm'

/**
 * What the public may see. Every public query composes these so a draft, unverified,
 * taken-down, soft-deleted or unpublished-village row can never leak (docs/architecture/multi-tenancy.md).
 */
export const publicVillage = and(eq(villages.status, 'published'), isNull(villages.deletedAt))

export const publicBusiness = and(
  eq(businesses.status, 'published'),
  eq(businesses.verificationStatus, 'verified'),
  isNull(businesses.takenDownAt),
  isNull(businesses.deletedAt),
)

export const publicProduct = and(eq(products.status, 'published'), isNull(products.deletedAt))
