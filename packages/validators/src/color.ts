/** Small, dependency-free colour helpers (WCAG 2.x relative luminance and contrast). */

export const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

export function hexToRgb(hex: string): [number, number, number] {
  if (!HEX_COLOR.test(hex)) throw new Error(`Invalid hex colour: ${hex}`)
  const n = Number.parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x) as [
    number,
    number,
  ]
  return (hi + 0.05) / (lo + 0.05)
}

export const WHITE = '#ffffff'
export const INK = '#111827'

/** Text colour to put on top of `background`: white or near-black, whichever reads better. */
export function readableForeground(background: string): string {
  return contrastRatio(background, WHITE) >= contrastRatio(background, INK) ? WHITE : INK
}
