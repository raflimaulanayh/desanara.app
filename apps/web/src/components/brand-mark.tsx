/**
 * Partner logos (HIMA SI, SATU University) are supplied as white mono artwork. On the nota they are
 * printed in the book's navy ink through a CSS mask — a mono recolour of the official shape,
 * never a redrawing. Sources and provenance: apps/web/public/brand/*.webp(.json).
 */
const MARKS = {
  himasif: { src: '/brand/himasif.webp', label: 'HIMA Sistem Informasi', ratio: 3553 / 935 },
  satu: { src: '/brand/satu-university.webp', label: 'SATU University', ratio: 492 / 236 },
} as const

export function BrandMark({ mark, height = 36 }: { mark: keyof typeof MARKS; height?: number }) {
  const m = MARKS[mark]
  return (
    <span
      role="img"
      aria-label={m.label}
      className="bg-nota-ink inline-block shrink-0"
      style={{
        height,
        width: Math.round(height * m.ratio),
        maskImage: `url(${m.src})`,
        WebkitMaskImage: `url(${m.src})`,
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'left center',
        WebkitMaskPosition: 'left center',
      }}
    />
  )
}
