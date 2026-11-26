'use client'

import { Button } from '@heroui/react'
import { mapTileConfig } from '@repo/ui/map-tiles'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Minus, Plus, Store } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { Link } from '@/i18n/navigation'
import {
  groupNearbyVillages,
  MAP_MAX_ZOOM,
  MAP_ZOOM_STEP,
  pinFanOffsets,
  villageSplitZoom,
  type MapCoordinates,
} from '@/lib/catalogue-map'

type PinLink = { name: string; href: string }

type MapMarker = PinLink &
  MapCoordinates & {
    slug: string
  }

type VillageMarker = MapMarker & { businessCount: number }

export type ExploreLeafletProps = {
  villages: VillageMarker[]
  selectedSlug?: string
  businessPoints: MapMarker[]
}

type SafariGesture = Event & { scale: number; clientX: number; clientY: number }
const businessZoom = 15

function projectVillage({ lat, lng }: VillageMarker, zoom: number) {
  return L.CRS.EPSG3857.latLngToPoint(L.latLng(lat, lng), zoom)
}

function revealPins(map: L.Map, center: L.LatLng, zoom: number) {
  map.stop()
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    map.setView(center, zoom, { animate: false })
  } else {
    map.flyTo(center, zoom, { duration: 0.35 })
  }
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

function fitSelectedVillage(
  map: L.Map,
  village: VillageMarker,
  businesses: MapMarker[],
  animate: boolean,
) {
  const bounds = L.latLngBounds(
    (businesses.length ? businesses : [village]).map(({ lat, lng }) => L.latLng(lat, lng)),
  )
  const center = bounds.getCenter()
  const zoom = businesses.length
    ? Math.min(18, map.getBoundsZoom(bounds, false, L.point(88, 120)))
    : businessZoom
  if (animate) revealPins(map, center, zoom)
  else map.setView(center, zoom, { animate: false })
  return center
}

function boundsKey(points: MapCoordinates[]) {
  return points.map(({ lat, lng }) => `${lat},${lng}`).join(';')
}

