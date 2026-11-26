'use client'

import { dashboardMapFrame } from './map-frame'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef, useState } from 'react'
import { type LatLng, roundPoint, tileConfig } from '@/lib/map'

/**
 * The Leaflet map itself. Loaded only through `next/dynamic` (no SSR) from MapPicker, so Leaflet and
 * its CSS stay out of every other page's bundle. The map is created once; later prop changes only
 * move the pin or fly to a point, so typing elsewhere in the form never rebuilds it.
 */

/** SVG pin in the brand colour: no image files for the bundler to lose. */
const pinIcon = L.divIcon({
  className: '',
  html: `<svg width="34" height="44" viewBox="0 0 34 44" aria-hidden="true"><path d="M17 1C8.2 1 1 8 1 16.7 1 28.5 17 43 17 43s16-14.5 16-26.3C33 8 25.8 1 17 1z" fill="var(--accent, #387b4c)" stroke="#fff" stroke-width="2"/><circle cx="17" cy="16.5" r="6" fill="#fff"/></svg>`,
  iconSize: [34, 44],
  iconAnchor: [17, 43],
})

export interface LeafletMapProps {
  /** Where the map opens (read once). */
  view: { center: LatLng; zoom: number }
  pin: LatLng | null
  onPick: (point: LatLng) => void
  /** Changing this object flies the map to its point (e.g. after GPS). */
  focus: { point: LatLng; zoom: number } | null
  label: string
  pinLabel: string
}

export default function LeafletMap({ view, pin, onPick, focus, label, pinLabel }: LeafletMapProps) {
  const el = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const marker = useRef<L.Marker | null>(null)
  const pick = useRef(onPick)
  const [initial] = useState(view)

  useEffect(() => {
    pick.current = onPick
  })

  useEffect(() => {
    if (!el.current) return
    const { url, attribution } = tileConfig()
    const m = L.map(el.current, { scrollWheelZoom: false }).setView(
      [initial.center.lat, initial.center.lng],
      initial.zoom,
    )
    L.tileLayer(url, { maxZoom: 19, attribution }).addTo(m)
    // Plain credit instead of Leaflet's default flag icon prefix.
    m.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>')
    m.on('click', (e) => pick.current(roundPoint(e.latlng)))
    map.current = m
    return () => {
      m.remove()
      map.current = null
      marker.current = null
    }
  }, [initial])

  useEffect(() => {
    const m = map.current
    if (!m) return
    if (!pin) {
      marker.current?.remove()
      marker.current = null
      return
    }
    if (marker.current) {
      marker.current.setLatLng([pin.lat, pin.lng])
      return
    }
    const mk = L.marker([pin.lat, pin.lng], { icon: pinIcon, draggable: true, title: pinLabel })
    mk.on('dragend', () => pick.current(roundPoint(mk.getLatLng())))
    mk.addTo(m)
    marker.current = mk
  }, [pin, pinLabel])

  useEffect(() => {
    if (focus) map.current?.flyTo([focus.point.lat, focus.point.lng], focus.zoom, { duration: 0.6 })
  }, [focus])

  return <div ref={el} role="application" aria-label={label} className={dashboardMapFrame} />
}
