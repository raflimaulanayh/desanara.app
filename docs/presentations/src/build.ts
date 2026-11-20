// Builds docs/presentations/rapat-persiapan-seminar.html from the template in this folder.
// Run from the repo root: bun docs/presentations/src/build.ts   (needs ImageMagick `magick` on PATH)
// Logos come from docs/brand/desanara/ and photos from apps/web/public/media/, so rebuild after either changes.
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const here = 'docs/presentations/src'
const out = 'docs/presentations/rapat-persiapan-seminar.html'
const media = 'apps/web/public/media/seed'

// name -> [source, ImageMagick resize arguments]
const images: Record<string, [string, string[]]> = {
  banner: [`${media}/villages/baros/banner.webp`, ['-resize', '1280x', '-quality', '58']],
  crest: [`${media}/villages/baros/logo.webp`, ['-resize', '240x', '-quality', '85']],
  'ubi-roasted': [`${media}/products/ubi-roasted.webp`, square(640, 68)],
  'coffee-beans': [`${media}/products/coffee-beans.webp`, square(640, 68)],
  batik: [`${media}/products/batik.webp`, square(480, 62)],
  besek: [`${media}/products/besek.webp`, square(640, 68)],
  dodol: [`${media}/products/dodol.webp`, square(640, 68)],
}
function square(px: number, q: number) {
  return [
    '-resize',
    `${px}x${px}^`,
    '-gravity',
    'center',
    '-extent',
    `${px}x${px}`,
    '-quality',
    String(q),
  ]
}

const logo = (file: string, fill: string, width: number) =>
  readFileSync(file, 'utf8')
    .replace(/<\?xml[^>]*>/, '')
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<style>[\s\S]*?<\/style>/, '')
    .replace(/ id="[^"]*"/g, '')
    .replace(/class="(ink|sun)"/g, `fill="${fill}"`)
    .replace(
      '<svg ',
      `<svg class="logo" style="width:${width}px" role="img" aria-label="Desanara" `,
    )
    .replace(/\n\s*/g, ' ')
    .trim()

const tmp = mkdtempSync(join(tmpdir(), 'deck-'))
let html = readFileSync(`${here}/rapat-persiapan-seminar.template.html`, 'utf8')
html = html
  .split('{{LOGO_GREEN}}')
  .join(logo('docs/brand/desanara/logo-horizontal-green.svg', '#0F5A37', 260))
html = html
  .split('{{LOGO_WHITE}}')
  .join(logo('docs/brand/desanara/logo-horizontal-white.svg', '#FFFFFF', 260))
html = html.replace(
  '{{QR}}',
  readFileSync(`${here}/qr-desanara-app.svg`, 'utf8').replace(
    '<svg ',
    '<svg role="img" aria-label="QR ke desanara.app" ',
  ),
)
const used = [...new Set([...html.matchAll(/data-img="([a-z-]+)"/g)].map((m) => m[1]))]
const encoded = Object.fromEntries(
  used.map((name) => {
    const [src, args] = images[name] ?? []
    if (!src) throw new Error(`Unknown image "${name}" in the template`)
    const dst = join(tmp, `${name}.webp`)
    const r = spawnSync('magick', [src, ...args, dst], { stdio: 'inherit' })
    if (r.status !== 0) throw new Error(`magick failed for ${src}`)
    return [name, `data:image/webp;base64,${readFileSync(dst).toString('base64')}`]
  }),
)
html = html.replace('{{IMAGES}}', JSON.stringify(encoded))
if (html.includes('{{')) throw new Error('Unreplaced placeholder left in the deck')
writeFileSync(out, html)
console.log(`Wrote ${out} (${Math.round(html.length / 1024)} KB)`)
