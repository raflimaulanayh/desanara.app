import { z } from 'zod'
import { clearable } from './common'

/**
 * Internal location of a business (RT/RW, map pin) and village map centres. Business locations are
 * never public (docs/architecture/security-privacy.md); public pages stop at village level.
 */

/** A generous box around Indonesia (about 6°N–11°S, 95°E–141°E): rejects swapped or zero coordinates. */
export const INDONESIA_BOUNDS = { south: -11.5, north: 6.5, west: 94.5, east: 141.5 } as const

/** Six decimals is about 10 cm: enough for a pin, and keeps stored values short. */
export const roundCoordinate = (v: number) => Math.round(v * 1e6) / 1e6

export const latitudeSchema = z
  .number()
  .min(INDONESIA_BOUNDS.south, 'Titik harus berada di Indonesia')
  .max(INDONESIA_BOUNDS.north, 'Titik harus berada di Indonesia')
  .transform(roundCoordinate)

export const longitudeSchema = z
  .number()
  .min(INDONESIA_BOUNDS.west, 'Titik harus berada di Indonesia')
  .max(INDONESIA_BOUNDS.east, 'Titik harus berada di Indonesia')
  .transform(roundCoordinate)

export function isInIndonesia(lat: number, lng: number) {
  return latitudeSchema.safeParse(lat).success && longitudeSchema.safeParse(lng).success
}

/** RT/RW as typed ("1", "01", "001") stored as three digits ("001"); "0"/"000" is not a number. */
export const rtRwSchema = z
  .string()
  .trim()
  .regex(/^\d{1,3}$/, 'Tulis angka saja, maksimal 3 digit')
  .transform((v) => v.padStart(3, '0'))
  .refine((v) => v !== '000', 'Nomor tidak boleh 0')

/** For PATCH: missing = unchanged, '' or null = cleared. */
export const clearableRtRw = clearable(rtRwSchema)

/** "RT 001 / RW 002", or the one that is known. */
export function formatRtRw(rt: string | null | undefined, rw: string | null | undefined) {
  return [rt ? `RT ${rt}` : null, rw ? `RW ${rw}` : null].filter(Boolean).join(' / ')
}

/**
 * Latitude and longitude only make sense together: both set, both cleared, or both left alone.
 * `bothOrNeither('centerLat', 'centerLng')` for other field names.
 */
export const bothOrNeither =
  <K extends string>(latKey: K, lngKey: K) =>
  (v: Partial<Record<K, number | null>>) =>
    (v[latKey] === undefined) === (v[lngKey] === undefined) &&
    (v[latKey] === null) === (v[lngKey] === null)

export const pairedCoordinates = bothOrNeither('lat', 'lng')

export const PAIRED_COORDINATES_MESSAGE = 'Isi titik peta lengkap (lintang dan bujur)'
