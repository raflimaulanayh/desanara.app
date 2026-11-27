'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

/**
 * Starts every new page at the top. Back and forward keep the position the browser restores, links to
 * a section (#hash) land on that section, and query changes on the same page (catalogue filters) do
 * not move the page. In-page section jumps are smooth through `scroll-behavior` in globals.css.
 */
export function ScrollManager() {
  const pathname = usePathname()
  const first = useRef(true)
  const historyMove = useRef(false)

  useEffect(() => {
    const onPop = () => {
      historyMove.current = true
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (historyMove.current) {
      historyMove.current = false
      return
    }
    if (window.location.hash) return
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null
}
