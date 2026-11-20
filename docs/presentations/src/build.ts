// Builds docs/presentations/rapat-persiapan-seminar.html from the template in this folder.
// Run from the repo root: bun docs/presentations/src/build.ts   (needs ImageMagick `magick` on PATH)
// Logos come from docs/brand/desanara/, photos from src/img/ and apps/web/public/media/; rebuild after either changes.
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const here = 'docs/presentations/src'
const out = 'docs/presentations/rapat-persiapan-seminar.html'
const media = 'apps/web/public/media/seed'

// name -> [source, ImageMagick resize arguments]
const images: Record<string, [string, string[]]> = {
  // rural photos are pre-cropped in src/img (credits in src/img/CREDITS.md)
  sawah: [`${here}/img/sawah-kampung-naga.webp`, []],
  'jalan-desa': [`${here}/img/jalan-desa-malasari.webp`, []],
  'brand-guidelines': ['docs/brand/desanara/brand-guidelines.webp', []],
  crest: [`${media}/villages/baros/logo.webp`, ['-resize', '240x', '-quality', '85']],
  'ubi-roasted': [`${media}/products/ubi-roasted.webp`, fit(640, 72)],
  'ubi-chips': [`${media}/products/ubi-chips.webp`, fit(640, 72)],
  'coffee-beans': [`${media}/products/coffee-beans.webp`, fit(640, 72)],
  batik: [`${media}/products/batik.webp`, fit(640, 68)],
  'batik-green': [`${media}/products/batik-green.webp`, fit(640, 72)],
  besek: [`${media}/products/besek.webp`, fit(640, 72)],
  dodol: [`${media}/products/dodol.webp`, fit(640, 72)],
  spoons: [`${media}/products/spoons.webp`, fit(640, 72)],
  bandrek: [`${media}/products/bandrek.webp`, fit(640, 72)],
  lamp: [`${media}/products/lamp.webp`, fit(640, 72)],
}
function fit(px: number, q: number) {
  return ['-resize', `${px}x${px}>`, '-quality', String(q)]
}

// Colour logos keep their ids (gradients and clip paths point at them); one-colour logos drop them so a logo
// used twice in the deck does not repeat ids.
const logo = (file: string, width: number, keepIds = false) => {
  let svg = readFileSync(file, 'utf8')
    .replace(/<\?xml[^>]*>/, '')
    .replace(/<title>[\s\S]*?<\/title>/, '')
  if (!keepIds) svg = svg.replace(/ id="[^"]*"/g, '')
  return svg
    .replace(/ role="img"| aria-label="[^"]*"/g, '')
    .replace(
      '<svg ',
      `<svg class="logo" style="width:${width}px" role="img" aria-label="Desanara" `,
    )
    .replace(/\n\s*/g, ' ')
    .trim()
}

const tmp = mkdtempSync(join(tmpdir(), 'deck-'))
let html = readFileSync(`${here}/rapat-persiapan-seminar.template.html`, 'utf8')
html = html.split('{{LOGO_GREEN}}').join(logo('docs/brand/desanara/logo-horizontal.svg', 250, true))
html = html.split('{{LOGO_WHITE}}').join(logo('docs/brand/desanara/logo-horizontal-white.svg', 250))
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
