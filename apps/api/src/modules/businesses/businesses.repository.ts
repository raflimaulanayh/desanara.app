import { type Database, businesses, products, regions, villages } from '@repo/db'
import { and, asc, eq, sql } from 'drizzle-orm'
import { publicBusiness, publicProduct, publicVillage } from '../../lib/visibility'

const productCount = sql<number>`(
  select count(*)::int from ${products}
  where ${products.businessId} = ${businesses.id} and ${publicProduct}
)`

export const businessColumns = {
  id: businesses.id,
  slug: businesses.slug,
  name: businesses.name,
  ownerName: businesses.ownerName,
  description: businesses.description,
  address: businesses.address,
  logoKey: businesses.logoKey,
  whatsappNumber: businesses.whatsappNumber,
  shopeeUrl: businesses.shopeeUrl,
  tokopediaUrl: businesses.tokopediaUrl,
  tiktokShopUrl: businesses.tiktokShopUrl,
  instagramUrl: businesses.instagramUrl,
  openingHours: businesses.openingHours,
  closedUntil: businesses.closedUntil,
  closedNote: businesses.closedNote,
  verifiedAt: businesses.verifiedAt,
  productCount,
  isSeed: businesses.isSeed,
}

export async function listPublicBusinessesOfVillage(db: Database, villageSlug: string) {
  return db
    .select(businessColumns)
    .from(businesses)
    .innerJoin(villages, eq(villages.id, businesses.villageId))
    .where(and(publicBusiness, publicVillage, eq(villages.slug, villageSlug)))
    .orderBy(asc(businesses.name))
}

export async function findPublicBusinessBySlug(db: Database, slug: string) {
  const [row] = await db
    .select({
      ...businessColumns,
      villageSlug: villages.slug,
      villageName: villages.name,
      villageTimezone: villages.timezone,
      villageLogoKey: villages.logoKey,
      villageTheme: villages.theme,
      villageIsSeed: villages.isSeed,
      regionName: regions.name,
    })
    .from(businesses)
    .innerJoin(villages, eq(villages.id, businesses.villageId))
    .leftJoin(regions, eq(regions.code, villages.regionCode))
    .where(and(publicBusiness, publicVillage, eq(businesses.slug, slug)))
  return row ?? null
}
