'use client'

import { computeOpenStatus, localClock, type OpenStatus } from '@repo/validators'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Stamp } from './stamp'

/**
 * Computed in the browser from the weekly schedule, so a cached page still shows the right state.
 * Re-evaluates every minute. No schedule → nothing is shown (we never guess).
 */
export function OpenStatusStamp({
  hours,
  closedUntil,
  closedNote,
  timeZone,
  showDetail = true,
  size = 'md',
  initial,
}: {
  hours: unknown
  closedUntil: string | null
  closedNote: string | null
  timeZone: string
  showDetail?: boolean
  size?: 'sm' | 'md'
  /** Computed on the server so the stamp is visible before hydration (low-end phones). */
  initial: OpenStatus
}) {
  const t = useTranslations('status')
  const tDays = useTranslations('days')
  const locale = useLocale()
  const [status, setStatus] = useState<OpenStatus>(initial)

  useEffect(() => {
    const update = () => setStatus(computeOpenStatus({ hours, closedUntil, closedNote, timeZone }))
    update()
    const timer = setInterval(update, 60_000)
    return () => clearInterval(timer)
  }, [hours, closedUntil, closedNote, timeZone])

  if (status.state === 'unknown') return null

  if (status.state === 'open') {
    return (
      <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
        <Stamp tone="success" size={size} rotate={-2}>
          {t('open')}
        </Stamp>
        {showDetail ? (
          <span className="text-muted text-sm">{t('closesAt', { time: status.closesAt })}</span>
        ) : null}
      </span>
    )
  }

  if (status.state === 'temporarily_closed') {
    const until = new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
      day: 'numeric',
      month: 'long',
      timeZone,
    }).format(status.until)
    return (
      <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
        <Stamp tone="demo" size={size} rotate={-2}>
          {t('temporarilyClosed')}
        </Stamp>
        {showDetail ? (
          <span className="text-muted text-sm">
            {t('until', { date: until })}
            {status.note ? ` · ${status.note}` : ''}
          </span>
        ) : null}
      </span>
    )
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      <Stamp tone="muted" size={size} rotate={-2}>
        {t('closed')}
      </Stamp>
      {showDetail && status.opensAt ? (
        <span className="text-muted text-sm">
          {status.opensAt.day === localClock(new Date(), timeZone).day
            ? t('opensToday', { time: status.opensAt.time })
            : t('opensAt', { day: tDays(status.opensAt.day), time: status.opensAt.time })}
        </span>
      ) : null}
    </span>
  )
}
