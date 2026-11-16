import { and, count, eq, isNull, ne, or, sql } from 'drizzle-orm'
import type { Database } from '../index'
import { regions } from '../schema'
import { REGION_DATASET_VERSION, type RegionRow, readRegionDataset } from './dataset'

const BATCH = 2000

export interface ImportResult {
  skipped: boolean
  upserted: number
  retired: number
}

/**
 * Loads the committed Kemendagri dataset into `regions`. Safe to repeat:
 * - rows are upserted by code (parents come first because the file is sorted by code);
 * - nothing is deleted: codes missing from the dataset get `retiredAt`, codes back in it lose it;
 * - when every row already carries the current dataset version the import is skipped,
 *   so `db:seed` stays fast (pass `force` to rewrite anyway).
 */
export async function importRegions(
  db: Database,
  { force = false, rows = readRegionDataset() }: { force?: boolean; rows?: RegionRow[] } = {},
): Promise<ImportResult> {
  if (!force) {
    const [current] = await db
      .select({ n: count() })
      .from(regions)
      .where(and(eq(regions.sourceVersion, REGION_DATASET_VERSION), isNull(regions.retiredAt)))
    if (current && current.n === rows.length) return { skipped: true, upserted: 0, retired: 0 }
  }

  return db.transaction(async (tx) => {
    for (let i = 0; i < rows.length; i += BATCH) {
      const batch = rows.slice(i, i + BATCH).map((r) => ({
        ...r,
        sourceVersion: REGION_DATASET_VERSION,
        retiredAt: null,
      }))
      await tx
        .insert(regions)
        .values(batch)
        .onConflictDoUpdate({
          target: regions.code,
          set: {
            name: sql`excluded.name`,
            level: sql`excluded.level`,
            parentCode: sql`excluded.parent_code`,
            fullName: sql`excluded.full_name`,
            lat: sql`excluded.lat`,
            lng: sql`excluded.lng`,
            sourceVersion: sql`excluded.source_version`,
            retiredAt: sql`null`,
          },
        })
    }
    const retired = await tx
      .update(regions)
      .set({ retiredAt: new Date() })
      .where(
        and(
          isNull(regions.retiredAt),
          or(isNull(regions.sourceVersion), ne(regions.sourceVersion, REGION_DATASET_VERSION)),
        ),
      )
      .returning({ code: regions.code })
    return { skipped: false, upserted: rows.length, retired: retired.length }
  })
}
