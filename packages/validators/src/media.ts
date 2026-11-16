import { z } from 'zod'

/**
 * Image uploads (docs/architecture/storage.md). One table of rules per target, shared by the API
 * (limits it enforces) and the dashboard (how far it compresses). Add a target here, then register
 * who may use it and where it is stored in apps/api/src/modules/media/media.targets.ts.
 */
export const mediaTargets = [
  'product_image',
  'business_logo',
  'village_logo',
  'village_banner',
] as const
export type MediaTarget = (typeof mediaTargets)[number]

/** The dashboard always re-encodes (strips EXIF/GPS); WebP, or JPEG where the browser cannot encode WebP. */
export const mediaContentTypes = ['image/webp', 'image/jpeg'] as const
export type MediaContentType = (typeof mediaContentTypes)[number]

export interface MediaRule {
  /** Largest stored file, checked by the signed upload and again before attaching. */
  maxBytes: number
  /** How many files the entity may hold (1 = a single slot that is replaced). */
  maxCount: number
  /** Longest edge after client-side resize, in pixels. */
  maxEdge: number
}

const MB = 1024 * 1024

export const mediaRules: Record<MediaTarget, MediaRule> = {
  product_image: { maxBytes: 2 * MB, maxCount: 10, maxEdge: 1600 },
  business_logo: { maxBytes: 1 * MB, maxCount: 1, maxEdge: 800 },
  village_logo: { maxBytes: 1 * MB, maxCount: 1, maxEdge: 800 },
  village_banner: { maxBytes: 2 * MB, maxCount: 1, maxEdge: 2400 },
}

const target = z.enum(mediaTargets)

/** `POST /v1/manage/media/presign`: ask for a one-time upload URL. */
export const mediaPresignSchema = z
  .object({
    target,
    /** Id of the product, business or village the file belongs to. */
    id: z.uuid(),
    contentType: z.enum(mediaContentTypes),
    size: z.number().int().min(1),
  })
  .refine((v) => v.size <= mediaRules[v.target].maxBytes, {
    message: 'File terlalu besar',
    path: ['size'],
  })

/** `POST /v1/manage/media`: attach an uploaded file to its entity. */
export const mediaAttachSchema = z.object({
  target,
  id: z.uuid(),
  key: z.string().min(1).max(300),
  alt: z.string().trim().max(200).optional(),
})

/** `DELETE /v1/manage/media?target&id&key`: remove a file from its entity (and from storage). */
export const mediaRemoveQuerySchema = mediaAttachSchema.pick({ target: true, id: true, key: true })

/** `PATCH /v1/manage/products/{id}/images`: every image id of the product, cover first. */
export const productImageOrderSchema = z.object({
  order: z
    .array(z.uuid())
    .min(1)
    .max(mediaRules.product_image.maxCount)
    .refine((ids) => new Set(ids).size === ids.length, 'Urutan berisi foto yang sama dua kali'),
})

export const extensionFor = (contentType: MediaContentType) =>
  contentType === 'image/webp' ? 'webp' : 'jpg'

/**
 * Size after resizing so the longest edge is at most `maxEdge` (never upscales).
 * Used by the dashboard before encoding.
 */
export function fitWithin(width: number, height: number, maxEdge: number) {
  const scale = Math.min(1, maxEdge / Math.max(width, height))
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

export type MediaPresignInput = z.infer<typeof mediaPresignSchema>
export type MediaAttachInput = z.infer<typeof mediaAttachSchema>
export type MediaRemoveQuery = z.infer<typeof mediaRemoveQuerySchema>
export type ProductImageOrderInput = z.infer<typeof productImageOrderSchema>
