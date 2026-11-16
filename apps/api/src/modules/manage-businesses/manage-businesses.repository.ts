import { businessMembers, businesses, products, regions, villages } from '@repo/db'
import { type SQL, and, count, desc, eq, ilike, inArray, isNull, like, or, sql } from 'drizzle-orm'
import type { DbOrTx } from '../../lib/audit'

/**
 * Data access for the dashboard view of businesses. No authorization here: the service decides
 * who may see what and passes the allowed scope in. Every query excludes soft-deleted rows.
 */

const liveProductCount = sql<number>`(
  select count(*)::int from ${products}
  where ${products.businessId} = ${businesses.id} and ${products.deletedAt} is null
)`

export const manageColumns = {
  id: businesses.id,
  villageId: businesses.villageId,
  villageSlug: villages.slug,
  villageName: villages.name,
  /** Village map centre: what the village admin chose, else its region's point (left join). */
  villageCenterLat: sql<number | null>`coalesce(${villages.centerLat}, ${regions.lat})`,
  villageCenterLng: sql<number | null>`coalesce(${villages.centerLng}, ${regions.lng})`,
  slug: businesses.slug,
  name: businesses.name,
  ownerName: businesses.ownerName,
  description: businesses.description,
  whatsappNumber: businesses.whatsappNumber,
  address: businesses.address,
  rt: businesses.rt,
  rw: businesses.rw,
  lat: businesses.lat,
  lng: businesses.lng,
  logoKey: businesses.logoKey,
  shopeeUrl: businesses.shopeeUrl,
  tokopediaUrl: businesses.tokopediaUrl,
  tiktokShopUrl: businesses.tiktokShopUrl,
  instagramUrl: businesses.instagramUrl,
  nib: businesses.nib,
  openingHours: businesses.openingHours,
  closedUntil: businesses.closedUntil,
  closedNote: businesses.closedNote,
  verificationStatus: businesses.verificationStatus,
  verifiedAt: businesses.verifiedAt,
  verificationNote: businesses.verificationNote,
  consentAt: businesses.consentAt,
  consentMethod: businesses.consentMethod,
  takenDownAt: businesses.takenDownAt,
  takedownReason: businesses.takedownReason,
  status: businesses.status,
  productCount: liveProductCount,
  isSeed: businesses.isSeed,
  createdAt: businesses.createdAt,
  updatedAt: businesses.updatedAt,
}

export type ManageBusinessRow = NonNullable<Awaited<ReturnType<typeof findById>>>

/** Which businesses the caller may list: everything, whole villages, and/or single businesses. */
export interface ListScope {
  all: boolean
  villageIds: string[]
  businessIds: string[]
}

export interface ListFilters {
  page: number
  pageSize: number
  villageId?: string
  verificationStatus?: 'pending' | 'verified' | 'rejected'
  status?: 'draft' | 'published' | 'archived'
  q?: string
}

const escapeLike = (v: string) => v.replace(/[\\%_]/g, (m) => `\\${m}`)

export async function listForScope(db: DbOrTx, scope: ListScope, f: ListFilters) {
  let scoped: SQL | undefined
  if (!scope.all) {
    const parts = [
      scope.villageIds.length ? inArray(businesses.villageId, scope.villageIds) : undefined,
      scope.businessIds.length ? inArray(businesses.id, scope.businessIds) : undefined,
    ].filter(Boolean) as SQL[]
    if (parts.length === 0) return { rows: [], total: 0 }
    scoped = or(...parts)
  }

  const where = and(
    isNull(businesses.deletedAt),
    isNull(villages.deletedAt),
    scoped,
    f.villageId ? eq(businesses.villageId, f.villageId) : undefined,
    f.verificationStatus ? eq(businesses.verificationStatus, f.verificationStatus) : undefined,
    f.status ? eq(businesses.status, f.status) : undefined,
    f.q ? ilike(businesses.name, `%${escapeLike(f.q)}%`) : undefined,
  )

  const [rows, [totalRow]] = await Promise.all([
    db
      .select(manageColumns)
      .from(businesses)
      .innerJoin(villages, eq(villages.id, businesses.villageId))
      .leftJoin(regions, eq(regions.code, villages.regionCode))
      .where(where)
      .orderBy(desc(businesses.updatedAt))
      .limit(f.pageSize)
      .offset((f.page - 1) * f.pageSize),
    db
      .select({ total: count() })
      .from(businesses)
      .innerJoin(villages, eq(villages.id, businesses.villageId))
      .where(where),
  ])
  return { rows, total: totalRow?.total ?? 0 }
}

export async function findById(db: DbOrTx, id: string) {
  const [row] = await db
    .select(manageColumns)
    .from(businesses)
    .innerJoin(villages, eq(villages.id, businesses.villageId))
    .leftJoin(regions, eq(regions.code, villages.regionCode))
    .where(and(eq(businesses.id, id), isNull(businesses.deletedAt), isNull(villages.deletedAt)))
  return row ?? null
}

export async function findLiveVillage(db: DbOrTx, id: string) {
  const [row] = await db
    .select({ id: villages.id })
    .from(villages)
    .where(and(eq(villages.id, id), isNull(villages.deletedAt)))
  return row ?? null
}

/** Slugs already used by `base` or `base-N` (soft-deleted rows included: the column is unique). */
export async function slugsLike(db: DbOrTx, base: string) {
  const rows = await db
    .select({ slug: businesses.slug })
    .from(businesses)
    .where(or(eq(businesses.slug, base), like(businesses.slug, `${escapeLike(base)}-%`)))
  return rows.map((r) => r.slug)
}

export async function slugExists(db: DbOrTx, slug: string) {
  const [row] = await db
    .select({ id: businesses.id })
    .from(businesses)
    .where(eq(businesses.slug, slug))
  return row ?? null
}

export async function insertBusiness(db: DbOrTx, values: typeof businesses.$inferInsert) {
  const [row] = await db.insert(businesses).values(values).returning({ id: businesses.id })
  return row!.id
}

export async function updateBusiness(
  db: DbOrTx,
  id: string,
  values: Partial<typeof businesses.$inferInsert>,
) {
  await db.update(businesses).set(values).where(eq(businesses.id, id))
}

export async function addMember(
  db: DbOrTx,
  businessId: string,
  userId: string,
  role: 'owner' | 'assistant',
) {
  await db.insert(businessMembers).values({ businessId, userId, role }).onConflictDoNothing()
}
