import type { Database } from '@repo/db'
import { parseVillageTheme } from '@repo/validators'
import { AppError } from '../../lib/errors'
import * as repo from './catalog.repository'

type Row = repo.SummaryRow

export function toSummary(r: Row) {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    nameEn: r.nameEn,
    price: r.price,
    compareAtPrice: r.compareAtPrice,
    isFree: r.price === 0,
    unit: r.unit,
    isAvailable: r.isAvailable,
    imageKey: r.imageKey,
    isSeed: r.isSeed,
    category: r.categorySlug
      ? { slug: r.categorySlug, name: r.categoryName ?? '', nameEn: r.categoryNameEn }
      : null,
    business: { slug: r.businessSlug, name: r.businessName },
    village: {
      slug: r.villageSlug,
      name: r.villageName,
      accent: parseVillageTheme(r.villageTheme).accent,
      isSeed: r.villageIsSeed,
    },
  }
}

export async function searchProducts(db: Database, input: repo.ProductSearch) {
  const { rows, total } = await repo.searchProducts(db, input)
  return { data: rows.map(toSummary), meta: { page: input.page, pageSize: input.pageSize, total } }
}

export async function getProduct(db: Database, slug: string) {
  const found = await repo.findPublicProductBySlug(db, slug)
  if (!found) throw AppError.notFound('Product')
  const { row, images, more } = found
  const summary = toSummary(row)
  return {
    data: {
      ...summary,
      description: row.description,
      descriptionEn: row.descriptionEn,
      images,
      business: {
        slug: row.businessSlug,
        name: row.businessName,
        ownerName: row.ownerName,
        whatsappNumber: row.whatsappNumber,
        shopeeUrl: row.shopeeUrl,
        tokopediaUrl: row.tokopediaUrl,
        tiktokShopUrl: row.tiktokShopUrl,
        instagramUrl: row.instagramUrl,
        openingHours: row.openingHours,
        closedUntil: row.closedUntil?.toISOString() ?? null,
        closedNote: row.closedNote,
        verifiedAt: row.verifiedAt?.toISOString() ?? null,
      },
      more: more.map((m) => ({ ...m, isFree: m.price === 0 })),
    },
  }
}

export async function listCategories(db: Database) {
  return { data: await repo.listCategories(db) }
}
