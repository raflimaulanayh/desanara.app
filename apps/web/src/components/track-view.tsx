'use client'

import { useLocale } from 'next-intl'
import { useEffect } from 'react'
import { track } from '@/lib/track'

/** Records one view per mount (pages are cached, so this runs in the browser). */
export function TrackView({ event }: { event: Parameters<typeof track>[0] }) {
  const locale = useLocale()
  const key = JSON.stringify(event)
  useEffect(() => {
    track({ ...(JSON.parse(key) as Parameters<typeof track>[0]), locale })
  }, [key, locale])
  return null
}
