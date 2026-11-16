import { z } from '@hono/zod-openapi'

const point = z.object({ lat: z.number(), lng: z.number() })

/** "Pengaturan desa": what a village's team sees and its admins edit. */
export const villageSettingsSchema = z
  .object({
    id: z.uuid(),
    slug: z.string(),
    name: z.string(),
    status: z.enum(['draft', 'published', 'archived']),
    description: z.string().nullable(),
    contactPhone: z.string().nullable(),
    contactEmail: z.string().nullable(),
    address: z.string().nullable(),
    region: z
      .object({
        code: z.string(),
        fullName: z.string(),
        /** Centre point of the region from the Kemendagri dataset. */
        point: point.nullable(),
      })
      .nullable(),
    /** The centre the village admin chose; null = use the region's point. */
    center: point.nullable(),
    /** What maps should open on: `center`, else the region's point. */
    mapCenter: point.nullable(),
    permissions: z.object({ update: z.boolean() }),
    updatedAt: z.string(),
  })
  .openapi('VillageSettings')

export const villageSettingsResponseSchema = z.object({ data: villageSettingsSchema })

export const villageListItemSchema = z
  .object({
    id: z.uuid(),
    slug: z.string(),
    name: z.string(),
    status: z.enum(['draft', 'published', 'archived']),
    regionFullName: z.string().nullable(),
    permissions: z.object({ update: z.boolean() }),
  })
  .openapi('VillageListItem')

export const villageListResponseSchema = z.object({
  data: z.array(villageListItemSchema),
  meta: z.object({ page: z.number(), pageSize: z.number(), total: z.number() }),
})

export type VillageSettings = z.infer<typeof villageSettingsSchema>
