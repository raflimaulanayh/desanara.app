/// <reference types="bun" />
import { describe, expect, test } from 'bun:test'
import {
  INDONESIA_VIEW,
  PIN_ZOOM,
  VILLAGE_ZOOM,
  formatPoint,
  googleMapsUrl,
  initialView,
  readGps,
} from './map'

const baros = { lat: -7.065772, lng: 107.630174 }

describe('initialView', () => {
  test('pin first, then the village, then all of Indonesia', () => {
    const pin = { lat: -7.07, lng: 107.63 }
    expect(initialView(pin, baros)).toEqual({ center: pin, zoom: PIN_ZOOM })
    expect(initialView(null, baros)).toEqual({ center: baros, zoom: VILLAGE_ZOOM })
    expect(initialView(null, null)).toEqual(INDONESIA_VIEW)
  })
})

describe('readGps', () => {
  const at = (latitude: number, longitude: number, accuracy: number) => ({
    coords: { latitude, longitude, accuracy },
  })

  test('a good fix is rounded and accepted', () => {
    expect(readGps(at(-7.0657722641, 107.6301740057, 12))).toEqual({
      ok: true,
      point: baros,
      accuracy: 12,
      poor: false,
    })
  })

  test('a fix from cell towers is flagged so the pin gets checked', () => {
    expect(readGps(at(-7.06, 107.63, 850))).toMatchObject({ ok: true, poor: true, accuracy: 850 })
  })

  test('outside Indonesia (VPN, emulator) is refused', () => {
    expect(readGps(at(51.5, -0.12, 10))).toEqual({ ok: false, reason: 'outside' })
  })

  test('browser errors become reasons the form can explain', () => {
    expect(readGps({ code: 1 })).toEqual({ ok: false, reason: 'denied' })
    expect(readGps({ code: 2 })).toEqual({ ok: false, reason: 'unavailable' })
    expect(readGps({ code: 3 })).toEqual({ ok: false, reason: 'timeout' })
  })
})

test('text and Google Maps link for the team', () => {
  expect(formatPoint(baros)).toBe('-7.065772, 107.630174')
  expect(googleMapsUrl(baros)).toBe(
    'https://www.google.com/maps/search/?api=1&query=-7.065772,107.630174',
  )
})
