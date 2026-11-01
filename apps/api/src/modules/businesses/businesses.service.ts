import type { Database } from '@repo/db'
import { parseVillageTheme } from '@repo/validators'
import { AppError } from '../../lib/errors'
import * as repo from './businesses.repository'

type BusinessRow = Awaited<ReturnType<typeof repo.listPublicBusinessesOfVillage>>[number]

export function toPublicBusiness(r: BusinessRow) {
  return {
    ...r,
    closedUntil: r.closedUntil?.toISOString() ?? null,
    verifiedAt: r.verifiedAt?.toISOString() ?? null,
  }
}

export async function listVillageBusinesses(db: Database, villageSlug: string) {
  const rows = await repo.listPublicBusinessesOfVillage(db, villageSlug)
  return { data: rows.map(toPublicBusiness) }
}

export async function getBusiness(db: Database, slug: string) {
  const row = await repo.findPublicBusinessBySlug(db, slug)
  if (!row) throw AppError.notFound('Business')
  const {
    villageSlug,
    villageName,
    villageTimezone,
    villageLogoKey,
    villageTheme,
    villageIsSeed,
    regionName,
    ...b
  } = row
  return {
    data: {
      ...toPublicBusiness(b),
      village: {
        slug: villageSlug,
        name: villageName,
        regionName,
        timezone: villageTimezone,
        logoKey: villageLogoKey,
        theme: parseVillageTheme(villageTheme),
        isSeed: villageIsSeed,
      },
    },
  }
}
