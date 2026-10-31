import { z } from 'zod'
import { optionalUrl, slugSchema, whatsappNumberSchema } from './common'

export const businessCreateSchema = z.object({
  villageId: z.uuid(),
  name: z.string().trim().min(3).max(120),
  slug: slugSchema,
  ownerName: z.string().trim().max(120).optional(),
  description: z.string().trim().max(2000).optional(),
  whatsappNumber: whatsappNumberSchema.optional(),
  address: z.string().trim().max(300).optional(),
  shopeeUrl: optionalUrl,
  tokopediaUrl: optionalUrl,
  tiktokShopUrl: optionalUrl,
  instagramUrl: optionalUrl,
  nib: z
    .string()
    .regex(/^\d{13}$/, 'NIB terdiri dari 13 digit')
    .optional(),
  /** Must be true before the business can be published (UU PDP consent). */
  consentGiven: z.boolean().default(false),
})
export const businessUpdateSchema = businessCreateSchema.omit({ villageId: true }).partial()

export const businessVerifySchema = z.object({
  decision: z.enum(['verified', 'rejected']),
  note: z.string().trim().max(500).optional(),
})

export type BusinessCreateInput = z.infer<typeof businessCreateSchema>
export type BusinessUpdateInput = z.infer<typeof businessUpdateSchema>
