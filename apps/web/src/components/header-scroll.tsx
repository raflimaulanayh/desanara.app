'use client'

import { useEffect, useRef } from 'react'

/** Marks the enclosing header with data-scrolled once the page leaves the top, so the capsule can narrow. */
export function HeaderScroll() {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const header = ref.current?.closest('header')
    if (!header) return
    // Two thresholds, so slow scrolling near the top does not flicker between the two styles.
    const update = () => {
      const scrolled = header.hasAttribute('data-scrolled')
      if (!scrolled && window.scrollY > 32) header.setAttribute('data-scrolled', '')
      else if (scrolled && window.scrollY < 8) header.removeAttribute('data-scrolled')
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
  return <span ref={ref} hidden />
}
