// Builds the Desanara Brand Identity Guidelines board (HTML + high-res PNG + WebP).
// Run from the repo root: bun docs/brand/build-guidelines.ts
// Requires ImageMagick (`magick`) and Google Chrome on macOS (or CHROME_BIN env var).
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const brandDir = 'docs/brand/desanara'
const outHtml = `${brandDir}/brand-guidelines.html`
const outPng = `${brandDir}/brand-guidelines.png`
const outWebp = `${brandDir}/brand-guidelines.webp`
const chrome =
  process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

let svgCounter = 0

/** Inline an SVG file while namespacing every id and url(#...) so multiple SVGs never collide. */
function inlineSvg(file: string, className = '', extraStyle = '') {
  const prefix = `s${++svgCounter}`
  let svg = readFileSync(file, 'utf8')
    .replace(/<\?xml[^>]*>/g, '')
    .replace(/<title>[\s\S]*?<\/title>/g, '')
    .replace(/\n\s*/g, ' ')
    .trim()

  const ids = [...new Set([...svg.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]))]
  for (const id of ids) {
    const next = `${prefix}-${id}`
    svg = svg
      .replaceAll(`id="${id}"`, `id="${next}"`)
      .replaceAll(`url(#${id})`, `url(#${next})`)
      .replaceAll(`href="#${id}"`, `href="#${next}"`)
  }

  const attrs = [className ? `class="${className}"` : '', extraStyle ? `style="${extraStyle}"` : '']
    .filter(Boolean)
    .join(' ')

  return attrs ? svg.replace('<svg ', `<svg ${attrs} `) : svg
}

/** Resize and base64-encode a local raster image so the HTML sheet is 100% self-contained. */
const tmp = mkdtempSync(join(tmpdir(), 'brand-sheet-'))
function dataImg(src: string, resize: string, quality = 82) {
  const dst = join(tmp, `${++svgCounter}.webp`)
  const r = spawnSync('magick', [src, '-resize', resize, '-quality', String(quality), dst], {
    stdio: 'inherit',
  })
  if (r.status !== 0) throw new Error(`magick failed for ${src}`)
  return `data:image/webp;base64,${readFileSync(dst).toString('base64')}`
}

const imgs = {
  sawah: dataImg('docs/presentations/src/img/sawah-kampung-naga.webp', '900x600>', 82),
  jalan: dataImg('docs/presentations/src/img/jalan-desa-malasari.webp', '900x600>', 82),
  crest: dataImg('apps/web/public/media/seed/villages/baros/logo.webp', '160x160>', 88),
  batik: dataImg('apps/web/public/media/seed/products/batik.webp', '420x420>', 80),
  coffee: dataImg('apps/web/public/media/seed/products/coffee-beans.webp', '420x420>', 80),
  besek: dataImg('apps/web/public/media/seed/products/besek.webp', '560x420>', 82),
  ubi: dataImg('apps/web/public/media/seed/products/ubi-chips.webp', '420x420>', 80),
}

