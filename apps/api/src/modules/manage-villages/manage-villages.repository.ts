import { regions, villages } from '@repo/db'
import { type SQL, and, asc, count, eq, ilike, inArray, isNull } from 'drizzle-orm'
import type { DbOrTx } from '../../lib/audit'

/** Data access for "Pengaturan desa". No authorization here: the service checks `can()`. */
export async function findVillage(db: DbOrTx, id: string) {
  const [row] = await db
    .select({
      id: villages.id,
      slug: villages.slug,
      name: villages.name,
      status: villages.status,
      description: villages.description,
      contactPhone: villages.contactPhone,
      contactEmail: villages.contactEmail,
      address: villages.address,
      centerLat: villages.centerLat,
      centerLng: villages.centerLng,
      regionCode: regions.code,
      regionFullName: regions.fullName,
      regionLat: regions.lat,
      regionLng: regions.lng,
      updatedAt: villages.updatedAt,
    })
    .from(villages)
    .leftJoin(regions, eq(regions.code, villages.regionCode))
    .where(and(eq(villages.id, id), isNull(villages.deletedAt)))
  return row ?? null
}

export type VillageRow = NonNullable<Awaited<ReturnType<typeof findVillage>>>

export async function updateVillage(db: DbOrTx, id: string, values: Record<string, unknown>) {
  await db.update(villages).set(values).where(eq(villages.id, id))
}

/** Live villages for the settings list; `ids` limits it (null = every village, super admin). */
export async function listVillages(
  db: DbOrTx,
  { ids, q, page, pageSize }: { ids: string[] | null; q?: string; page: number; pageSize: number },
) {
  const conditions: (SQL | undefined)[] = [isNull(villages.deletedAt)]
  if (ids) conditions.push(inArray(villages.id, ids))
  if (q) conditions.push(ilike(villages.name, `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`))
  const where = and(...conditions)
  const [rows, [total]] = await Promise.all([
    db
      .select({
        id: villages.id,
        slug: villages.slug,
        name: villages.name,
        status: villages.status,
        regionFullName: regions.fullName,
      })
      .from(villages)
      .leftJoin(regions, eq(regions.code, villages.regionCode))
      .where(where)
      .orderBy(asc(villages.name))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ n: count() }).from(villages).where(where),
  ])
  return { rows, total: total?.n ?? 0 }
}
