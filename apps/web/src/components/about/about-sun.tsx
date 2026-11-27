import { cn } from '@repo/ui/cn'
import type { CSSProperties } from 'react'

const CX = 700
const CY = 700
/** Terrace rings around the sun: radius, colour token and opacity, from the core outwards. */
const RINGS = [
  { r: 300, color: 'var(--sun)', opacity: 0.55 },
  { r: 360, color: 'var(--sun)', opacity: 0.45 },
  { r: 425, color: 'var(--sun)', opacity: 0.36 },
  { r: 495, color: 'var(--leaf)', opacity: 0.3 },
  { r: 570, color: 'var(--leaf)', opacity: 0.22 },
  { r: 650, color: 'var(--leaf)', opacity: 0.15 },
]

const arc = (r: number) => `M${CX - r} ${CY}A${r} ${r} 0 0 1 ${CX + r} ${CY}`

/**
 * The hero sunrise: a two-tone sun on the horizon of the product row, ringed by thin arcs that echo
 * rice terraces and fade from sun to leaf. Pure geometry in brand tokens. The rings draw in once, from
 * left to right (globals.css, `.about-sun`); reduced motion shows them still.
 */
export function AboutSun({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1400 700"
      aria-hidden
      focusable="false"
      className={cn('about-sun pointer-events-none', className)}
    >
      <circle
        className="about-sun-core"
        cx={CX}
        cy={CY}
        r={240}
        fill="color-mix(in oklab, var(--sun) 20%, white)"
      />
      <circle
        className="about-sun-core"
        cx={CX}
        cy={CY}
        r={150}
        fill="color-mix(in oklab, var(--sun) 40%, white)"
      />
      {RINGS.map((ring, i) => (
        <path
          key={ring.r}
          className="about-sun-ring"
          style={{ '--ring': i } as CSSProperties}
          d={arc(ring.r)}
          pathLength={1}
          fill="none"
          stroke={ring.color}
          strokeOpacity={ring.opacity}
          strokeWidth={1.5}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  )
}
