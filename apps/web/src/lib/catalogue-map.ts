import type { ProductSummary } from './data'

export type MapCoordinates = { lat: number; lng: number }
type VillagePoint = MapCoordinates & { slug: string }

export const MAP_MAX_ZOOM = 19
export const MAP_ZOOM_STEP = 0.25

export function groupNearbyVillages<T extends VillagePoint>(
  villages: T[],
  project: (village: T) => { x: number; y: number },
  selectedSlug?: string,
) {
  const groups: { anchor: T; members: T[]; point: { x: number; y: number } }[] = []
  for (const village of villages) {
    const point = project(village)
    const nearby = groups.find(
      (group) =>
        village.slug !== selectedSlug &&
        group.anchor.slug !== selectedSlug &&
        Math.hypot(point.x - group.point.x, point.y - group.point.y) < 44,
    )
    if (nearby) nearby.members.push(village)
    else groups.push({ anchor: village, members: [village], point })
  }
  return groups
}

export function villageSplitZoom<T extends VillagePoint>(
  villages: T[],
  zoom: number,
  project: (village: T, zoom: number) => { x: number; y: number },
) {
  for (let next = zoom + MAP_ZOOM_STEP; next < MAP_MAX_ZOOM; next += MAP_ZOOM_STEP) {
    if (groupNearbyVillages(villages, (village) => project(village, next)).length > 1) return next
  }
  return MAP_MAX_ZOOM
}

export function pinFanOffsets(count: number) {
  const offsets: { x: number; y: number }[] = []
  for (let ring = 0; offsets.length < count; ring++) {
    const size = Math.min(count - offsets.length, 8 * (ring + 1))
    const radius = 64 + ring * 56
    for (let index = 0; index < size; index++) {
      const angle = (index * 2 * Math.PI) / size - (size === 2 ? 0 : Math.PI / 2)
      offsets.push({
        x: Math.round(radius * Math.cos(angle)),
        y: Math.round(radius * Math.sin(angle)),
      })
    }
  }
  return offsets
}

export function groupMapBusinesses<P extends VillagePoint>(
  products: ProductSummary[],
  points: P[],
) {
  const byVillage = new Map<string, Map<string, ProductSummary>>()
  for (const product of products) {
    const businesses = byVillage.get(product.village.slug) ?? new Map<string, ProductSummary>()
    if (!businesses.has(product.business.slug)) businesses.set(product.business.slug, product)
    byVillage.set(product.village.slug, businesses)
  }

  return points.flatMap((point) => {
    const businesses = [...(byVillage.get(point.slug)?.values() ?? [])]
    if (!businesses[0]) return []
    return [{ ...point, name: businesses[0].village.name, businesses }]
  })
}

export function mapBusinessPins(
  products: ProductSummary[],
  locations: ReadonlyMap<string, MapCoordinates> | undefined,
  href: (product: ProductSummary) => string,
) {
  return products.flatMap((product) => {
    const point = locations?.get(product.business.slug)
    return point
      ? [
          {
            ...point,
            slug: `business:${product.business.slug}`,
            name: product.business.name,
            href: href(product),
          },
        ]
      : []
  })
}
