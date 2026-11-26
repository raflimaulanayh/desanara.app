'use client'

import { SkeletonBlock } from '@repo/ui/components/loading-region'

import { Button } from '@heroui/react'
import { ExternalLink, LocateFixed, MapPinOff } from 'lucide-react'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import { isInIndonesia } from '@repo/validators'
import { useMemo, useState } from 'react'
import {
  type LatLng,
  PIN_ZOOM,
  VILLAGE_ZOOM,
  formatPoint,
  googleMapsUrl,
  initialView,
  readGps,
} from '@/lib/map'
import { dashboardMapFrame } from './map-frame'

/** Leaflet (~40 KB gzip + CSS) loads only when a map is on screen. Same height while loading. */
const LeafletMap = dynamic(() => import('./leaflet-map'), {
  ssr: false,
  loading: () => (
    <div aria-hidden>
      <SkeletonBlock className={dashboardMapFrame} />
    </div>
  ),
})

/**
 * Pick one point: tap the map, drag the pin, or use the phone's GPS (asked only when the button is
 * pressed). Used for a business's internal location and a village's map centre.
 */
export function MapPicker({
  value,
  onChange,
  fallbackCenter,
  allowClear = true,
  hint,
}: {
  value: LatLng | null
  onChange: (point: LatLng | null) => void
  /** Where to open without a value: the village's centre. */
  fallbackCenter: LatLng | null
  allowClear?: boolean
  hint?: string
}) {
  const t = useTranslations('map')
  // Read once: after opening, the map keeps its own view (pan, zoom, GPS fly-to).
  const [view] = useState(() => initialView(value, fallbackCenter))
  const [focus, setFocus] = useState<{ point: LatLng; zoom: number } | null>(null)
  // The village centre may arrive after the map opened on all of Indonesia (slow network): fly there
  // once it is known, unless a pin was already placed.
  const lateLat = view.zoom < VILLAGE_ZOOM && !value ? fallbackCenter?.lat : undefined
  const lateLng = view.zoom < VILLAGE_ZOOM && !value ? fallbackCenter?.lng : undefined
  const lateFocus = useMemo(
    () =>
      lateLat !== undefined && lateLng !== undefined
        ? { point: { lat: lateLat, lng: lateLng }, zoom: VILLAGE_ZOOM }
        : null,
    [lateLat, lateLng],
  )
  const [locating, setLocating] = useState(false)
  const [note, setNote] = useState<{ kind: 'error' | 'info'; text: string } | null>(null)

  function locate() {
    if (!('geolocation' in navigator)) return setNote({ kind: 'error', text: t('gps.unsupported') })
    setLocating(true)
    setNote(null)
    const done = (answer: Parameters<typeof readGps>[0]) => {
      setLocating(false)
      const r = readGps(answer)
      if (!r.ok) return setNote({ kind: 'error', text: t(`gps.${r.reason}`) })
      onChange(r.point)
      setFocus({ point: r.point, zoom: PIN_ZOOM })
      setNote(
        r.poor
          ? { kind: 'info', text: t('gps.poor', { meters: r.accuracy }) }
          : { kind: 'info', text: t('gps.ok', { meters: r.accuracy }) },
      )
    }
    navigator.geolocation.getCurrentPosition(done, done, {
      enableHighAccuracy: true,
      timeout: 15_000,
      maximumAge: 60_000,
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {hint ? <p className="text-muted text-sm">{hint}</p> : null}
      <LeafletMap
        view={view}
        pin={value}
        onPick={(p) => {
          if (!isInIndonesia(p.lat, p.lng))
            return setNote({ kind: 'error', text: t('gps.outsideMap') })
          onChange(p)
          setNote(null)
        }}
        focus={focus ?? lateFocus}
        label={t('label')}
        pinLabel={t('pin')}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" isPending={locating} onPress={locate}>
          <LocateFixed className="size-4" aria-hidden />
          {t('useMyLocation')}
        </Button>
        {value && allowClear ? (
          <Button variant="ghost" onPress={() => onChange(null)}>
            <MapPinOff className="size-4" aria-hidden />
            {t('clear')}
          </Button>
        ) : null}
      </div>
      {note ? (
        <p
          role={note.kind === 'error' ? 'alert' : 'status'}
          className={`text-sm ${note.kind === 'error' ? 'text-danger font-medium' : 'text-muted'}`}
        >
          {note.text}
        </p>
      ) : null}
      <p className="text-sm">
        {value ? (
          <>
            <span className="text-muted">{t('point')}: </span>
            <span className="tabular-nums">{formatPoint(value)}</span>
            <a
              href={googleMapsUrl(value)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent ml-2 inline-flex items-center gap-1 font-semibold hover:underline"
            >
              {t('openInMaps')}
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          </>
        ) : (
          <span className="text-muted">{t('noPoint')}</span>
        )}
      </p>
    </div>
  )
}
