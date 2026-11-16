/**
 * Builds packages/db/data/regions/regions.csv.gz from the upstream open datasets (MIT, Cahya DSN):
 *   - codes and names:   cahyadsn/wilayah            db/wilayah.sql
 *   - centre points:     cahyadsn/wilayah_boundaries db/{prov,kab,kec,kel}/**.sql (lat/lng only)
 * Both follow the Kepmendagri 2025 region codes. Run only when a new dataset version is adopted;
 * the import (`bun run db:regions:import`) reads the committed CSV, never the network.
 *
 *   bun src/regions/build-dataset.ts <path/to/wilayah.sql> <path/to/wilayah_boundaries/db>
 *
 * Output columns: code,name,level,parent_code,full_name,lat,lng (see docs/architecture/data-model.md).
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import { LEVELS, type RegionLevel, regionsCsvPath } from './dataset'

const [wilayahSql, boundariesDir] = process.argv.slice(2)
if (!wilayahSql || !boundariesDir) {
  console.error('usage: bun src/regions/build-dataset.ts <wilayah.sql> <wilayah_boundaries/db>')
  process.exit(1)
}

/** SQL string literal body → text ('' and \' are both used upstream). */
const unquote = (s: string) => s.replace(/''/g, "'").replace(/\\'/g, "'")

const names = new Map<string, string>()
for (const m of readFileSync(wilayahSql, 'utf8').matchAll(
  /\('([0-9.]+)','((?:[^'\\]|\\.|'')*)'\)/g,
)) {
  names.set(m[1]!, unquote(m[2]!).trim())
}

const centres = new Map<string, [number, number]>()
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.sql') ? [p] : []
  })
const point = /\('([0-9.]+)','(?:[^'\\]|\\.|'')*',(-?\d+(?:\.\d+)?|NULL),(-?\d+(?:\.\d+)?|NULL),/g
for (const file of walk(boundariesDir)) {
  for (const m of readFileSync(file, 'utf8').matchAll(point)) {
    if (m[2] === 'NULL' || m[3] === 'NULL') continue
    const lat = Number(m[2])
    const lng = Number(m[3])
    // Indonesia lies within about 6°N–11°S and 95°E–141°E; anything else is a data error.
    if (lat < -12 || lat > 7 || lng < 94 || lng > 142) continue
    centres.set(m[1]!, [lat, lng])
  }
}

const levelOf = (code: string): RegionLevel => LEVELS[code.split('.').length - 1]!
const parentOf = (code: string) => code.split('.').slice(0, -1).join('.')

/** "Baros, Kec. Arjasari, Kabupaten Bandung, Jawa Barat": what the region picker shows and searches. */
function fullName(code: string) {
  const parts = code.split('.')
  const out: string[] = []
  for (let n = parts.length; n >= 1; n--) {
    const c = parts.slice(0, n).join('.')
    const name = names.get(c)
    if (!name) continue
    out.push(n === 3 ? `Kec. ${name}` : name)
  }
  return out.join(', ')
}

const csvField = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)
const lines = ['code,name,level,parent_code,full_name,lat,lng']
const codes = [...names.keys()].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
const counts: Record<string, number> = {}
let withPoint = 0
for (const code of codes) {
  const level = levelOf(code)
  counts[level] = (counts[level] ?? 0) + 1
  const centre = centres.get(code)
  if (centre) withPoint++
  lines.push(
    [
      code,
      csvField(names.get(code)!),
      level,
      parentOf(code),
      csvField(fullName(code)),
      centre ? centre[0].toFixed(6) : '',
      centre ? centre[1].toFixed(6) : '',
    ].join(','),
  )
}

writeFileSync(regionsCsvPath, gzipSync(`${lines.join('\n')}\n`, { level: 9 }))
console.log(`${codes.length} regions`, counts, `${withPoint} with a centre point`)
console.log(`written ${regionsCsvPath}`)
