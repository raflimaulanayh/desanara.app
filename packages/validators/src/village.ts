import { z } from 'zod'
import { clearable, clearableText, paginationSchema, slugSchema } from './common'
import {
  PAIRED_COORDINATES_MESSAGE,
  bothOrNeither,
  latitudeSchema,
  longitudeSchema,
} from './location'

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

/** Office phone: digits with the usual separators ("022-123 456", "+62 812 …"). */
const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9][0-9\s\-()]{5,19}$/, 'Nomor telepon tidak valid')

/**
 * `PATCH /v1/manage/villages/{id}`: what a village admin may change in "Pengaturan desa".
 * Name, slug and region are set by the platform (super admin), not here. Missing = unchanged,
 * '' or null = cleared. `centerLat`/`centerLng` go together; null on both = back to the region's point.
 */
export const villageSettingsSchema = z
  .object({
    description: clearableText(2000),
    contactPhone: clearable(phoneSchema),
    contactEmail: clearable(z.email('Email tidak valid')),
    address: clearableText(300),
    centerLat: latitudeSchema.nullish(),
    centerLng: longitudeSchema.nullish(),
  })
  .refine(bothOrNeither('centerLat', 'centerLng'), {
    message: PAIRED_COORDINATES_MESSAGE,
    path: ['centerLat'],
  })

/** `GET /v1/manage/villages`: settings list, searchable by name. */
export const villageListQuerySchema = paginationSchema.extend({
  q: z.string().trim().max(100).optional(),
})

export type VillageListQuery = z.infer<typeof villageListQuerySchema>
export type VillageSettingsInput = z.infer<typeof villageSettingsSchema>
/** What a client sends (before trimming and '' → null). */
export type VillageSettingsPatch = z.input<typeof villageSettingsSchema>
export type VillageCreateInput = z.infer<typeof villageCreateSchema>
export type VillageUpdateInput = z.infer<typeof villageUpdateSchema>
