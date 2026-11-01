import { z } from '@hono/zod-openapi'

export const businessPublicSchema = z
  .object({
    id: z.uuid(),
    slug: z.string(),
    name: z.string(),
    ownerName: z.string().nullable(),
    description: z.string().nullable(),
    address: z.string().nullable(),
    logoKey: z.string().nullable(),
    whatsappNumber: z.string().nullable(),
    shopeeUrl: z.string().nullable(),
    tokopediaUrl: z.string().nullable(),
    tiktokShopUrl: z.string().nullable(),
    instagramUrl: z.string().nullable(),
    openingHours: z.record(z.string(), z.unknown()).nullable(),
    closedUntil: z.string().nullable(),
    closedNote: z.string().nullable(),
    verifiedAt: z.string().nullable(),
    productCount: z.number().int(),
    isSeed: z.boolean(),
  })
  .openapi('BusinessPublic')

export const businessDetailSchema = businessPublicSchema
  .extend({
    village: z.object({
      slug: z.string(),
      name: z.string(),
      regionName: z.string().nullable(),
      timezone: z.string(),
      logoKey: z.string().nullable(),
      theme: z.record(z.string(), z.unknown()),
      isSeed: z.boolean(),
    }),
  })
  .openapi('BusinessDetail')
