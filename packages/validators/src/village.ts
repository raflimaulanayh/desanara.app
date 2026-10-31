import { z } from 'zod'
import { slugSchema } from './common'

export const villageCreateSchema = z.object({
  name: z.string().trim().min(3).max(120),
  slug: slugSchema,
  regionCode: z
    .string()
    .regex(/^\d{2}(\.\d{2}(\.\d{2}(\.\d{4})?)?)?$/, 'Kode wilayah Kemendagri tidak valid')
    .optional(),
  description: z.string().trim().max(2000).optional(),
  contactPhone: z.string().trim().max(20).optional(),
  contactEmail: z.email().optional(),
  address: z.string().trim().max(300).optional(),
})
export const villageUpdateSchema = villageCreateSchema.partial()

export type VillageCreateInput = z.infer<typeof villageCreateSchema>
export type VillageUpdateInput = z.infer<typeof villageUpdateSchema>
