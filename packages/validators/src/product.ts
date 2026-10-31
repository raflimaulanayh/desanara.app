import { z } from 'zod'
import { paginationSchema, rupiahSchema, slugSchema } from './common'

export const productCreateSchema = z.object({
  businessId: z.uuid(),
  categoryId: z.uuid().optional(),
  name: z.string().trim().min(3).max(120),
  slug: slugSchema,
  description: z.string().trim().max(3000).optional(),
  price: rupiahSchema,
  unit: z.string().trim().max(40).optional(),
  isAvailable: z.boolean().default(true),
  translations: z
    .object({
      en: z.object({
        name: z.string().trim().min(3).max(120),
        description: z.string().trim().max(3000).optional(),
      }),
    })
    .partial()
    .optional(),
})
export const productUpdateSchema = productCreateSchema.omit({ businessId: true }).partial()

export const productSearchSchema = paginationSchema.extend({
  q: z.string().trim().max(100).optional(),
  category: z.string().optional(),
  /** Any Kemendagri region code prefix: "32" (province), "32.04" (regency), ... */
  region: z.string().optional(),
  village: z.string().optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc']).default('newest'),
})

export type ProductCreateInput = z.infer<typeof productCreateSchema>
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>
export type ProductSearchInput = z.infer<typeof productSearchSchema>
