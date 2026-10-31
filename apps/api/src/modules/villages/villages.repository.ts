import { type Database, businesses, regions, villages } from '@repo/db'
import { and, asc, count, eq, isNull, sql } from 'drizzle-orm'

/** Data access only. No authorization or HTTP concerns here (see docs/architecture/overview.md). */

const publishedVillage = and(eq(villages.status, 'published'), isNull(villages.deletedAt))

const businessCount = sql<number>`(
  select count(*)::int from ${businesses}
  where ${businesses.villageId} = ${villages.id}
    and ${businesses.status} = 'published'
    and ${businesses.verificationStatus} = 'verified'
    and ${businesses.deletedAt} is null
)`

const summaryColumns = {
  id: villages.id,
  slug: villages.slug,
  name: villages.name,
  regionCode: villages.regionCode,
  regionName: regions.name,
  description: villages.description,
  businessCount,
}

export async function listPublishedVillages(
  db: Database,
  opts: { page: number; pageSize: number },
) {
  const [rows, [totalRow]] = await Promise.all([
    db
      .select(summaryColumns)
      .from(villages)
      .leftJoin(regions, eq(regions.code, villages.regionCode))
      .where(publishedVillage)
      .orderBy(asc(villages.name))
      .limit(opts.pageSize)
      .offset((opts.page - 1) * opts.pageSize),
    db.select({ total: count() }).from(villages).where(publishedVillage),
  ])
  return { rows, total: totalRow?.total ?? 0 }
}

export async function findPublishedVillageBySlug(db: Database, slug: string) {
  const [row] = await db
    .select({
      ...summaryColumns,
      address: villages.address,
      contactPhone: villages.contactPhone,
      contactEmail: villages.contactEmail,
      bannerKey: villages.bannerKey,
      logoKey: villages.logoKey,
      theme: villages.theme,
    })
    .from(villages)
    .leftJoin(regions, eq(regions.code, villages.regionCode))
    .where(and(publishedVillage, eq(villages.slug, slug)))
  return row ?? null
}
