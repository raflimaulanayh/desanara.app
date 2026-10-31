import { z } from '@hono/zod-openapi'
import { villageFonts, villageRadii, villageTemplates } from '@repo/validators'

export const villageSummarySchema = z
  .object({
    id: z.uuid(),
    slug: z.string(),
    name: z.string(),
    regionCode: z.string().nullable(),
    regionName: z.string().nullable(),
    description: z.string().nullable(),
    businessCount: z.number().int(),
  })
  .openapi('VillageSummary')

export const villageDetailSchema = villageSummarySchema
  .extend({
    address: z.string().nullable(),
    contactPhone: z.string().nullable(),
    contactEmail: z.string().nullable(),
    bannerKey: z.string().nullable(),
    logoKey: z.string().nullable(),
    /** Always a valid theme: stored value parsed with parseVillageTheme (default when unset). */
    theme: z
      .object({
        version: z.literal(1),
        template: z.enum(villageTemplates),
        accent: z.string(),
        font: z.enum(villageFonts),
        radius: z.enum(villageRadii),
      })
      .openapi('VillageTheme'),
  })
  .openapi('VillageDetail')

export const paginationMetaSchema = z
  .object({ page: z.number().int(), pageSize: z.number().int(), total: z.number().int() })
  .openapi('PaginationMeta')

export const villageListResponseSchema = z.object({
  data: z.array(villageSummarySchema),
  meta: paginationMetaSchema,
})

export const villageDetailResponseSchema = z.object({ data: villageDetailSchema })

export type VillageSummary = z.infer<typeof villageSummarySchema>
export type VillageDetail = z.infer<typeof villageDetailSchema>
