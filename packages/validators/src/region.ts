import { z } from 'zod'

/** Kemendagri levels, top to bottom. */
export const regionLevels = ['province', 'regency', 'district', 'village'] as const
export type RegionLevelName = (typeof regionLevels)[number]

/** "32", "32.04", "32.04.16", "32.04.16.2005". */
export const regionCodeSchema = z
  .string()
  .regex(/^\d{2}(\.\d{2}(\.\d{2}(\.\d{4})?)?)?$/, 'Kode wilayah tidak valid')

/** `GET /v1/regions/search`: one search box for the region picker ("baros arjasari"). */
export const regionSearchQuerySchema = z.object({
  q: z.string().trim().min(2).max(100),
  level: z.enum(regionLevels).optional(),
  /** Only regions strictly inside this code (e.g. "32" = everything in Jawa Barat, not the province). */
  within: regionCodeSchema.optional(),
  limit: z.coerce.number().int().min(1).max(20).default(10),
})

/** `GET /v1/regions`: children of `parent`, or the provinces when it is missing (cascading picker). */
export const regionChildrenQuerySchema = z.object({
  parent: regionCodeSchema.optional(),
})

const MAX_TERMS = 5

/**
 * Search words, lowercased, punctuation removed, LIKE wildcards impossible ("%" and "_" are dropped
 * with the rest of the punctuation). Every word must appear in the region's full name.
 */
export function regionSearchTerms(q: string): string[] {
  return q
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2)
    .slice(0, MAX_TERMS)
}

export type RegionSearchQuery = z.infer<typeof regionSearchQuerySchema>
