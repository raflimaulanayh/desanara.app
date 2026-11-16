import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'

/**
 * The committed Kemendagri region dataset (packages/db/data/regions). Source, version and licence:
 * packages/db/data/regions/SOURCE.md. Bump REGION_DATASET_VERSION whenever the CSV is rebuilt from a
 * newer upstream version, so the import knows to run again.
 */
export const REGION_DATASET_VERSION = 'kepmendagri-2025@cahyadsn-d68e8d5516'

export const LEVELS = ['province', 'regency', 'district', 'village'] as const
export type RegionLevel = (typeof LEVELS)[number]

export const regionsCsvPath = fileURLToPath(
  new URL('../../data/regions/regions.csv.gz', import.meta.url),
)

export interface RegionRow {
  code: string
  name: string
  level: RegionLevel
  parentCode: string | null
  fullName: string
  lat: number | null
  lng: number | null
}

/** Minimal CSV parser for our own file (quoted fields with "" escapes, no embedded newlines). */
function splitCsvLine(line: string): string[] {
  const out: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        field += '"'
        i++
      } else if (ch === '"') quoted = false
      else field += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') {
      out.push(field)
      field = ''
    } else field += ch
  }
  out.push(field)
  return out
}

export function parseRegionsCsv(text: string): RegionRow[] {
  const [header, ...lines] = text.trimEnd().split('\n')
  if (header !== 'code,name,level,parent_code,full_name,lat,lng') {
    throw new Error(`Unexpected regions CSV header: ${header}`)
  }
  return lines.map((line) => {
    const [code, name, level, parentCode, fullName, lat, lng] = splitCsvLine(line)
    if (!code || !name || !LEVELS.includes(level as RegionLevel)) {
      throw new Error(`Bad regions CSV line: ${line}`)
    }
    return {
      code,
      name,
      level: level as RegionLevel,
      parentCode: parentCode || null,
      fullName: fullName ?? name,
      lat: lat ? Number(lat) : null,
      lng: lng ? Number(lng) : null,
    }
  })
}

export function readRegionDataset(path = regionsCsvPath): RegionRow[] {
  return parseRegionsCsv(gunzipSync(readFileSync(path)).toString('utf8'))
}
