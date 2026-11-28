'use client'

import { computeOpenStatus, localClock, type OpenStatus } from '@repo/validators'
import { cn } from '@repo/ui/cn'
import { Clock3 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

const TONE = {
  open: 'bg-[color-mix(in_oklab,var(--success)_14%,white)] text-[color-mix(in_oklab,var(--success)_85%,black)]',
  closed: 'bg-wash-strong text-muted',
  paused:
    'bg-[color-mix(in_oklab,var(--warning)_14%,white)] text-[color-mix(in_oklab,var(--warning)_85%,black)]',
}

/**
 * Computed in the browser from the weekly schedule, so a cached page still shows the right state.
 * Re-evaluates every minute. No schedule → nothing is shown (we never guess).
 */
export function OpenStatusBadge({
  hours,
  closedUntil,
  closedNote,
  timeZone,
  showDetail = true,
  initial,
  className,
}: {
  hours: unknown
  closedUntil: string | null
  closedNote: string | null
  timeZone: string
  showDetail?: boolean
  /** Computed on the server so the badge is visible before hydration (low-end phones). */
  initial: OpenStatus
  className?: string
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

  let tone: keyof typeof TONE = 'closed'
  let label = t('closed')
  let detail: string | null = null

  if (status.state === 'open') {
    tone = 'open'
    label = t('open')
    detail = t('closesAt', { time: status.closesAt })
  } else if (status.state === 'temporarily_closed') {
    tone = 'paused'
    label = t('temporarilyClosed')
    const until = new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
      day: 'numeric',
      month: 'long',
      timeZone,
    }).format(status.until)
    detail = `${t('until', { date: until })}${status.note ? ` · ${status.note}` : ''}`
  } else if (status.opensAt) {
    detail =
      status.opensAt.day === localClock(new Date(), timeZone).day
        ? t('opensToday', { time: status.opensAt.time })
        : t('opensAt', { day: tDays(status.opensAt.day), time: status.opensAt.time })
  }

  return (
    <span className={cn('inline-flex flex-wrap items-center gap-x-2 gap-y-1', className)}>
      <span
        className={cn(
          'inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-bold',
          TONE[tone],
        )}
      >
        <span aria-hidden className="size-1.5 rounded-full bg-current" />
        {label}
      </span>
      {showDetail && detail ? (
        <span className="text-foreground inline-flex items-start gap-1.5 text-sm leading-snug font-semibold">
          <Clock3 className="text-muted mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{detail}</span>
        </span>
      ) : null}
    </span>
  )
}
