import { z } from 'zod'

/**
 * Weekly opening hours of a business + "temporarily closed" override.
 * The open/closed status is computed, never toggled by hand, so it stays right when owners forget.
 * A business without hours shows no status ("unknown").
 */

export const weekdays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
export type Weekday = (typeof weekdays)[number]

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/

export const openingPeriodSchema = z
  .object({ open: z.string().regex(HHMM), close: z.string().regex(HHMM) })
  .refine((p) => p.open !== p.close, { message: 'Jam buka dan tutup tidak boleh sama' })

/** Periods per weekday; a missing or empty day = closed that day. `close < open` means past midnight. */
export const openingHoursSchema = z.partialRecord(
  z.enum(weekdays),
  z.array(openingPeriodSchema).max(3),
)

export type OpeningHours = z.infer<typeof openingHoursSchema>

export type OpenStatus =
  | { state: 'unknown' }
  | { state: 'open'; closesAt: string }
  | { state: 'closed'; opensAt: { day: Weekday; time: string } | null }
  | { state: 'temporarily_closed'; until: Date; note: string | null }

const minutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number) as [number, number]
  return h * 60 + m
}

/** Weekday and minutes-of-day of `now` in an IANA time zone (villages default to Asia/Jakarta). */
export function localClock(now: Date, timeZone: string): { day: Weekday; minute: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  const day = get('weekday').slice(0, 3).toLowerCase() as Weekday
  return { day, minute: Number(get('hour')) * 60 + Number(get('minute')) }
}

export function computeOpenStatus(input: {
  hours: unknown
  closedUntil?: Date | string | null
  closedNote?: string | null
  now?: Date
  timeZone?: string
}): OpenStatus {
  const now = input.now ?? new Date()
  if (input.closedUntil) {
    const until = new Date(input.closedUntil)
    if (until.getTime() > now.getTime())
      return { state: 'temporarily_closed', until, note: input.closedNote ?? null }
  }

  const parsed = openingHoursSchema.safeParse(input.hours)
  if (!parsed.success) return { state: 'unknown' }
  const hours = parsed.data
  if (!weekdays.some((d) => (hours[d]?.length ?? 0) > 0)) return { state: 'unknown' }

  const { day, minute } = localClock(now, input.timeZone ?? 'Asia/Jakarta')
  const todayIndex = weekdays.indexOf(day)
  const yesterday = weekdays[(todayIndex + 6) % 7]!

  for (const p of hours[day] ?? []) {
    const o = minutes(p.open)
    const c = minutes(p.close)
    if (c > o ? minute >= o && minute < c : minute >= o) return { state: 'open', closesAt: p.close }
  }
  for (const p of hours[yesterday] ?? []) {
    if (minutes(p.close) < minutes(p.open) && minute < minutes(p.close))
      return { state: 'open', closesAt: p.close }
  }

  // Next opening: later today, then the following days.
  const later = (hours[day] ?? [])
    .map((p) => p.open)
    .filter((o) => minutes(o) > minute)
    .sort()[0]
  if (later) return { state: 'closed', opensAt: { day, time: later } }
  for (let i = 1; i <= 7; i++) {
    const d = weekdays[(todayIndex + i) % 7]!
    const first = (hours[d] ?? []).map((p) => p.open).sort()[0]
    if (first) return { state: 'closed', opensAt: { day: d, time: first } }
  }
  return { state: 'closed', opensAt: null }
}
