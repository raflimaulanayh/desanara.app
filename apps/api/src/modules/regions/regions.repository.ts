import { type Database, regions } from '@repo/db'
import type { RegionLevelName } from '@repo/validators'
import { and, asc, desc, eq, isNull, like, sql } from 'drizzle-orm'

const columns = {
  code: regions.code,
  name: regions.name,
  level: regions.level,
  fullName: regions.fullName,
  lat: regions.lat,
  lng: regions.lng,
}

/** Name without "Kabupaten "/"Kota ", so "bandung" is an exact match for Kota and Kabupaten Bandung. */
const bareName = sql`regexp_replace(lower(${regions.name}), '^(kabupaten|kota administrasi|kota) ', '')`

/** Province first, village last: a short query ("bandung") lists the regency before its villages. */
const levelRank = sql`case ${regions.level} when 'province' then 0 when 'regency' then 1 when 'district' then 2 else 3 end`

/**
 * Every term must appear in the full name ("baros arjasari"). Uses the trigram index on
 * lower(full_name). Terms come from `regionSearchTerms`, which strips LIKE wildcards.
 */
export function searchRegions(
  db: Database,
  {
    terms,
    level,
    within,
    limit,
  }: { terms: string[]; level?: RegionLevelName; within?: string; limit: number },
) {
  const phrase = terms.join(' ')
  return db
    .select(columns)
    .from(regions)
    .where(
      and(
        isNull(regions.retiredAt),
        ...terms.map((t) => sql`lower(${regions.fullName}) like ${`%${t}%`}`),
        level ? eq(regions.level, level) : undefined,
        within ? like(regions.code, `${within}.%`) : undefined,
      ),
    )
    .orderBy(
      desc(sql`${bareName} = ${phrase}`),
      desc(sql`${bareName} like ${`${terms[0]}%`}`),
      asc(levelRank),
      desc(sql`similarity(lower(${regions.fullName}), ${phrase})`),
      asc(regions.name),
    )
    .limit(limit)
}

/** Direct children of a region, or the provinces when `parent` is missing. */
export function listChildren(db: Database, parent?: string) {
  return db
    .select(columns)
    .from(regions)
    .where(
      and(
        isNull(regions.retiredAt),
        parent ? eq(regions.parentCode, parent) : eq(regions.level, 'province'),
      ),
    )
    .orderBy(asc(regions.name))
}

export async function findRegion(db: Database, code: string) {
  const [row] = await db.select(columns).from(regions).where(eq(regions.code, code))
  return row ?? null
}
