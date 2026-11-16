import { isInIndonesia, roundCoordinate } from '@repo/validators'

/** Pure map helpers (no Leaflet, no DOM), unit-tested. */

export interface LatLng {
  lat: number
  lng: number
}

/** Whole Indonesia, for a village without any known point yet. */
export const INDONESIA_VIEW = { center: { lat: -2.5, lng: 118 }, zoom: 5 } as const
/** Close enough to recognise streets and houses when placing a business pin. */
export const VILLAGE_ZOOM = 15
export const PIN_ZOOM = 17

/**
 * Tile server. OpenStreetMap's own tiles are fine for a low-traffic dashboard (their usage policy
 * asks heavy users to move); set NEXT_PUBLIC_MAP_TILE_URL + NEXT_PUBLIC_MAP_ATTRIBUTION to switch to
 * another provider (e.g. MapTiler, Stadia) without code changes.
 */
export function tileConfig() {
  return {
    url: process.env.NEXT_PUBLIC_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ||
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }
}

export const roundPoint = (p: LatLng): LatLng => ({
  lat: roundCoordinate(p.lat),
  lng: roundCoordinate(p.lng),
})

/** Where the map opens: the pin if there is one, else the village, else all of Indonesia. */
export function initialView(pin: LatLng | null, village: LatLng | null) {
  if (pin) return { center: pin, zoom: PIN_ZOOM }
  if (village) return { center: village, zoom: VILLAGE_ZOOM }
  return INDONESIA_VIEW
}

export const formatPoint = (p: LatLng) => `${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`

/** "Petunjuk arah" for the team: opens Google Maps (app on phones) at the point. */
export const googleMapsUrl = (p: LatLng) =>
  `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`

/** Above this the phone guessed from Wi-Fi or cell towers: ask to check the pin. */
export const POOR_ACCURACY_METERS = 100

export type GpsResult =
  | { ok: true; point: LatLng; accuracy: number; poor: boolean }
  | { ok: false; reason: 'denied' | 'unavailable' | 'timeout' | 'outside' | 'unsupported' }

/** Turns a browser geolocation answer into what the form shows. */
export function readGps(
  answer: { coords: { latitude: number; longitude: number; accuracy: number } } | { code: number },
): GpsResult {
  if ('code' in answer) {
    // GeolocationPositionError: 1 PERMISSION_DENIED, 2 POSITION_UNAVAILABLE, 3 TIMEOUT
    return {
      ok: false,
      reason: answer.code === 1 ? 'denied' : answer.code === 3 ? 'timeout' : 'unavailable',
    }
  }
  const { latitude, longitude, accuracy } = answer.coords
  if (!isInIndonesia(latitude, longitude)) return { ok: false, reason: 'outside' }
  return {
    ok: true,
    point: roundPoint({ lat: latitude, lng: longitude }),
    accuracy: Math.round(accuracy),
    poor: accuracy > POOR_ACCURACY_METERS,
  }
}
