import { z } from '@hono/zod-openapi'
import { paginationMetaSchema } from '../villages/villages.schema'

/** What the caller may do with this product, computed by `can()` (dashboard uses it to show buttons). */
export const productPermissionsSchema = z
  .object({
    update: z.boolean(),
    publish: z.boolean(),
    delete: z.boolean(),
  })
  .openapi('ProductPermissions')

export const productManageSchema = z
  .object({
    id: z.uuid(),
    business: z.object({ id: z.uuid(), slug: z.string(), name: z.string() }),
    villageId: z.uuid(),
    category: z.object({ id: z.uuid(), slug: z.string(), name: z.string() }).nullable(),
    slug: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    /** Selling price in whole rupiah; 0 = free. */
    price: z.number().int(),
    /** Normal price shown struck through, or null. */
    compareAtPrice: z.number().int().nullable(),
    isFree: z.boolean(),
    isAvailable: z.boolean(),
    status: z.enum(['draft', 'published', 'archived']),
    en: z.object({ name: z.string(), description: z.string().nullable() }).nullable(),
    /** Photos in display order (managed by the upload endpoints). Publishing needs at least one. */
    images: z.array(
      z.object({
        id: z.uuid(),
        key: z.string(),
        alt: z.string().nullable(),
        sortOrder: z.number().int(),
      }),
    ),
    isSeed: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
    permissions: productPermissionsSchema,
  })
  .openapi('ProductManage')

export const productManageResponseSchema = z.object({ data: productManageSchema })
export const productManageListResponseSchema = z.object({
  data: z.array(productManageSchema),
  meta: paginationMetaSchema,
})

export type ProductManage = z.infer<typeof productManageSchema>