export default function ExploreLeafletMap({
  villages,
  selectedSlug,
  businessPoints,
}: ExploreLeafletProps) {
  const t = useTranslations('explore.map')
  const container = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const tiles = useRef<L.TileLayer | null>(null)
  const markers = useRef(new Map<string, { marker: L.Marker; target: HTMLDivElement }>())
  const previousBounds = useRef('')
  const activeView = useRef<{ key: string; center: L.LatLng } | undefined>(undefined)
  const [initialView] = useState({ villages, selectedSlug, businessPoints })
  const [targets, setTargets] = useState<ReadonlyMap<string, HTMLDivElement>>(new Map())
  const [tilesFailed, setTilesFailed] = useState(false)
  const [zoom, setZoom] = useState<number | null>(null)
  const [expandedGroup, setExpandedGroup] = useState<string>()
  const pins = useMemo(() => {
    if (zoom === null) return []
    return groupNearbyVillages(
      villages.filter(({ slug }) => slug !== selectedSlug),
      (village) => projectVillage(village, zoom),
    )
  }, [selectedSlug, villages, zoom])
  const selectedVillage = villages.find(({ slug }) => slug === selectedSlug)

  useEffect(() => {
    const element = container.current
    if (!element) return
    const currentMarkers = markers.current
    const instance = L.map(element, {
      zoomControl: false,
      scrollWheelZoom: true,
      touchZoom: true,
      zoomSnap: MAP_ZOOM_STEP,
    })
    // Desktop Safari reports trackpad pinch as a gesture. Touchscreens use Leaflet's touch handler.
    let gestureZoom: number | undefined
    function startGesture(event: Event) {
      event.preventDefault()
      gestureZoom = instance.getZoom()
    }
    function changeGesture(event: Event) {
      event.preventDefault()
      if (navigator.maxTouchPoints > 0) return
      const gesture = event as SafariGesture
      if (!(gesture.scale > 0)) return
      const rect = instance.getContainer().getBoundingClientRect()
      const point =
        Number.isFinite(gesture.clientX) && Number.isFinite(gesture.clientY)
          ? L.point(gesture.clientX - rect.left, gesture.clientY - rect.top)
          : instance.getSize().divideBy(2)
      instance.setZoomAround(
        point,
        (gestureZoom ?? instance.getZoom()) + Math.log2(gesture.scale),
        { animate: false },
      )
    }
    element.addEventListener('gesturestart', startGesture, { passive: false })
    element.addEventListener('gesturechange', changeGesture, { passive: false })
    map.current = instance
    const initialVillage = initialView.villages.find(
      ({ slug }) => slug === initialView.selectedSlug,
    )
    if (initialVillage) {
      const center = fitSelectedVillage(instance, initialVillage, initialView.businessPoints, false)
      activeView.current = {
        key: `${initialVillage.slug}:${boundsKey(initialView.businessPoints)}`,
        center,
      }
    } else {
      fitVillages(instance, initialView.villages)
    }
    previousBounds.current = boundsKey(initialView.villages)
    const { url, attribution } = mapTileConfig(
      process.env.NEXT_PUBLIC_MAP_TILE_URL,
      process.env.NEXT_PUBLIC_MAP_ATTRIBUTION,
    )
    const layer = L.tileLayer(url, { attribution, maxZoom: MAP_MAX_ZOOM })
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
    instance.on('zoomend', () => {
      setZoom(instance.getZoom())
      if (instance.getZoom() < MAP_MAX_ZOOM) setExpandedGroup(undefined)
    })
    setZoom(instance.getZoom())

    const resize = new ResizeObserver(() => {
      const size = instance.getSize()
      if (size.x === element.clientWidth && size.y === element.clientHeight) return
      instance.invalidateSize({ animate: false })
      const center = activeView.current?.center
      if (center) instance.panInside(center, { padding: [48, 48], animate: false })
    })
    resize.observe(element)
    return () => {
      resize.disconnect()
      element.removeEventListener('gesturestart', startGesture)
      element.removeEventListener('gesturechange', changeGesture)
      instance.remove()
      currentMarkers.clear()
      previousBounds.current = ''
      map.current = null
      tiles.current = null
    }
  }, [initialView])

  useEffect(() => {
    const instance = map.current
    if (!instance) return
    if (!selectedVillage) {
      activeView.current = undefined
      return
    }
    const key = `${selectedVillage.slug}:${boundsKey(businessPoints)}`
    if (key === activeView.current?.key) return

    instance.invalidateSize({ animate: false })
    activeView.current = {
      key,
      center: fitSelectedVillage(instance, selectedVillage, businessPoints, true),
    }
  }, [selectedVillage, businessPoints])

  useEffect(() => {
    const instance = map.current
    if (!instance) return
    const positions = [...pins.map(({ anchor }) => anchor), ...businessPoints]
    const visible = new Set(positions.map(({ slug }) => slug))
    let changed = false
    for (const [slug, entry] of markers.current) {
      if (visible.has(slug)) continue
      entry.marker.remove()
      markers.current.delete(slug)
      changed = true
    }
    for (const village of positions) {
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
        ?.marker.setZIndexOffset(village.slug.startsWith('business:') ? 500 : 0)
    }

    if (changed)
      setTargets(new Map([...markers.current].map(([slug, entry]) => [slug, entry.target])))
    const bounds = boundsKey(villages)
    if (previousBounds.current !== bounds) {
      if (!selectedVillage) fitVillages(instance, villages)
      previousBounds.current = bounds
    }
  }, [pins, villages, selectedVillage, businessPoints])

  return (
    <div className="relative size-full">
      <div
        ref={container}
        role="region"
        aria-label={t('title')}
        className="explore-leaflet relative z-0 size-full"
      />
      <div className="bg-surface absolute top-2 right-2 z-10 flex flex-col rounded-(--radius) p-0.5 shadow-sm">
        <Button
          variant="ghost"
          size="sm"
          isIconOnly
          isDisabled={zoom === null || zoom >= MAP_MAX_ZOOM}
          aria-label={t('zoomIn')}
          onPress={() => map.current?.zoomIn()}
          className="size-11 rounded-(--radius-compact)"
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
          className="size-11 rounded-(--radius-compact)"
        >
          <Minus className="size-4" aria-hidden />
        </Button>
      </div>
      {pins.map(({ anchor: village, members }) => {
        const target = targets.get(village.slug)
        if (!target) return null
        if (members.length > 1) {
          const expanded = zoom === MAP_MAX_ZOOM && expandedGroup === village.slug
          return createPortal(
            <>
              <Button
                type="button"
                size="sm"
                variant="primary"
                aria-label={t(expanded ? 'collapseGroup' : 'zoomGroup', { count: members.length })}
                aria-expanded={expanded}
                onPress={({ pointerType }) => {
                  const instance = map.current
                  if (!instance) return
                  const currentZoom = instance.getZoom()
                  if (currentZoom === MAP_MAX_ZOOM) {
                    setExpandedGroup(expanded ? undefined : village.slug)
                    return
                  }
                  const bounds = L.latLngBounds(members.map(({ lat, lng }) => L.latLng(lat, lng)))
                  const nextZoom = villageSplitZoom(members, currentZoom, projectVillage)
                  if (nextZoom === MAP_MAX_ZOOM) setExpandedGroup(village.slug)
                  if (pointerType === 'keyboard') {
                    instance.getContainer().focus({ preventScroll: true })
                  }
                  revealPins(instance, bounds.getCenter(), nextZoom)
                }}
                className="relative z-20 grid size-11 min-w-0 cursor-pointer content-center gap-0 rounded-full border-2 border-white p-0 leading-none tabular-nums shadow-sm"
              >
                <span aria-hidden className="text-sm leading-none font-bold">
                  {members.length}
                </span>
                <span aria-hidden className="text-[0.5625rem] leading-tight font-semibold">
                  {t('clusterLabel')}
                </span>
              </Button>
              {expanded ? <PinFan pins={members} /> : null}
            </>,
            target,
            village.slug,
          )
        }
        return createPortal(
          <Link
            href={village.href}
            prefetch={false}
            scroll={false}
            aria-label={t('marker', { village: village.name, count: village.businessCount })}
            title={village.name}
            className="explore-map-marker group relative z-20 grid size-full place-items-center rounded-full focus-visible:outline-offset-0"
          >
            <span
              aria-hidden
              className="border-accent/60 bg-surface text-accent group-hover:border-accent group-hover:bg-wash grid size-9 place-items-center rounded-full border text-sm leading-none font-bold tabular-nums shadow-xs motion-safe:transition-colors"
            >
              {village.businessCount > 99 ? '99+' : village.businessCount}
            </span>
          </Link>,
          target,
          village.slug,
        )
      })}
      {businessPoints.map((business) => {
        const target = targets.get(business.slug)
        return target
          ? createPortal(
              <Link
                href={business.href}
                prefetch={false}
                aria-label={t('openBusinessPin', { name: business.name })}
                title={business.name}
                className="explore-business-marker group grid size-full place-items-center rounded-full focus-visible:outline-offset-0"
              >
                <span className="border-accent bg-surface text-accent group-hover:bg-accent group-hover:text-accent-foreground grid size-8 place-items-center rounded-full border shadow-xs">
                  <Store className="size-4" aria-hidden />
                </span>
              </Link>,
              target,
              business.slug,
            )
          : null
      })}
      {tilesFailed ? (
        <div
          role="status"
          className="bg-surface border-line absolute top-2 right-16 left-2 z-10 mr-auto flex max-w-sm flex-wrap items-center justify-between gap-x-2 rounded-(--radius) border px-3 text-xs font-medium shadow-sm"
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

function PinFan({ pins }: { pins: PinLink[] }) {
  const t = useTranslations('explore.map')
  const offsets = pinFanOffsets(pins.length)
  return (
    <div className="pointer-events-none absolute top-1/2 left-1/2 size-0">
      {pins.map((pin, index) => {
        const { x, y } = offsets[index]!
        const offset = { '--pin-x': `${x}px`, '--pin-y': `${y}px` } as CSSProperties
        return (
          <div key={pin.href}>
            <span
              aria-hidden
              className="bg-accent/55 absolute top-0 left-0 h-0.5 origin-left"
              style={{
                width: Math.hypot(x, y),
                transform: `rotate(${Math.atan2(y, x)}rad)`,
              }}
            />
            <div className="explore-map-fan-pin absolute top-0 left-0 z-10 size-0" style={offset}>
              <Link
                href={pin.href}
                prefetch={false}
                scroll={false}
                aria-label={t('openVillagePin', { name: pin.name })}
                title={pin.name}
                className="group pointer-events-auto grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full focus-visible:outline-offset-0"
              >
                <span className="border-accent bg-surface text-accent group-hover:bg-accent group-hover:text-accent-foreground grid size-8 place-items-center rounded-full border shadow-xs">
                  <MapPin className="size-4" aria-hidden />
                </span>
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}
