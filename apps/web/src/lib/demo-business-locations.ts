import type { MapCoordinates } from './catalogue-map'
import type { ProductSummary } from './data'

// Simulated storefronts for the Baros demo. Keep these separate from owner-provided locations.
const barosLocations: ReadonlyMap<string, MapCoordinates> = new Map([
  ['anyaman-bambu-pak-ujang', { lat: -7.0639, lng: 107.6288 }],
  ['dodol-ibu-euis', { lat: -7.0651, lng: 107.6322 }],
  ['keripik-bu-ani', { lat: -7.0674, lng: 107.6301 }],
  ['kopi-gunung-baros', { lat: -7.064, lng: 107.6341 }],
  ['madu-hutan-baros', { lat: -7.0689, lng: 107.6329 }],
  ['telur-asin-mang-oding', { lat: -7.0657, lng: 107.6265 }],
])

export function getDemoBusinessLocations(products: ProductSummary[]) {
  const locations = new Map<string, MapCoordinates>()
  for (const { business, isSeed, village } of products) {
    if (!isSeed || village.slug !== 'baros') continue
    const location = barosLocations.get(business.slug)
    if (location) locations.set(business.slug, location)
  }
  return locations
}
