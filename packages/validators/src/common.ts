import { z } from 'zod'

export const slugSchema = z
  .string()
  .min(3)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Gunakan huruf kecil, angka, dan tanda hubung')

/**
 * Accepts 08xx, +628xx, 628xx and normalises to 628xx (format used by wa.me).
 */
export const whatsappNumberSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s\-().]/g, ''))
  .transform((v) => (v.startsWith('+') ? v.slice(1) : v))
  .transform((v) => (v.startsWith('0') ? `62${v.slice(1)}` : v))
  .pipe(z.string().regex(/^628\d{7,12}$/, 'Nomor WhatsApp tidak valid'))

/** Whole rupiah, no decimals. */
export const rupiahSchema = z.coerce.number().int().min(0).max(1_000_000_000)

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
})

export const localeSchema = z.enum(['id', 'en'])

export const optionalUrl = z
  .url()
  .optional()
  .or(z.literal('').transform(() => undefined))

/** Optional text that a form can clear (PATCH): '' or null → null, missing → unchanged. */
export const clearableText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => (v === '' ? null : v))

/** Any optional field a form can clear (PATCH): '' or null → null, missing → unchanged. */
export const clearable = <T extends z.ZodType>(schema: T) =>
  z
    .union([schema, z.literal(''), z.null()])
    .optional()
    .transform((v) => (v === '' ? null : v))
