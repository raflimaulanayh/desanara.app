import type { ProductSummary } from './data'

type VillagePoint = { slug: string; lat: number; lng: number }

export function groupMapBusinesses(products: ProductSummary[], points: VillagePoint[]) {
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
