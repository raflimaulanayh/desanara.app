import { z } from '@hono/zod-openapi'
import { paginationMetaSchema } from '../villages/villages.schema'

/** What the caller may do with this business, computed by `can()` (dashboard uses it to show buttons). */
export const businessPermissionsSchema = z
  .object({
    update: z.boolean(),
    publish: z.boolean(),
    changeSlug: z.boolean(),
    delete: z.boolean(),
    verify: z.boolean(),
    takedown: z.boolean(),
  })
  .openapi('BusinessPermissions')

export const businessManageSchema = z
  .object({
    id: z.uuid(),
    village: z.object({ id: z.uuid(), slug: z.string(), name: z.string() }),
    slug: z.string(),
    name: z.string(),
    ownerName: z.string().nullable(),
    description: z.string().nullable(),
    whatsappNumber: z.string().nullable(),
    address: z.string().nullable(),
    logoKey: z.string().nullable(),
    shopeeUrl: z.string().nullable(),
    tokopediaUrl: z.string().nullable(),
    tiktokShopUrl: z.string().nullable(),
    instagramUrl: z.string().nullable(),
    nib: z.string().nullable(),
    openingHours: z.record(z.string(), z.unknown()).nullable(),
    closedUntil: z.string().nullable(),
    closedNote: z.string().nullable(),
    verificationStatus: z.enum(['pending', 'verified', 'rejected']),
    verifiedAt: z.string().nullable(),
    /** Reason of the last review decision; shown to the assistant when rejected. */
    verificationNote: z.string().nullable(),
    consentAt: z.string().nullable(),
    consentMethod: z.enum(['paper_form', 'in_app']).nullable(),
    takenDownAt: z.string().nullable(),
    takedownReason: z.string().nullable(),
    status: z.enum(['draft', 'published', 'archived']),
    productCount: z.number().int(),
    isSeed: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
    permissions: businessPermissionsSchema,
  })
  .openapi('BusinessManage')

export const businessManageResponseSchema = z.object({ data: businessManageSchema })
export const businessManageListResponseSchema = z.object({
  data: z.array(businessManageSchema),
  meta: paginationMetaSchema,
})

export type BusinessManage = z.infer<typeof businessManageSchema>
