import {
  type Database,
  businesses,
  categories,
  categoryTranslations,
  productImages,
  products,
  productTranslations,
  villages,
} from '@repo/db'
import { and, asc, count, desc, eq, ilike, inArray, like, or, sql, type SQL } from 'drizzle-orm'
import { publicBusiness, publicProduct, publicVillage } from '../../lib/visibility'

const enCategory = sql<string | null>`(
  select ${categoryTranslations.name} from ${categoryTranslations}
  where ${categoryTranslations.categoryId} = ${categories.id} and ${categoryTranslations.locale} = 'en'
)`
const enName = sql<string | null>`(
  select ${productTranslations.name} from ${productTranslations}
  where ${productTranslations.productId} = ${products.id} and ${productTranslations.locale} = 'en'
)`
const firstImage = sql<string | null>`(
  select ${productImages.storageKey} from ${productImages}
  where ${productImages.productId} = ${products.id}
  order by ${productImages.sortOrder} limit 1
)`

const summaryColumns = {
  id: products.id,
  slug: products.slug,
  name: products.name,
  nameEn: enName,
  price: products.price,
  compareAtPrice: products.compareAtPrice,
  isAvailable: products.isAvailable,
  imageKey: firstImage,
  isSeed: products.isSeed,
  categorySlug: categories.slug,
  categoryName: categories.name,
  categoryNameEn: enCategory,
  businessSlug: businesses.slug,
  businessName: businesses.name,
  villageSlug: villages.slug,
  villageName: villages.name,
  villageTheme: villages.theme,
  villageIsSeed: villages.isSeed,
}

export type SummaryRow = Awaited<ReturnType<typeof baseQuery>>[number]

function baseQuery(db: Database) {
  return db
    .select(summaryColumns)
    .from(products)
    .innerJoin(businesses, eq(businesses.id, products.businessId))
    .innerJoin(villages, eq(villages.id, products.villageId))
    .leftJoin(categories, eq(categories.id, products.categoryId))
}

export interface ProductSearch {
  q?: string
  category?: string
  region?: string
  village?: string
  business?: string
  sort: 'newest' | 'price_asc' | 'price_desc'
  page: number
  pageSize: number
}

export async function searchProducts(db: Database, s: ProductSearch) {
  const conditions: (SQL | undefined)[] = [publicProduct, publicBusiness, publicVillage]
  if (s.q) {
    const term = `%${s.q.replace(/[%_]/g, '')}%`
    conditions.push(
      or(
        ilike(products.name, term),
        ilike(products.description, term),
        ilike(businesses.name, term),
      ),
    )
  }
  if (s.category) conditions.push(eq(categories.slug, s.category))
  if (s.village) conditions.push(eq(villages.slug, s.village))
  if (s.business) conditions.push(eq(businesses.slug, s.business))
  if (s.region)
    conditions.push(
      or(eq(villages.regionCode, s.region), like(villages.regionCode, `${s.region}.%`)),
    )
  const where = and(...conditions)

  const order =
    s.sort === 'price_asc'
      ? asc(products.price)
      : s.sort === 'price_desc'
        ? desc(products.price)
        : desc(products.createdAt)

  const [rows, [totalRow]] = await Promise.all([
    baseQuery(db)
      .where(where)
      .orderBy(order, asc(products.name))
      .limit(s.pageSize)
      .offset((s.page - 1) * s.pageSize),
    db
      .select({ total: count() })
      .from(products)
      .innerJoin(businesses, eq(businesses.id, products.businessId))
      .innerJoin(villages, eq(villages.id, products.villageId))
      .leftJoin(categories, eq(categories.id, products.categoryId))
      .where(where),
  ])
  return { rows, total: totalRow?.total ?? 0 }
}

export async function findPublicProductBySlug(db: Database, slug: string) {
  const [row] = await db
    .select({
      ...summaryColumns,
      description: products.description,
      businessId: businesses.id,
      ownerName: businesses.ownerName,
      whatsappNumber: businesses.whatsappNumber,
      shopeeUrl: businesses.shopeeUrl,
      tokopediaUrl: businesses.tokopediaUrl,
      tiktokShopUrl: businesses.tiktokShopUrl,
      instagramUrl: businesses.instagramUrl,
      openingHours: businesses.openingHours,
      closedUntil: businesses.closedUntil,
      closedNote: businesses.closedNote,
      verifiedAt: businesses.verifiedAt,
      descriptionEn: sql<string | null>`(
        select ${productTranslations.description} from ${productTranslations}
        where ${productTranslations.productId} = ${products.id} and ${productTranslations.locale} = 'en'
      )`,
    })
    .from(products)
    .innerJoin(businesses, eq(businesses.id, products.businessId))
    .innerJoin(villages, eq(villages.id, products.villageId))
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(and(publicProduct, publicBusiness, publicVillage, eq(products.slug, slug)))
  if (!row) return null

  const [images, more] = await Promise.all([
    db
      .select({ key: productImages.storageKey, alt: productImages.alt })
      .from(productImages)
      .where(eq(productImages.productId, row.id))
      .orderBy(asc(productImages.sortOrder)),
    db
      .select({
        slug: products.slug,
        name: products.name,
        nameEn: enName,
        price: products.price,
        compareAtPrice: products.compareAtPrice,
      })
      .from(products)
      .where(
        and(
          publicProduct,
          eq(products.businessId, row.businessId),
          sql`${products.id} <> ${row.id}`,
        ),
      )
      .orderBy(asc(products.name))
      .limit(6),
  ])
  return { row, images, more }
}

export async function listCategories(db: Database) {
  return db
    .select({
      id: categories.id,
      slug: categories.slug,
      name: categories.name,
      nameEn: enCategory,
      icon: categories.icon,
    })
    .from(categories)
    .orderBy(asc(categories.sortOrder))
}

export async function productIdsExist(db: Database, ids: string[]) {
  if (ids.length === 0) return []
  return db.select({ id: products.id }).from(products).where(inArray(products.id, ids))
}
