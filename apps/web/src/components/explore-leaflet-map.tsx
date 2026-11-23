'use client'

import { Button } from '@heroui/react'
import { cn } from '@repo/ui/cn'
import { mapTileConfig } from '@repo/ui/map-tiles'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Minus, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from '@/i18n/navigation'

type VillageMarker = {
  slug: string
  name: string
  lat: number
  lng: number
  count: number
  href: string
}

export type ExploreLeafletProps = {
  villages: VillageMarker[]
  selectedSlug?: string
  closeHref: string
}

function fitVillages(map: L.Map, villages: VillageMarker[]) {
  if (!villages.length) {
    map.setView([-7.0658, 107.6302], 11, { animate: false })
    return
  }
  map.fitBounds(L.latLngBounds(villages.map(({ lat, lng }) => L.latLng(lat, lng))), {
    maxZoom: 14,
    paddingTopLeft: [44, 44],
    paddingBottomRight: [44, 76],
    animate: false,
  })
}

function boundsKey(villages: VillageMarker[]) {
  return villages.map(({ lat, lng }) => `${lat},${lng}`).join(';')
}

export default function ExploreLeafletMap({
  villages,
  selectedSlug,
  closeHref,
}: ExploreLeafletProps) {
  const t = useTranslations('explore.map')
  const container = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const tiles = useRef<L.TileLayer | null>(null)
  const markers = useRef(new Map<string, { marker: L.Marker; target: HTMLDivElement }>())
  const previousBounds = useRef('')
  const activeVillage = useRef<VillageMarker | undefined>(undefined)
  const [initialVillages] = useState(villages)
  const [targets, setTargets] = useState<ReadonlyMap<string, HTMLDivElement>>(new Map())
  const [tilesFailed, setTilesFailed] = useState(false)
  const [zoom, setZoom] = useState<number | null>(null)

  useEffect(() => {
    const element = container.current
    if (!element) return
    const currentMarkers = markers.current
    const instance = L.map(element, {
      zoomControl: false,
      scrollWheelZoom: false,
      touchZoom: true,
      zoomSnap: 0.25,
    })
    // Safari also emits native gesture events for a pinch.
    L.DomEvent.on(element, 'gesturestart gesturechange', L.DomEvent.preventDefault)
    map.current = instance
    fitVillages(instance, initialVillages)
    previousBounds.current = boundsKey(initialVillages)
    const { url, attribution } = mapTileConfig(
      process.env.NEXT_PUBLIC_MAP_TILE_URL,
      process.env.NEXT_PUBLIC_MAP_ATTRIBUTION,
    )
    const layer = L.tileLayer(url, { attribution, maxZoom: 19 })
    let loaded = false
    layer.on('loading', () => {
      loaded = false
    })
    layer.on('tileload', () => {
      loaded = true
      setTilesFailed(false)
    })
    layer.on('tileerror', () => {
      if (!loaded) setTilesFailed(true)
    })
    layer.addTo(instance)
    tiles.current = layer
    instance.attributionControl.setPrefix(false)
    instance.on('zoomend', () => setZoom(instance.getZoom()))
    setZoom(instance.getZoom())

    const resize = new ResizeObserver(() => {
      instance.invalidateSize({ animate: false })
      const active = activeVillage.current
      if (active)
        instance.panInside([active.lat, active.lng], { padding: [48, 48], animate: false })
    })
    resize.observe(element)
    return () => {
      resize.disconnect()
      L.DomEvent.off(element, 'gesturestart gesturechange', L.DomEvent.preventDefault)
      instance.remove()
      currentMarkers.clear()
      previousBounds.current = ''
      map.current = null
      tiles.current = null
    }
  }, [initialVillages])

  useEffect(() => {
    const instance = map.current
    if (!instance) return
    activeVillage.current = villages.find(({ slug }) => slug === selectedSlug)
    const visible = new Set(villages.map(({ slug }) => slug))
    let changed = false
    for (const [slug, entry] of markers.current) {
      if (visible.has(slug)) continue
      entry.marker.remove()
      markers.current.delete(slug)
      changed = true
    }
    for (const village of villages) {
      const point = L.latLng(village.lat, village.lng)
      const existing = markers.current.get(village.slug)
      if (existing) {
        if (!existing.marker.getLatLng().equals(point)) existing.marker.setLatLng(point)
      } else {
        const target = document.createElement('div')
        target.className = 'size-full'
        const icon = L.divIcon({
          html: target,
          className: '',
          iconSize: [44, 44],
        })
        const marker = L.marker(point, { icon, keyboard: false }).addTo(instance)
        markers.current.set(village.slug, { marker, target })
        changed = true
      }
      markers.current
        .get(village.slug)
        ?.marker.setZIndexOffset(village.slug === selectedSlug ? 500 : 0)
    }

    if (changed)
      setTargets(new Map([...markers.current].map(([slug, entry]) => [slug, entry.target])))
    const bounds = boundsKey(villages)
    if (previousBounds.current !== bounds) {
      fitVillages(instance, villages)
      previousBounds.current = bounds
    }
  }, [villages, selectedSlug])

  return (
    <div className="relative size-full">
      <div
        ref={container}
        role="region"
        aria-label={t('title')}
        className="explore-leaflet relative z-0 size-full"
      />
      <div className="bg-surface absolute top-2 right-2 z-10 flex flex-col rounded-xl p-0.5 shadow-sm">
        <Button
          variant="ghost"
          size="sm"
          isIconOnly
          isDisabled={zoom === null || zoom >= 19}
          aria-label={t('zoomIn')}
          onPress={() => map.current?.zoomIn()}
          className="size-11 rounded-lg"
        >
          <Plus className="size-4" aria-hidden />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          isIconOnly
          isDisabled={zoom === null || zoom <= 0}
          aria-label={t('zoomOut')}
          onPress={() => map.current?.zoomOut()}
          className="size-11 rounded-lg"
        >
          <Minus className="size-4" aria-hidden />
        </Button>
      </div>
      {villages.map((village) => {
        const target = targets.get(village.slug)
        if (!target) return null
        const active = village.slug === selectedSlug
        return createPortal(
          <Link
            href={active ? closeHref : village.href}
            prefetch={false}
            scroll={false}
            aria-current={active ? 'true' : undefined}
            aria-label={t('marker', { village: village.name, count: village.count })}
            title={village.name}
            className="explore-map-marker group grid size-full place-items-center rounded-full focus-visible:outline-offset-0"
          >
            <span
              aria-hidden
              className={cn(
                'grid size-9 place-items-center rounded-full border text-sm leading-none font-bold tabular-nums shadow-xs motion-safe:transition-colors',
                active
                  ? 'border-accent bg-accent text-accent-foreground'
                  : 'border-accent/60 bg-surface text-accent group-hover:border-accent group-hover:bg-wash',
              )}
            >
              {village.count > 99 ? '99+' : village.count}
            </span>
          </Link>,
          target,
          village.slug,
        )
      })}
      {tilesFailed ? (
        <div
          role="status"
          className="bg-surface border-line absolute top-2 right-16 left-2 z-10 mr-auto flex max-w-sm flex-wrap items-center justify-between gap-x-2 rounded-xl border px-3 text-xs font-medium shadow-sm"
        >
          <p className="py-2">{t('tilesUnavailable')}</p>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onPress={() => tiles.current?.redraw()}
            className="text-accent font-bold"
          >
            {t('retry')}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
