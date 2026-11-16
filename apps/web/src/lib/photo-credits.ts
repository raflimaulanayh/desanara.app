import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

/**
 * Attribution for the sample photos in public/media/seed (CC BY / BY-SA require it). Read from the
 * `*.webp.json` sidecars at build time; the credits page is fully static, so nothing reads the disk
 * at runtime (Vercel functions do not ship /public).
 */
export interface PhotoCredit {
  /** Media key, e.g. "seed/products/board.webp". */
  key: string
  title: string
  author: string | null
  license: string | null
  licenseUrl: string | null
  source: string | null
}

const LICENSE_URLS: Record<string, string> = {
  CC0: 'https://creativecommons.org/publicdomain/zero/1.0/',
  'Public domain': 'https://creativecommons.org/publicdomain/mark/1.0/',
}

/** "CC BY-SA 4.0" → https://creativecommons.org/licenses/by-sa/4.0/ */
export function licenseUrl(license: string | null | undefined): string | null {
  if (!license) return null
  if (LICENSE_URLS[license]) return LICENSE_URLS[license]
  const m = license.match(/^CC (BY(?:-SA|-ND|-NC)*) (\d\.\d)$/)
  return m ? `https://creativecommons.org/licenses/${m[1]!.toLowerCase()}/${m[2]}/` : null
}

interface Sidecar {
  source?: string
  title?: string
  author?: string
  license?: string
}

export async function readPhotoCredits(
  root = join(process.cwd(), 'public/media'),
): Promise<PhotoCredit[]> {
  const out: PhotoCredit[] = []
  const walk = async (dir: string) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) await walk(path)
      else if (entry.name.endsWith('.webp.json')) {
        const s = JSON.parse(await readFile(path, 'utf8')) as Sidecar
        // Only third-party stock photos carry a licence; the partner village's own logo/banner do not.
        if (!s.license) continue
        out.push({
          key: relative(root, path)
            .replace(/\.json$/, '')
            .split('\\')
            .join('/'),
          title: (s.title ?? entry.name).replace(/^File:/, '').replace(/\.[a-z]+$/i, ''),
          author: s.author ?? null,
          license: s.license,
          licenseUrl: licenseUrl(s.license),
          source: s.source ?? null,
        })
      }
    }
  }
  await walk(join(root, 'seed'))
  return out.sort((a, b) => a.key.localeCompare(b.key))
}