const html = `<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Desanara — Panduan Identitas Merek</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
      rel="stylesheet"
    />
    <style>
      :root {
        --green: #387b4c;
        --green-deep: #285c38;
        --green-soft: #e8f2ea;
        --leaf: #6cac4e;
        --sprout: #9dd853;
        --sun: #e3a84f;
        --clay: #c2612c;
        --wa: #0f7a3f;
        --ink: #1c1917;
        --muted: #57534e;
        --faint: #78716c;
        --paper: #fbf8f1;
        --wash: #f9f4e7;
        --wash-strong: #efe6d1;
        --line: #e5dcc8;
        --line-strong: #d4c7ac;
        --font: 'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
      }
      * {
        box-sizing: border-box;
      }
      html,
      body {
        margin: 0;
        padding: 0;
        background: #1a241e;
        font-family: var(--font);
        color: var(--ink);
        -webkit-font-smoothing: antialiased;
      }
      body {
        display: flex;
        justify-content: center;
        align-items: flex-start;
      }
      .board {
        position: relative;
        width: 1600px;
        height: 1120px;
        background: var(--paper);
        overflow: hidden;
        padding: 26px 34px 28px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      /* subtle organic botanical corner ribbons */
      .decor-tr {
        position: absolute;
        top: 0;
        right: 0;
        width: 260px;
        height: 140px;
        pointer-events: none;
        z-index: 0;
      }
      .decor-bot {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 92px;
        pointer-events: none;
        z-index: 0;
      }
      .band {
        position: relative;
        z-index: 1;
      }

      /* shared typography & surfaces */
      .pill-tag {
        display: inline-flex;
        align-items: center;
        padding: 5px 12px;
        border-radius: 999px;
        background: #ede6d6;
        color: #3f3a34;
        font: 600 12px/1 var(--font);
      }
      .card {
        background: rgba(255, 255, 255, 0.78);
        border: 1px solid var(--line);
        border-radius: 16px;
        padding: 14px 18px;
      }
      .sec-title {
        margin: 0 0 10px;
        font: 700 14.5px/1.2 var(--font);
        color: var(--ink);
        letter-spacing: -0.01em;
      }

      /* Band 1: Header Hero */
      .header-grid {
        display: grid;
        grid-template-columns: 1.48fr 0.84fr 1.06fr;
        gap: 24px;
        align-items: stretch;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--line);
      }
      .logo-zone {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        position: relative;
      }
      .logo-zone.primary {
        padding-top: 28px;
        padding-right: 12px;
        border-right: 1px solid var(--line);
      }
      .logo-zone.secondary {
        padding: 6px 12px 0;
        border-right: 1px solid var(--line);
      }
      .top-kicker {
        position: absolute;
        top: 0;
        left: 0;
        background: #ede6d6;
        color: #3f3a34;
        font: 700 12.5px/1 var(--font);
        padding: 7px 14px;
        border-radius: 999px;
      }
      .logo-zone svg {
        display: block;
        height: auto;
      }
      .story-zone {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding-left: 6px;
        padding-right: 48px;
      }
      .story-zone h1 {
        margin: 0 0 8px;
        font: 800 20px/1.2 var(--font);
        color: var(--green-deep);
        letter-spacing: -0.02em;
      }
      .story-zone p {
        margin: 0;
        font: 400 13.5px/1.55 var(--font);
        color: #3f3a34;
      }
      .story-meta {
        margin-top: 10px;
        display: flex;
        align-items: center;
        gap: 8px;
        font: 600 11.5px/1 var(--font);
        color: var(--green);
      }
      .story-meta span {
        background: var(--green-soft);
        padding: 5px 10px;
        border-radius: 999px;
      }

      /* Band 2: Variations, App Icons, Icon Sizes */
      .band-2 {
        display: grid;
        grid-template-columns: 1.82fr 0.72fr 0.88fr;
        gap: 14px;
      }
      .var-grid {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 10px;
      }
      .var-tile {
        height: 66px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10px 14px;
      }
      .var-tile svg {
        max-width: 100%;
        max-height: 36px;
        width: auto;
        height: auto;
        display: block;
      }
      .app-icons {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }
      .app-sq {
        width: 66px;
        height: 66px;
        border-radius: 16px;
        display: grid;
        place-items: center;
        overflow: hidden;
      }
      .app-sq svg {
        display: block;
      }
      .sizes-row {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 10px;
        padding-top: 2px;
      }
      .size-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }
      .size-item span {
        font: 600 11px/1 var(--font);
        color: var(--muted);
        font-variant-numeric: tabular-nums;
      }

      /* Band 3: Meaning, Palette, Browser + Media */
      .band-3 {
        display: grid;
        grid-template-columns: 1.05fr 1.24fr 1.13fr;
        gap: 14px;
      }
      .meaning-wrap {
        display: grid;
        grid-template-columns: 104px minmax(0, 1fr);
        gap: 16px;
        align-items: center;
      }
      .meaning-mark {
        display: grid;
        place-items: center;
        padding: 8px;
        background: var(--wash);
        border-radius: 14px;
        height: 140px;
      }
      .meaning-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .meaning-item {
        display: grid;
        grid-template-columns: 10px minmax(0, 1fr);
        gap: 10px;
        align-items: start;
      }
      .meaning-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-top: 5px;
      }
      .meaning-item b {
        display: block;
        font: 700 12px/1.25 var(--font);
        color: var(--ink);
      }
      .meaning-item span {
        display: block;
        font: 400 11.2px/1.35 var(--font);
        color: var(--muted);
      }

      .palette-grid {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 8px;
      }
      .swatch {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      .swatch-chip {
        width: 100%;
        height: 70px;
        border-radius: 11px;
        margin-bottom: 7px;
      }
      .swatch .hex {
        font: 800 11px/1.15 var(--font);
        color: var(--ink);
        font-variant-numeric: tabular-nums;
      }
      .swatch .name {
        font: 700 10.5px/1.2 var(--font);
        color: var(--green-deep);
        margin-top: 2px;
      }
      .swatch .role {
        font: 400 9.8px/1.25 var(--font);
        color: var(--muted);
        margin-top: 2px;
      }

      .browser-stack {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .browser-box {
        background: #f3f1eb;
        border: 1px solid var(--line-strong);
        border-radius: 11px;
        overflow: hidden;
      }
      .browser-tabs {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 7px 10px 0;
        background: #e9e4d9;
      }
      .dots {
        display: flex;
        gap: 5px;
        padding-bottom: 6px;
      }
      .dots i {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: block;
      }
      .b-tab {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        background: #fff;
        padding: 5px 12px 6px 8px;
        border-radius: 8px 8px 0 0;
        font: 600 11.5px/1 var(--font);
        color: var(--ink);
      }
      .browser-url {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 10px;
        background: #fff;
        font: 500 11.5px/1 var(--font);
        color: var(--muted);
      }
      .url-pill {
        flex: 1;
        background: #f4f2ec;
        border-radius: 999px;
        padding: 4px 10px;
        color: var(--ink);
        font: 600 11px/1.2 var(--font);
      }
      .media-strip {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 8px;
      }
      .media-tile {
        position: relative;
        height: 44px;
        border-radius: 9px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 6px 10px;
      }
      .media-tile svg {
        position: relative;
        z-index: 1;
        max-width: 100%;
        max-height: 24px;
        width: auto;
        height: auto;
      }
      .media-tile img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .media-tile.photo::after {
        content: '';
        position: absolute;
        inset: 0;
        background: rgba(20, 42, 28, 0.56);
      }

      /* Band 4: Showcase (4 Phones + Laptop + Packaging + Social) */
      .band-4 {
        flex: 1;
        min-height: 0;
        display: grid;
        grid-template-columns: 204px minmax(0, 1fr) 292px;
        gap: 18px;
        align-items: stretch;
        padding-top: 6px;
      }
      .showcase-intro {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding-top: 6px;
      }
      .showcase-intro h2 {
        margin: 0;
        font: 800 16px/1.25 var(--font);
        color: var(--ink);
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .showcase-intro p {
        margin: 0;
        font: 400 12.2px/1.5 var(--font);
        color: var(--muted);
      }
      .type-card {
        margin-top: auto;
        margin-bottom: 24px;
        background: rgba(255, 255, 255, 0.85);
        border: 1px solid var(--line);
        border-radius: 12px;
        padding: 12px 14px;
      }
      .type-card .tk {
        font: 700 10.5px/1 var(--font);
        color: var(--green);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .type-card .tv {
        font: 700 14px/1.25 var(--font);
        margin-top: 4px;
      }
      .type-card .ts {
        font: 400 11px/1.35 var(--font);
        color: var(--muted);
        margin-top: 3px;
      }

      /* 4 Phone mockups */
      .phones {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 14px;
        align-items: center;
      }
      .phone {
        height: 438px;
        background: #fff;
        border-radius: 30px;
        border: 5px solid #24211e;
        box-shadow: 0 14px 32px rgba(24, 34, 26, 0.14);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        position: relative;
      }
      .p-status {
        height: 24px;
        padding: 0 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font: 700 10px/1 var(--font);
        color: var(--ink);
        flex: none;
        position: relative;
      }
      .p-notch {
        position: absolute;
        left: 50%;
        top: 5px;
        transform: translateX(-50%);
        width: 58px;
        height: 14px;
        border-radius: 999px;
        background: #1c1917;
      }
      .p-body {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      /* Phone 1: Splash */
      .p1-top {
        padding: 14px 16px 8px;
        display: flex;
        justify-content: center;
      }
      .p1-hero {
        position: relative;
        height: 146px;
        margin: 4px 12px 0;
        border-radius: 16px;
        overflow: hidden;
      }
      .p1-hero img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .p1-copy {
        padding: 14px 16px 14px;
        text-align: center;
        display: flex;
        flex-direction: column;
        flex: 1;
      }
      .p1-copy h3 {
        margin: 0;
        font: 800 16px/1.18 var(--font);
        color: var(--green-deep);
      }
      .p1-copy p {
        margin: 6px 0 0;
        font: 400 10.5px/1.4 var(--font);
        color: var(--muted);
      }
      .p-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        height: 32px;
        border-radius: 999px;
        font: 700 11px/1 var(--font);
      }
      .p-btn.primary {
        background: var(--green);
        color: #fff;
      }
      .p-btn.wa {
        background: var(--wa);
        color: #fff;
      }
      .p-btn.ghost {
        background: var(--wash);
        color: var(--green-deep);
        border: 1px solid var(--line-strong);
      }

      /* Phone 2: Jelajah */
      .p2-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 4px 12px 6px;
      }
      .p2-search {
        margin: 0 12px 8px;
        background: var(--wash);
        border: 1px solid var(--line);
        border-radius: 999px;
        padding: 6px 10px;
        font: 500 9.5px/1 var(--font);
        color: var(--faint);
      }
      .p2-banner {
        margin: 0 12px;
        height: 82px;
        border-radius: 12px;
        position: relative;
        overflow: hidden;
        padding: 10px 12px;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .p2-banner img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .p2-banner::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, rgba(16, 40, 24, 0.82) 0%, rgba(16, 40, 24, 0.2) 100%);
      }
      .p2-banner > * {
        position: relative;
        z-index: 1;
      }
      .p2-banner b {
        font: 800 12px/1.15 var(--font);
        color: #fff;
        max-width: 12ch;
      }
      .p2-banner span {
        margin-top: 6px;
        display: inline-block;
        align-self: flex-start;
        background: var(--sprout);
        color: var(--ink);
        font: 700 8.5px/1 var(--font);
        padding: 4px 8px;
        border-radius: 999px;
      }
      .p2-cats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
        margin: 9px 12px 8px;
      }
      .p2-cat {
        background: var(--wash);
        border-radius: 8px;
        padding: 6px 4px;
        text-align: center;
        font: 600 8.5px/1.15 var(--font);
        color: var(--ink);
      }
      .p2-sec {
        margin: 2px 12px 6px;
        display: flex;
        justify-content: space-between;
        font: 700 10px/1 var(--font);
      }
      .p2-sec span {
        color: var(--green);
        font-weight: 600;
        font-size: 9px;
      }
      .p2-cards {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin: 0 12px 10px;
        flex: 1;
      }
      .p2-card {
        border: 1px solid var(--line);
        border-radius: 10px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .p2-card img {
        width: 100%;
        height: 68px;
        object-fit: cover;
        display: block;
      }
      .p2-card .pc {
        padding: 5px 6px;
      }
      .p2-card .pt {
        font: 700 9.2px/1.15 var(--font);
      }
      .p2-card .pv {
        font: 500 8px/1.2 var(--font);
        color: var(--faint);
        margin-top: 1px;
      }
      .p2-card .pp {
        font: 800 9.5px/1.2 var(--font);
        color: var(--green);
        margin-top: 3px;
      }

      /* Phone 3: Product Detail */
      .p-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 4px 12px 6px;
        font: 700 10.5px/1 var(--font);
      }
      .p3-photo {
        margin: 0 12px;
        height: 136px;
        border-radius: 12px;
        overflow: hidden;
        position: relative;
      }
      .p3-photo img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .p3-photo span {
        position: absolute;
        right: 8px;
        bottom: 8px;
        background: rgba(28, 25, 23, 0.78);
        color: #fff;
        font: 600 8.5px/1 var(--font);
        padding: 3px 7px;
        border-radius: 999px;
      }
      .p3-info {
        padding: 10px 12px 12px;
        display: flex;
        flex-direction: column;
        flex: 1;
      }
      .p3-info h4 {
        margin: 0;
        font: 800 13px/1.2 var(--font);
      }
      .p3-price {
        font: 800 13.5px/1.2 var(--font);
        color: var(--green);
        margin-top: 3px;
      }
      .p3-meta {
        margin-top: 8px;
        padding: 7px 9px;
        background: var(--wash);
        border-radius: 9px;
        font: 500 9px/1.4 var(--font);
        color: var(--muted);
      }
      .p3-meta b {
        color: var(--ink);
      }
      .p3-desc {
        margin: 8px 0 0;
        font: 400 9.2px/1.4 var(--font);
        color: var(--muted);
      }
      .p3-order {
        margin-top: auto;
        display: flex;
        gap: 6px;
        align-items: center;
      }
      .p3-qty {
        height: 32px;
        padding: 0 9px;
        border-radius: 999px;
        border: 1px solid var(--line-strong);
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font: 700 10.5px/1 var(--font);
      }

      /* Phone 4: Village Profile */
      .p4-cover {
        position: relative;
        height: 126px;
        margin: 0 12px;
        border-radius: 12px;
        overflow: hidden;
        padding: 10px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
      }
      .p4-cover > img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .p4-cover::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, rgba(16, 36, 24, 0.86) 0%, rgba(16, 36, 24, 0.1) 70%);
      }
      .p4-cover-in {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .p4-crest {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: #fff;
        padding: 4px;
        object-fit: contain;
        flex: none;
      }
      .p4-cover-in b {
        display: block;
        color: #fff;
        font: 800 12.5px/1.15 var(--font);
      }
      .p4-cover-in span {
        display: block;
        color: rgba(255, 255, 255, 0.85);
        font: 500 8.5px/1.2 var(--font);
      }
      .p4-tabs {
        display: flex;
        gap: 12px;
        margin: 10px 12px 0;
        border-bottom: 1px solid var(--line);
        font: 600 9.5px/1 var(--font);
        color: var(--faint);
      }
      .p4-tabs span {
        padding-bottom: 6px;
      }
      .p4-tabs .on {
        color: var(--green);
        border-bottom: 2px solid var(--green);
      }
      .p4-body {
        padding: 9px 12px 12px;
        display: flex;
        flex-direction: column;
        flex: 1;
      }
      .p4-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        align-self: flex-start;
        background: var(--green-soft);
        color: var(--green-deep);
        font: 700 8.5px/1 var(--font);
        padding: 4px 8px;
        border-radius: 999px;
      }
      .p4-body h4 {
        margin: 8px 0 4px;
        font: 700 11px/1.2 var(--font);
      }
      .p4-body p {
        margin: 0;
        font: 400 9.2px/1.45 var(--font);
        color: var(--muted);
      }
      .p4-tags {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
        margin-top: 10px;
      }
      .p4-tag {
        background: var(--wash);
        border-radius: 8px;
        padding: 7px 4px;
        text-align: center;
        font: 700 8.5px/1.2 var(--font);
        color: var(--green-deep);
      }

      /* Right Column: Laptop + Packaging + Social */
      .media-col {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding-top: 6px;
      }
      .media-col h2 {
        margin: 0;
        font: 800 16px/1.25 var(--font);
        color: var(--ink);
      }
      .laptop {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .laptop-screen {
        width: 266px;
        height: 162px;
        background: #1c1917;
        border-radius: 12px 12px 4px 4px;
        padding: 7px 7px 6px;
        box-shadow: 0 10px 24px rgba(24, 34, 26, 0.14);
      }
      .laptop-ui {
        width: 100%;
        height: 100%;
        background: #fff;
        border-radius: 6px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .l-nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 10px;
        border-bottom: 1px solid var(--line);
      }
      .l-nav .links {
        display: flex;
        gap: 8px;
        font: 600 7.5px/1 var(--font);
        color: var(--muted);
      }
      .l-hero {
        flex: 1;
        position: relative;
        overflow: hidden;
        padding: 12px;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .l-hero img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .l-hero::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          rgba(16, 40, 26, 0.9) 0%,
          rgba(16, 40, 26, 0.68) 58%,
          rgba(16, 40, 26, 0.16) 100%
        );
      }
      .l-hero > * {
        position: relative;
        z-index: 1;
      }
      .l-hero b {
        font: 800 13px/1.15 var(--font);
        color: #fff;
        max-width: 13ch;
      }
      .l-hero span {
        margin-top: 4px;
        font: 400 7.8px/1.35 var(--font);
        color: rgba(255, 255, 255, 0.88);
        max-width: 22ch;
      }
      .l-hero .cta {
        margin-top: 8px;
        align-self: flex-start;
        background: var(--sprout);
        color: var(--ink);
        font: 700 7.8px/1 var(--font);
        padding: 5px 10px;
        border-radius: 999px;
      }
      .laptop-base {
        width: 292px;
        height: 10px;
        background: linear-gradient(180deg, #d8d3c9 0%, #b4aea3 100%);
        border-radius: 2px 2px 10px 10px;
      }

      /* Packaging & Hang Tag */
      .merch-row {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 10px;
        padding: 8px 4px 2px;
      }
      .pouch {
        width: 96px;
        height: 122px;
        border-radius: 8px 8px 12px 12px;
        background: linear-gradient(145deg, #dec69f 0%, #c8a878 100%);
        box-shadow:
          0 8px 16px rgba(48, 36, 20, 0.16),
          inset 0 12px 0 rgba(255, 255, 255, 0.22);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 18px 10px 14px;
        position: relative;
        overflow: hidden;
      }
      .pouch::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 22px;
        background: linear-gradient(135deg, var(--green) 0%, var(--leaf) 100%);
        border-radius: 50% 50% 0 0 / 12px 12px 0 0;
      }
      .kbox {
        width: 108px;
        height: 92px;
        border-radius: 8px;
        background: linear-gradient(145deg, #e2cca7 0%, #cca978 100%);
        box-shadow:
          0 8px 16px rgba(48, 36, 20, 0.16),
          inset 0 8px 0 rgba(0, 0, 0, 0.06);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10px 12px;
        position: relative;
        overflow: hidden;
      }
      .kbox::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 10px;
        background: var(--green);
      }
      .htag {
        width: 58px;
        height: 96px;
        border-radius: 10px 10px 8px 8px;
        background: linear-gradient(180deg, #f3e8d2 0%, #e4d2b1 100%);
        border: 1px solid #cdb78e;
        box-shadow: 0 6px 14px rgba(48, 36, 20, 0.12);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 14px 6px 8px;
        position: relative;
      }
      .htag::before {
        content: '';
        position: absolute;
        top: 8px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--paper);
        border: 1.5px solid #b89f74;
      }
      .social-strip {
        margin-top: auto;
        margin-bottom: 18px;
        background: rgba(255, 255, 255, 0.86);
        border: 1px solid var(--line);
        border-radius: 12px;
        padding: 9px 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }
      .social-handle {
        display: flex;
        align-items: center;
        gap: 8px;
        font: 700 12px/1.2 var(--font);
        color: var(--ink);
      }
      .social-handle small {
        display: block;
        font: 500 10px/1.2 var(--font);
        color: var(--muted);
      }
      .social-dots {
        display: flex;
        gap: 6px;
      }
      .s-dot {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        display: grid;
        place-items: center;
        color: #fff;
        font: 800 11px/1 var(--font);
      }
    </style>
  </head>
  <body>
    <main class="board">
      <!-- Organic decorative curves -->
      <svg class="decor-tr" viewBox="0 0 260 140" fill="none" aria-hidden="true">
        <path d="M55 0C105 56 175 72 260 44V0H55Z" fill="#387B4C" opacity="0.16" />
        <path d="M120 0C160 42 205 64 260 66V0H120Z" fill="#9DD853" opacity="0.22" />
        <path d="M170 96C202 82 232 82 260 92V128C225 112 195 112 170 96Z" fill="#E3A84F" opacity="0.24" />
      </svg>
      <svg class="decor-bot" viewBox="0 0 1600 92" preserveAspectRatio="none" fill="none" aria-hidden="true">
        <path d="M0 92V40C180 12 320 64 520 56C740 46 920 14 1180 48C1360 70 1490 48 1600 32V92H0Z" fill="#387B4C" opacity="0.12" />
        <path d="M0 92V62C220 38 410 78 650 68C900 58 1120 34 1380 62C1470 72 1545 66 1600 56V92H0Z" fill="#6CAC4E" opacity="0.14" />
      </svg>

      <!-- Band 1: Header -->
      <header class="band header-grid">
        <div class="logo-zone primary">
          <span class="top-kicker">Desanara — Panduan Identitas Merek</span>
          ${inlineSvg(`${brandDir}/logo-tagline.svg`, '', 'width: 416px; max-width: 100%;')}
          <span class="pill-tag">Logo Utama (Primary — Horizontal)</span>
        </div>
        <div class="logo-zone secondary">
          ${inlineSvg(`${brandDir}/logo-vertical.svg`, '', 'width: 196px; max-width: 100%;')}
          <span class="pill-tag">Logo Sekunder (Secondary — Vertikal)</span>
        </div>
        <div class="story-zone">
          <h1>Identitas Merek Desanara</h1>
          <p>
            Platform yang menghubungkan karya, produk, dan cerita dari berbagai desa di Nusantara.
            Mendukung UMKM desa, melestarikan potensi lokal, dan membawa kekayaan alam serta budaya
            Indonesia ke pasar yang lebih luas.
          </p>
          <div class="story-meta">
            <span>desanara.app</span>
            <span>HIMA Sistem Informasi · SATU University</span>
          </div>
        </div>
      </header>

      <!-- Band 2: Variations + App Icons + Sizes -->
      <section class="band band-2">
        <div class="card">
          <h2 class="sec-title">Variasi Logo (Berbagai Latar)</h2>
          <div class="var-grid">
            <div class="var-tile" style="background: #387b4c">
              ${inlineSvg(`${brandDir}/logo-horizontal-white.svg`)}
            </div>
            <div class="var-tile" style="background: #f9f4e7; border: 1px solid #e5dcc8">
              ${inlineSvg(`${brandDir}/logo-horizontal.svg`)}
            </div>
            <div class="var-tile" style="background: #e3a84f">
              ${inlineSvg(`${brandDir}/logo-horizontal-black.svg`)}
            </div>
            <div class="var-tile" style="background: #1c1917">
              ${inlineSvg(`${brandDir}/logo-horizontal-white.svg`)}
            </div>
            <div class="var-tile" style="background: #ffffff; border: 1.5px solid #2a5e3a">
              ${inlineSvg(`${brandDir}/logo-horizontal.svg`)}
            </div>
          </div>
        </div>

        <div class="card">
          <h2 class="sec-title">Ikon Aplikasi (App Icon)</h2>
          <div class="app-icons">
            <div class="app-sq">
              ${inlineSvg(`${brandDir}/app-icon.svg`, '', 'width: 66px; height: 66px;')}
            </div>
            <div class="app-sq" style="background: #ffffff; border: 1.5px solid #d4c7ac; padding: 11px">
              ${inlineSvg(`${brandDir}/mark.svg`, '', 'height: 44px; width: auto;')}
            </div>
            <div class="app-sq" style="background: #387b4c; padding: 11px">
              ${inlineSvg(`${brandDir}/mark-white.svg`, '', 'height: 44px; width: auto;')}
            </div>
          </div>
        </div>

        <div class="card">
          <h2 class="sec-title">Ukuran Ikon (Favicon / Brand Icon)</h2>
          <div class="sizes-row">
            <div class="size-item">
              ${inlineSvg(`${brandDir}/mark.svg`, '', 'height: 48px; width: auto;')}
              <span>512×512</span>
            </div>
            <div class="size-item">
              ${inlineSvg(`${brandDir}/mark.svg`, '', 'height: 36px; width: auto;')}
              <span>192×192</span>
            </div>
            <div class="size-item">
              ${inlineSvg(`${brandDir}/mark.svg`, '', 'height: 26px; width: auto;')}
              <span>64×64</span>
            </div>
            <div class="size-item">
              ${inlineSvg(`${brandDir}/mark.svg`, '', 'height: 19px; width: auto;')}
              <span>32×32</span>
            </div>
            <div class="size-item">
              ${inlineSvg(`${brandDir}/mark.svg`, '', 'height: 13px; width: auto;')}
              <span>16×16</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Band 3: Meaning + Palette + Browser/Media -->
      <section class="band band-3">
        <div class="card">
          <h2 class="sec-title">Makna Logo</h2>
          <div class="meaning-wrap">
            <div class="meaning-mark">
              ${inlineSvg(`${brandDir}/mark.svg`, '', 'height: 98px; width: auto;')}
            </div>
            <div class="meaning-list">
              <div class="meaning-item">
                <i class="meaning-dot" style="background: #387b4c"></i>
                <div>
                  <b>Huruf “d” dari dua daun</b>
                  <span>Desa sebagai akar: karya yang tumbuh dari alam sekitar.</span>
                </div>
              </div>
              <div class="meaning-item">
                <i class="meaning-dot" style="background: #6cac4e"></i>
                <div>
                  <b>Daun tinggi</b>
                  <span>Pertumbuhan UMKM desa menuju pasar lebih luas.</span>
                </div>
              </div>
              <div class="meaning-item">
                <i class="meaning-dot" style="background: #9dd853"></i>
                <div>
                  <b>Tunas kecil</b>
                  <span>Usaha baru dan generasi muda penggerak desa.</span>
                </div>
              </div>
              <div class="meaning-item">
                <i class="meaning-dot" style="background: linear-gradient(180deg,#9dd853,#387b4c)"></i>
                <div>
                  <b>Gradasi hijau muda ke tua</b>
                  <span>Dari tunas segar sampai hasil karya yang matang.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h2 class="sec-title">Palet Warna (Resmi)</h2>
          <div class="palette-grid">
            <div class="swatch">
              <div class="swatch-chip" style="background: #387b4c"></div>
              <span class="hex">#387B4C</span>
              <span class="name">Hijau Desanara</span>
              <span class="role">Primer &amp; tombol utama</span>
            </div>
            <div class="swatch">
              <div class="swatch-chip" style="background: #6cac4e"></div>
              <span class="hex">#6CAC4E</span>
              <span class="name">Daun</span>
              <span class="role">Wordmark &amp; aksen alam</span>
            </div>
            <div class="swatch">
              <div class="swatch-chip" style="background: #9dd853"></div>
              <span class="hex">#9DD853</span>
              <span class="name">Tunas</span>
              <span class="role">Sorotan teks gelap</span>
            </div>
            <div class="swatch">
              <div class="swatch-chip" style="background: #e3a84f"></div>
              <span class="hex">#E3A84F</span>
              <span class="name">Mentari</span>
              <span class="role">Badge promo &amp; draf</span>
            </div>
            <div class="swatch">
              <div class="swatch-chip" style="background: #c2612c"></div>
              <span class="hex">#C2612C</span>
              <span class="name">Bata</span>
              <span class="role">Pelengkap &amp; sorotan</span>
            </div>
            <div class="swatch">
              <div class="swatch-chip" style="background: #f9f4e7; border: 1px solid #d4c7ac"></div>
              <span class="hex">#F9F4E7</span>
              <span class="name">Krem</span>
              <span class="role">Netral &amp; latar hangat</span>
            </div>
          </div>
        </div>

        <div class="card browser-stack">
          <div>
            <h2 class="sec-title" style="margin-bottom: 7px">Contoh Favicon di Browser</h2>
            <div class="browser-box">
              <div class="browser-tabs">
                <span class="dots">
                  <i style="background: #ff5f57"></i>
                  <i style="background: #febc2e"></i>
                  <i style="background: #28c840"></i>
                </span>
                <span class="b-tab">
                  ${inlineSvg(`${brandDir}/app-icon.svg`, '', 'width: 14px; height: 14px;')}
                  Desanara — Katalog UMKM Desa
                </span>
              </div>
              <div class="browser-url">
                <span>← → ↻</span>
                <span class="url-pill">https://desanara.app</span>
              </div>
            </div>
          </div>
          <div>
            <h2 class="sec-title" style="margin-bottom: 7px">Contoh Penerapan Warna (Media &amp; UI)</h2>
            <div class="media-strip">
              <div class="media-tile" style="background: #387b4c">
                ${inlineSvg(`${brandDir}/logo-horizontal-white.svg`)}
              </div>
              <div class="media-tile" style="background: #f9f4e7; border: 1px solid #e5dcc8">
                ${inlineSvg(`${brandDir}/logo-horizontal.svg`)}
              </div>
              <div class="media-tile" style="background: linear-gradient(135deg, #6cac4e 0%, #387b4c 100%)">
                ${inlineSvg(`${brandDir}/logo-horizontal-white.svg`)}
              </div>
              <div class="media-tile photo">
                <img src="${imgs.sawah}" alt="" />
                ${inlineSvg(`${brandDir}/logo-horizontal-white.svg`)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Band 4: Mobile UI + Desktop + Packaging -->
      <section class="band band-4">
        <div class="showcase-intro">
          <h2>Aplikasi Web &amp; Mobile Desanara</h2>
          <p>
            Antarmuka responsif untuk menjelajahi desa, melihat detail produk, dan memesan langsung
            ke pembuatnya via WhatsApp — tanpa keranjang dan tanpa akun.
          </p>
          <p>
            Setiap halaman desa membawa nama, lambang, dan warna desanya sendiri; tombol pesan
            selalu hijau WhatsApp (<b style="color: #0f7a3f">#0F7A3F</b>).
          </p>
          <div class="type-card">
            <div class="tk">Tipografi</div>
            <div class="tv">Plus Jakarta Sans</div>
            <div class="ts">UI publik &amp; dashboard · Logo memakai Montserrat (outline)</div>
          </div>
        </div>

        <!-- 4 Phone Screens -->
        <div class="phones">
          <!-- Screen 1: Cover -->
          <div class="phone">
            <div class="p-status">
              <span>9:41</span>
              <span class="p-notch"></span>
              <span>5G 100%</span>
            </div>
            <div class="p-body">
              <div class="p1-top">
                ${inlineSvg(`${brandDir}/logo-tagline.svg`, '', 'width: 148px; height: auto;')}
              </div>
              <div class="p1-hero">
                <img src="${imgs.sawah}" alt="Sawah Nusantara" />
              </div>
              <div class="p1-copy">
                <h3>Karya Desa,<br />untuk Indonesia.</h3>
                <p>
                  Temukan produk unggulan, dukung UMKM lokal, dan pesan langsung ke pembuatnya.
                </p>
                <div style="margin-top: auto; display: flex; flex-direction: column; gap: 7px">
                  <div class="p-btn primary">Jelajahi Sekarang</div>
                  <div class="p-btn ghost">Masuk Dashboard</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Screen 2: Jelajah -->
          <div class="phone">
            <div class="p-status">
              <span>9:41</span>
              <span class="p-notch"></span>
              <span>5G 100%</span>
            </div>
            <div class="p-body">
              <div class="p2-head">
                ${inlineSvg(`${brandDir}/logo-horizontal.svg`, '', 'height: 22px; width: auto;')}
                <span style="font: 700 9px/1 var(--font); color: var(--green); background: var(--green-soft); padding: 4px 7px; border-radius: 999px">ID | EN</span>
              </div>
              <div class="p2-search">Cari produk, desa, atau UMKM…</div>
              <div class="p2-banner">
                <img src="${imgs.jalan}" alt="Desa Baros" />
                <b>Jelajahi Karya Desa Nusantara</b>
                <span>Lihat Desa →</span>
              </div>
              <div class="p2-cats">
                <div class="p2-cat">Kerajinan</div>
                <div class="p2-cat">Kuliner</div>
                <div class="p2-cat">Fashion</div>
                <div class="p2-cat">Kopi</div>
                <div class="p2-cat">Olahan Ubi</div>
                <div class="p2-cat">Lainnya</div>
              </div>
              <div class="p2-sec">Produk Unggulan Desa <span>Lihat Semua →</span></div>
              <div class="p2-cards">
                <div class="p2-card">
                  <img src="${imgs.batik}" alt="Batik" />
                  <div class="pc">
                    <div class="pt">Batik Tulis</div>
                    <div class="pv">Desa Baros</div>
                    <div class="pp">Rp185.000</div>
                  </div>
                </div>
                <div class="p2-card">
                  <img src="${imgs.coffee}" alt="Kopi" />
                  <div class="pc">
                    <div class="pt">Kopi Sangrai</div>
                    <div class="pv">Desa Baros</div>
                    <div class="pp">Rp45.000</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Screen 3: Detail Produk -->
          <div class="phone">
            <div class="p-status">
              <span>9:41</span>
              <span class="p-notch"></span>
              <span>5G 100%</span>
            </div>
            <div class="p-body">
              <div class="p-bar">
                <span>←</span>
                <span>Detail Produk</span>
                <span>↗</span>
              </div>
              <div class="p3-photo">
                <img src="${imgs.besek}" alt="Besek anyaman bambu" />
                <span>1/3</span>
              </div>
              <div class="p3-info">
                <h4>Besek Anyaman Bambu</h4>
                <div class="p3-price">Rp35.000</div>
                <div class="p3-meta">
                  <div><b>Desa Baros</b> · Kec. Arjasari, Kab. Bandung</div>
                  <div>Dijual oleh <b>Anyam Lestari</b> · <span style="color: #15803d; font-weight: 700">● Buka</span></div>
                </div>
                <p class="p3-desc">
                  Anyaman bambu buatan pengrajin lokal Desa Baros, cocok untuk hantaran dan kemasan
                  makanan ramah lingkungan.
                </p>
                <div class="p3-order">
                  <span class="p3-qty">− <span>2</span> +</span>
                  <div class="p-btn wa" style="flex: 1">Pesan via WhatsApp</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Screen 4: Profil Desa -->
          <div class="phone">
            <div class="p-status">
              <span>9:41</span>
              <span class="p-notch"></span>
              <span>5G 100%</span>
            </div>
            <div class="p-body">
              <div class="p-bar">
                <span>←</span>
                <span>Profil Desa</span>
                <span>↗</span>
              </div>
              <div class="p4-cover">
                <img src="${imgs.jalan}" alt="Desa Baros" />
                <div class="p4-cover-in">
                  <img class="p4-crest" src="${imgs.crest}" alt="Lambang Desa Baros" />
                  <div>
                    <b>Desa Baros</b>
                    <span>Kec. Arjasari, Kab. Bandung</span>
                  </div>
                </div>
              </div>
              <div class="p4-tabs">
                <span class="on">Profil</span>
                <span>Produk (24)</span>
                <span>UMKM (12)</span>
              </div>
              <div class="p4-body">
                <span class="p4-badge">✓ Diverifikasi desa</span>
                <h4>Tentang Desa Baros</h4>
                <p>
                  Desa pilot Desanara dengan 78 UMKM aktif di bidang kerajinan tangan, fashion khas
                  Sunda, kopi, dan olahan ubi.
                </p>
                <div class="p4-tags">
                  <div class="p4-tag">Olahan Ubi</div>
                  <div class="p4-tag">Kerajinan</div>
                  <div class="p4-tag">Fashion</div>
                </div>
                <div class="p-btn primary" style="margin-top: auto">Lihat Produk Desa Ini →</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right column: Web Desktop + Packaging + Social -->
        <div class="media-col">
          <h2>Web &amp; Media Lainnya</h2>
          <div class="laptop">
            <div class="laptop-screen">
              <div class="laptop-ui">
                <div class="l-nav">
                  ${inlineSvg(`${brandDir}/logo-horizontal.svg`, '', 'height: 15px; width: auto;')}
                  <span class="links"><span>Jelajah</span><span>Desa</span><span>Tentang</span></span>
                </div>
                <div class="l-hero">
                  <img src="${imgs.sawah}" alt="" />
                  <b>Ragam Karya, Cerita Nusantara.</b>
                  <span>Temukan produk UMKM langsung dari desanya.</span>
                  <span class="cta">Jelajahi Produk →</span>
                </div>
              </div>
            </div>
            <div class="laptop-base"></div>
          </div>

          <div class="merch-row">
            <div class="pouch">
              ${inlineSvg(`${brandDir}/logo-vertical-black.svg`, '', 'width: 68px; height: auto;')}
            </div>
            <div class="kbox">
              ${inlineSvg(`${brandDir}/logo-horizontal-black.svg`, '', 'width: 82px; height: auto;')}
            </div>
            <div class="htag">
              ${inlineSvg(`${brandDir}/mark.svg`, '', 'height: 36px; width: auto;')}
              <span style="font: 700 7.5px/1 var(--font); color: #387b4c; letter-spacing: 0.04em">DESANARA</span>
            </div>
          </div>

          <div class="social-strip">
            <div class="social-handle">
              ${inlineSvg(`${brandDir}/app-icon.svg`, '', 'width: 30px; height: 30px;')}
              <div>
                @desanara
                <small>desanara.app</small>
              </div>
            </div>
            <div class="social-dots">
              <span class="s-dot" style="background: #387b4c">IG</span>
              <span class="s-dot" style="background: #0f7a3f">WA</span>
              <span class="s-dot" style="background: #1c1917">TT</span>
              <span class="s-dot" style="background: #6cac4e">WEB</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  </body>
</html>
`

writeFileSync(outHtml, html)
console.log(`Wrote ${outHtml} (${Math.round(html.length / 1024)} KB)`)

const shot = spawnSync(
  chrome,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=2',
    '--window-size=1600,1120',
    '--virtual-time-budget=3000',
    `--screenshot=${outPng}`,
    `file://${process.cwd()}/${outHtml}`,
  ],
  { stdio: 'pipe' },
)
if (shot.status !== 0) {
  throw new Error(`Chrome screenshot failed: ${shot.stderr?.toString()}`)
}

const webp = spawnSync('magick', [outPng, '-resize', '2000x1400>', '-quality', '88', outWebp], {
  stdio: 'inherit',
})
if (webp.status !== 0) throw new Error('magick webp conversion failed')

console.log(`Rendered ${outPng} and ${outWebp}`)
