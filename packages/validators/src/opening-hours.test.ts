import { describe, expect, test } from 'bun:test'
import { computeOpenStatus } from './opening-hours'

// 2026-11-02 is a Monday. Times below are WIB (UTC+7).
const wib = (iso: string) => new Date(`${iso}+07:00`)
const hours = {
  mon: [{ open: '08:00', close: '17:00' }],
  tue: [{ open: '08:00', close: '17:00' }],
  sat: [{ open: '19:00', close: '02:00' }],
}

describe('computeOpenStatus', () => {
  test('no hours → unknown', () => {
    expect(computeOpenStatus({ hours: null }).state).toBe('unknown')
    expect(computeOpenStatus({ hours: {} }).state).toBe('unknown')
  })

  test('inside a period → open with closing time', () => {
    expect(computeOpenStatus({ hours, now: wib('2026-11-02T10:00:00') })).toEqual({
      state: 'open',
      closesAt: '17:00',
    })
  })

  test('before opening → closed, opens later today', () => {
    expect(computeOpenStatus({ hours, now: wib('2026-11-02T06:30:00') })).toEqual({
      state: 'closed',
      opensAt: { day: 'mon', time: '08:00' },
    })
  })

  test('after closing → next day', () => {
    expect(computeOpenStatus({ hours, now: wib('2026-11-02T18:00:00') })).toEqual({
      state: 'closed',
      opensAt: { day: 'tue', time: '08:00' },
    })
  })

  test('past-midnight period counts on the next day', () => {
    // Sunday 01:00 WIB is inside Saturday 19:00–02:00
    expect(computeOpenStatus({ hours, now: wib('2026-11-08T01:00:00') })).toEqual({
      state: 'open',
      closesAt: '02:00',
    })
  })

  test('temporary closure wins while active', () => {
    const s = computeOpenStatus({
      hours,
      closedUntil: wib('2026-11-05T00:00:00'),
      closedNote: 'Libur panen',
      now: wib('2026-11-02T10:00:00'),
    })
    expect(s.state).toBe('temporarily_closed')
  })

  test('expired temporary closure is ignored', () => {
    expect(
      computeOpenStatus({
        hours,
        closedUntil: wib('2026-11-01T00:00:00'),
        now: wib('2026-11-02T10:00:00'),
      }).state,
    ).toBe('open')
  })
})
