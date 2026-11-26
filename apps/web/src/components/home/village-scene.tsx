import { cn } from '@repo/ui/cn'

/**
 * Village landscape for the home hero: rising sun, ridges, terraced hills, a house and two trees, drawn
 * as flat vector shapes in the brand palette (docs/brand/README.md); the two far ridges are Daun and Tunas
 * pre-mixed with the cream background, so they stay opaque and the sun sets cleanly behind them. Inline so it costs no request and
 * stays sharp on any screen. The bottom wave uses `currentColor` so it melts into the section background.
 * Motion (globals.css, `.scene-*`) runs once on load and is skipped for prefers-reduced-motion.
 */
export function VillageScene({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 40 400 180"
      aria-hidden
      focusable="false"
      className={cn('block h-auto w-full', className)}
    >
      <g className="scene-sun">
        <circle cx="252" cy="92" r="46" fill="#e3a84f" opacity="0.18" />
        <circle cx="252" cy="92" r="30" fill="#e3a84f" opacity="0.9" />
      </g>

      <path
        className="scene-rise"
        style={{ animationDelay: '0ms' }}
        d="M0 128C40 104 80 92 120 100s70-20 116-26 84 22 124 18c20-2 32-6 40-8v136H0Z"
        fill="#cfdeb9"
      />
      <path
        className="scene-rise"
        style={{ animationDelay: '60ms' }}
        d="M0 150c60-30 120-32 180-18s120-20 220-12v100H0Z"
        fill="#b4e076"
      />

      <g className="scene-rise" style={{ animationDelay: '120ms' }}>
        <path d="M0 168c50-28 120-32 190-8 30 10 50 22 70 60H0Z" fill="#6cac4e" />
        <g fill="none" stroke="#9dd950" strokeWidth="2.5" strokeLinecap="round" opacity="0.85">
          <path d="M0 179c50-26 118-30 182-9" />
          <path d="M0 191c52-24 112-28 172-9" />
          <path d="M0 203c54-22 106-26 160-9" />
        </g>
        <g>
          <rect x="24.5" y="150" width="3" height="12" rx="1" fill="#387b4c" />
          <circle cx="26" cy="146" r="11" fill="#387b4c" />
          <rect x="46.5" y="148" width="3" height="10" rx="1" fill="#387b4c" />
          <circle cx="48" cy="145" r="8" fill="#387b4c" opacity="0.85" />
        </g>
      </g>

      <g className="scene-rise" style={{ animationDelay: '180ms' }}>
        <path d="M150 220c50-50 120-70 180-66 30 2 54 8 70 12v54Z" fill="#387b4c" />
        <g fill="none" stroke="#6cac4e" strokeWidth="2.5" strokeLinecap="round" opacity="0.9">
          <path d="M196 196c44-28 104-36 204-20" />
          <path d="M214 210c42-24 106-32 186-20" />
        </g>
        <g>
          <rect x="305" y="137" width="28" height="19" fill="#f9f4e7" />
          <path d="M299 139l20-16 20 16Z" fill="#c2612c" />
          <rect x="315.5" y="145" width="7" height="11" rx="1" fill="#387b4c" />
        </g>
      </g>

      {/* Runs 4 units past the viewBox so no hill pixel shows under the wave edge. */}
      <path d="M0 224v-18c70-10 130 8 200 2s130-16 200-8v24Z" fill="currentColor" />
    </svg>
  )
}
