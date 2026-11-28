import type { MapCoordinates } from './catalogue-map'
import type { ProductSummary } from './data'

/**
 * Storefront points for the demo businesses (`isSeed`), per village. They are placed around each village
 * centre and never come from the internal dashboard location (PLAN-public-business-locations). Real
 * businesses get a point only once a public-location field exists.
 */
const demoLocations: Readonly<Record<string, ReadonlyMap<string, MapCoordinates>>> = {
  baros: new Map([
    ['anyaman-bambu-pak-ujang', { lat: -7.0639, lng: 107.6288 }],
    ['dodol-ibu-euis', { lat: -7.0651, lng: 107.6322 }],
    ['keripik-bu-ani', { lat: -7.0674, lng: 107.6301 }],
    ['kopi-gunung-baros', { lat: -7.064, lng: 107.6341 }],
    ['madu-hutan-baros', { lat: -7.0689, lng: 107.6329 }],
    ['telur-asin-mang-oding', { lat: -7.0657, lng: 107.6265 }],
  ]),
  mekarwangi: new Map([
    ['kulit-mekarwangi', { lat: -7.2052, lng: 107.8461 }],
    ['jeruk-garut-pak-darma', { lat: -7.2101, lng: 107.8497 }],
    ['batik-tulis-mekarwangi', { lat: -7.2068, lng: 107.8502 }],
    ['abon-ikan-mas', { lat: -7.2093, lng: 107.8449 }],
    ['bandrek-mekarwangi', { lat: -7.2046, lng: 107.8489 }],
  ]),
  sindangjaya: new Map([
    ['tahu-sindangjaya', { lat: -6.7531, lng: 107.0019 }],
    ['ubi-madu-pak-endang', { lat: -6.7572, lng: 107.0051 }],
    ['ukir-kayu-sindangjaya', { lat: -6.7539, lng: 107.0058 }],
    ['sale-pisang-bu-entin', { lat: -6.7565, lng: 107.0013 }],
  ]),
}

export function getDemoBusinessLocations(products: ProductSummary[]) {
  const locations = new Map<string, MapCoordinates>()
  for (const { business, isSeed, village } of products) {
    if (!isSeed) continue
    const location = demoLocations[village.slug]?.get(business.slug)
    if (location) locations.set(business.slug, location)
  }
  return locations
}
