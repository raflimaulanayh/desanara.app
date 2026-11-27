'use client'

import { useEffect, useLayoutEffect, useRef, type CSSProperties } from 'react'
import { SPLASH_SEEN_KEY } from './splash-boot'
import { SplashLogo } from './splash-logo'

const SEEN_KEY = SPLASH_SEEN_KEY
const REDUCED = '(prefers-reduced-motion: reduce)'
/** Long enough for the CSS opening (globals.css, `.about-splash`) and the hero reveal behind it. */
const TOTAL_MS = 3500

/** Terrace rings around the logo: radius and colour, inner to outer. */
const RINGS = [
  { r: 150, color: 'var(--sun)', opacity: 0.5 },
  { r: 200, color: 'var(--sun)', opacity: 0.38 },
  { r: 255, color: 'var(--sprout)', opacity: 0.3 },
  { r: 315, color: 'var(--sprout)', opacity: 0.2 },
  { r: 380, color: 'var(--sprout)', opacity: 0.12 },
]

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * Removing data-splash restarts every CSS animation when it is set again. React's Strict Mode runs the
 * effect, its cleanup and the effect again on mount, so the cleanup only schedules the removal and the
 * next run cancels it. A real unmount still removes the attribute a tick later.
 */
let pendingRemoval: number | undefined

/**
 * Intro for /tentang (PLAN-about-page §3.4): a forest-green sunrise. Terrace rings draw in, the leaves
 * grow and the white wordmark rises, then a circular opening reveals the hero. The
 * animation is CSS, so it starts with the first paint and finishes even when JavaScript is slow or
 * missing. This component handles client-side navigation, the pointer depth effect, tap or Escape to
 * skip, and cleanup.
 */
export function AboutSplash({ skipLabel }: { skipLabel: string }) {
  const ref = useRef<HTMLDivElement>(null)
  // Decided once per mount; a ref survives the Strict Mode effect re-run in development.
  const play = useRef<boolean | null>(null)

  useIsoLayoutEffect(() => {
    const root = document.documentElement
    window.clearTimeout(pendingRemoval)
    if (play.current === null) {
      let seen = true
      try {
        seen = sessionStorage.getItem(SEEN_KEY) !== null
        sessionStorage.setItem(SEEN_KEY, '1')
      } catch {
        // Storage blocked: play at most this once.
      }
      play.current = root.hasAttribute('data-splash') || (!seen && !matchMedia(REDUCED).matches)
    }
    if (!play.current) return
    // Client-side navigation: the boot script did not run, so start here, still before paint.
    if (!root.hasAttribute('data-splash')) root.setAttribute('data-splash', 'on')

    let finish = window.setTimeout(() => root.removeAttribute('data-splash'), TOTAL_MS)
    const skip = () => {
      if (root.getAttribute('data-splash') !== 'on') return
      root.setAttribute('data-splash', 'skip')
      window.clearTimeout(finish)
      finish = window.setTimeout(() => root.removeAttribute('data-splash'), 1300)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') skip()
    }
    const overlay = ref.current
    // A little depth: the logo and rings drift against each other with the pointer (mouse only).
    const onMove = (event: PointerEvent) => {
      if (!overlay || event.pointerType !== 'mouse') return
      overlay.style.setProperty('--sx', String((event.clientX / window.innerWidth) * 2 - 1))
      overlay.style.setProperty('--sy', String((event.clientY / window.innerHeight) * 2 - 1))
    }
    overlay?.addEventListener('pointerdown', skip)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(finish)
      overlay?.removeEventListener('pointerdown', skip)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('keydown', onKey)
      pendingRemoval = window.setTimeout(() => root.removeAttribute('data-splash'), 0)
    }
  }, [])

  return (
    <div ref={ref} className="about-splash" aria-hidden>
      <div className="about-splash-stage">
        <svg viewBox="0 0 800 800" className="about-splash-rings" focusable="false">
          <g>
            {RINGS.map((ring, i) => (
              <circle
                key={ring.r}
                cx={400}
                cy={400}
                r={ring.r}
                pathLength={1}
                fill="none"
                stroke={ring.color}
                strokeOpacity={ring.opacity}
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
                style={{ '--ring': i } as CSSProperties}
              />
            ))}
          </g>
        </svg>
        <SplashLogo className="about-splash-logo" />
      </div>
      <span className="about-splash-hint">{skipLabel}</span>
    </div>
  )
}
