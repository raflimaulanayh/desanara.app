import type { Database } from '@repo/db'
import { parseVillageTheme } from '@repo/validators'
import { AppError } from '../../lib/errors'
import * as repo from './villages.repository'

/**
 * Business rules live in services. Public reads need no permission check;
 * every mutation added here must call `assertCan()` from @repo/auth/permissions first.
 */
export async function listVillages(db: Database, page: number, pageSize: number) {
  const { rows, total } = await repo.listPublishedVillages(db, { page, pageSize })
  const data = rows.map(({ theme, ...v }) => ({ ...v, accent: parseVillageTheme(theme).accent }))
  return { data, meta: { page, pageSize, total } }
}

export async function getVillageBySlug(db: Database, slug: string) {
  const village = await repo.findPublishedVillageBySlug(db, slug)
  if (!village) throw AppError.notFound('Village')
  // Public pages must never break on a bad stored theme: parse with fallback to the default.
  const theme = parseVillageTheme(village.theme)
  return { data: { ...village, theme, accent: theme.accent } }
}
