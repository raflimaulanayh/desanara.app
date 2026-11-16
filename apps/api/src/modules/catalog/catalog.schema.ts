import { z } from '@hono/zod-openapi'

export const categorySchema = z
  .object({
    id: z.uuid(),
    slug: z.string(),
    name: z.string(),
    nameEn: z.string().nullable(),
    icon: z.string().nullable(),
  })
  .openapi('Category')

export const productSummarySchema = z
  .object({
    id: z.uuid(),
    slug: z.string(),
    name: z.string(),
    nameEn: z.string().nullable(),
    /** Selling price in whole rupiah; 0 = free ("Gratis"). */
    price: z.number().int(),
    /** Normal price shown struck through (discount or free promo), or null. */
    compareAtPrice: z.number().int().nullable(),
    isFree: z.boolean(),
    isAvailable: z.boolean(),
    imageKey: z.string().nullable(),
    category: z
      .object({ slug: z.string(), name: z.string(), nameEn: z.string().nullable() })
      .nullable(),
    business: z.object({ slug: z.string(), name: z.string() }),
    village: z.object({
      slug: z.string(),
      name: z.string(),
      accent: z.string(),
      isSeed: z.boolean(),
    }),
    isSeed: z.boolean(),
  })
  .openapi('ProductSummary')

export const productDetailSchema = productSummarySchema
  .extend({
    description: z.string().nullable(),
    descriptionEn: z.string().nullable(),
    images: z.array(z.object({ key: z.string(), alt: z.string().nullable() })),
    business: z.object({
      slug: z.string(),
      name: z.string(),
      ownerName: z.string().nullable(),
      whatsappNumber: z.string().nullable(),
      shopeeUrl: z.string().nullable(),
      tokopediaUrl: z.string().nullable(),
      tiktokShopUrl: z.string().nullable(),
      instagramUrl: z.string().nullable(),
      openingHours: z.record(z.string(), z.unknown()).nullable(),
      closedUntil: z.string().nullable(),
      closedNote: z.string().nullable(),
      verifiedAt: z.string().nullable(),
    }),
    more: z.array(
      productSummarySchema.pick({
        slug: true,
        name: true,
        nameEn: true,
        price: true,
        compareAtPrice: true,
        isFree: true,
      }),
    ),
  })
  .openapi('ProductDetail')

export const productListResponseSchema = z.object({
  data: z.array(productSummarySchema),
  meta: z.object({ page: z.number().int(), pageSize: z.number().int(), total: z.number().int() }),
})
