import { cn } from '@repo/ui/cn'

/**
 * "Cap desa": the round rubber stamp every village office uses. Village name and region run around
 * the ring; the village logo (or initials) sits in the centre. Drawn in the current ink (`currentColor`).
 * Geometry only — the logo is the village's own raster.
 */
export function VillageSeal({
  name,
  region,
  logoUrl,
  size = 160,
  rotate = -6,
  className,
  title,
}: {
  name: string
  region?: string | null
  logoUrl?: string | null
  size?: number
  rotate?: number
  className?: string
  title?: string
}) {
  const ring = `${name} · ${region ?? 'Indonesia'} · `.toUpperCase()
  const initials = name
    .replace(/^desa\s+/i, '')
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const id = `seal-${name.replace(/\W+/g, '-').toLowerCase()}`
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label={title ?? name}
      className={cn('shrink-0 mix-blend-multiply', className)}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <defs>
        <path id={`${id}-ring`} d="M 100,100 m -74,0 a 74,74 0 1,1 148,0 a 74,74 0 1,1 -148,0" />
        <clipPath id={`${id}-clip`}>
          <circle cx="100" cy="100" r="52" />
        </clipPath>
        {/* Re-ink the logo: keep its shape (alpha), print it in the stamp's colour. */}
        <filter id={`${id}-ink`} colorInterpolationFilters="sRGB">
          <feFlood floodColor="currentColor" result="ink" />
          <feComposite in="ink" in2="SourceAlpha" operator="in" />
        </filter>
      </defs>
      <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="5" />
      <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="58" fill="none" stroke="currentColor" strokeWidth="2" />
      <text
        fill="currentColor"
        fontFamily="var(--font-barlow-condensed), sans-serif"
        fontWeight="700"
        fontSize="17"
        letterSpacing="1.5"
      >
        <textPath href={`#${id}-ring`} textLength="458" lengthAdjust="spacing">
          {ring}
        </textPath>
      </text>
      {logoUrl ? (
        <image
          href={logoUrl}
          x="48"
          y="48"
          width="104"
          height="104"
          preserveAspectRatio="xMidYMid meet"
          clipPath={`url(#${id}-clip)`}
          filter={`url(#${id}-ink)`}
        />
      ) : (
        <text
          x="100"
          y="100"
          textAnchor="middle"
          dominantBaseline="central"
          fill="currentColor"
          fontFamily="var(--font-barlow-condensed), sans-serif"
          fontWeight="700"
          fontSize="46"
        >
          {initials}
        </text>
      )}
    </svg>
  )
}
