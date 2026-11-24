import { isCataloguePreview } from '@/lib/catalogue-preview'
import { searchProducts } from '@/lib/data'
import { pick } from '@/lib/localize'
import { mediaUrl } from '@/lib/media'
import { localePath } from '@/lib/paths'

interface SearchSuggestion {
  id: string
  name: string
  detail: string
  image: string | null
  category?: string
  kind: 'product' | 'business'
  href: string
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const q = params.get('q')?.trim()
  if (!q || q.length < 2 || q.length > 100 || !/[\p{L}\p{N}]/u.test(q)) {
    return Response.json({ data: [] })
  }

  const locale = params.get('locale') === 'en' ? 'en' : 'id'
  const { data } = await searchProducts({
    q,
    category: params.get('category') || undefined,
    region: params.get('region') || undefined,
    village: params.get('village') || undefined,
    pageSize: 12,
  })
  const preview = isCataloguePreview()
  const term = q.toLocaleLowerCase(locale)
  const matchingBusinesses = new Map<string, SearchSuggestion>()
  for (const { business, village } of data) {
    if (!business.name.toLocaleLowerCase(locale).includes(term)) continue
    if (matchingBusinesses.has(business.slug)) continue
    matchingBusinesses.set(business.slug, {
      id: `business:${business.slug}`,
      name: business.name,
      detail: village.name,
      image: null,
      kind: 'business',
      href: localePath(locale, `/desa/${village.slug}/${business.slug}`),
    })
    if (matchingBusinesses.size === 2) break
  }

  const products = data.slice(0, 4).map((product): SearchSuggestion => ({
    id: `product:${product.slug}`,
    name: pick(locale, product.name, product.nameEn),
    detail: product.village.name,
    image: mediaUrl(product.imageKey, preview),
    category: product.category?.slug,
    kind: 'product',
    href: localePath(locale, `/produk/${product.slug}`),
  }))

  return Response.json({ data: [...matchingBusinesses.values(), ...products] })
}

export type { SearchSuggestion }
