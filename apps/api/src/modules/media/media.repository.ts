import { businesses, productImages, products, villages } from '@repo/db'
import { and, asc, eq, isNull, like, max, sql } from 'drizzle-orm'
import type { DbOrTx } from '../../lib/audit'

/** Data access for media. No authorization here (media.service.ts checks `can()`). */

export async function productForMedia(db: DbOrTx, id: string) {
  const [row] = await db
    .select({
      id: products.id,
      villageId: products.villageId,
      businessId: products.businessId,
      status: products.status,
    })
    .from(products)
    .innerJoin(businesses, eq(businesses.id, products.businessId))
    .innerJoin(villages, eq(villages.id, products.villageId))
    .where(
      and(
        eq(products.id, id),
        isNull(products.deletedAt),
        isNull(businesses.deletedAt),
        isNull(villages.deletedAt),
      ),
    )
  if (!row) return null
  const images = await db
    .select({ key: productImages.storageKey })
    .from(productImages)
    .where(eq(productImages.productId, id))
    .orderBy(asc(productImages.sortOrder))
  return { ...row, keys: images.map((i) => i.key) }
}

export async function businessForMedia(db: DbOrTx, id: string) {
  const [row] = await db
    .select({ id: businesses.id, villageId: businesses.villageId, logoKey: businesses.logoKey })
    .from(businesses)
    .innerJoin(villages, eq(villages.id, businesses.villageId))
    .where(and(eq(businesses.id, id), isNull(businesses.deletedAt), isNull(villages.deletedAt)))
  return row ?? null
}

export async function villageForMedia(db: DbOrTx, id: string) {
  const [row] = await db
    .select({ id: villages.id, logoKey: villages.logoKey, bannerKey: villages.bannerKey })
    .from(villages)
    .where(and(eq(villages.id, id), isNull(villages.deletedAt)))
  return row ?? null
}

export async function addProductImage(
  db: DbOrTx,
  productId: string,
  storageKey: string,
  alt: string | null,
) {
  const [last] = await db
    .select({ n: max(productImages.sortOrder) })
    .from(productImages)
    .where(eq(productImages.productId, productId))
  await db.insert(productImages).values({
    productId,
    storageKey,
    alt,
    sortOrder: last?.n === null || last?.n === undefined ? 0 : last.n + 1,
  })
}

export async function removeProductImage(db: DbOrTx, productId: string, storageKey: string) {
  const rows = await db
    .delete(productImages)
    .where(and(eq(productImages.productId, productId), eq(productImages.storageKey, storageKey)))
    .returning({ id: productImages.id })
  return rows.length > 0
}

export async function setBusinessLogo(db: DbOrTx, id: string, key: string | null) {
  await db.update(businesses).set({ logoKey: key }).where(eq(businesses.id, id))
}

export async function setVillageImage(
  db: DbOrTx,
  id: string,
  column: 'logoKey' | 'bannerKey',
  key: string | null,
) {
  await db
    .update(villages)
    .set({ [column]: key })
    .where(eq(villages.id, id))
}

/** Every stored key under `prefix` that a row still points to (orphan clean-up). */
export async function referencedKeys(db: DbOrTx, prefix: string) {
  const pattern = `${prefix.replace(/[\\%_]/g, (m) => `\\${m}`)}%`
  const rows = await db.execute<{ key: string }>(sql`
    select ${productImages.storageKey} as key from ${productImages} where ${like(productImages.storageKey, pattern)}
    union select ${businesses.logoKey} from ${businesses} where ${like(businesses.logoKey, pattern)}
    union select ${villages.logoKey} from ${villages} where ${like(villages.logoKey, pattern)}
    union select ${villages.bannerKey} from ${villages} where ${like(villages.bannerKey, pattern)}
  `)
  return new Set(rows.map((r) => r.key))
}
