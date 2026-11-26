import { ApiError, unwrap } from '@repo/api-client'
import { notFound, unstable_rethrow } from 'next/navigation'
import { cache } from 'react'
import { api } from './api'
import {
  getPreviewBusiness,
  getPreviewVillageBusinesses,
  isCataloguePreview,
  previewVillages,
  searchPreviewProducts,
} from './catalogue-preview'

/** Failed reads keep their own state, while Next's 404 and redirect signals pass through. */
export async function readSection<T>(request: Promise<T>): Promise<T | null> {
  try {
    return await request
  } catch (error) {
    unstable_rethrow(error)
    if (error instanceof ApiError || error instanceof TypeError || error instanceof SyntaxError)
      return null
    throw error
  }
}

async function orNotFound<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound()
    throw e
  }
}

export async function getVillagePage(page: number, pageSize: number) {
  if (isCataloguePreview()) {
    const start = (page - 1) * pageSize
    return {
      data: previewVillages.slice(start, start + pageSize),
      meta: { page, pageSize, total: previewVillages.length },
    }
  }
  return unwrap(
    await api.v1.villages.$get({ query: { page: String(page), pageSize: String(pageSize) } }),
  )
}

export const getVillages = async () => (await getVillagePage(1, 24)).data

export async function getVillagesForFilter() {
  if (isCataloguePreview()) return previewVillages
  const pageSize = 50
  const first = await getVillagePage(1, pageSize)
  const remainingPages = Math.max(0, Math.ceil(first.meta.total / pageSize) - 1)
  const rest = await Promise.all(
    Array.from({ length: remainingPages }, (_, index) => getVillagePage(index + 2, pageSize)),
  )
  return [...first.data, ...rest.flatMap((page) => page.data)]
}

const readVillage = async (slug: string) =>
  (await unwrap(await api.v1.villages[':slug'].$get({ param: { slug } }))).data

export const getVillage = cache(async (slug: string): Promise<VillageDetail> =>
  isCataloguePreview()
    ? (previewVillages.find((village) => village.slug === slug) ?? notFound())
    : orNotFound(() => readVillage(slug)),
)

export const getVillageBusinesses = cache(async (slug: string) =>
  isCataloguePreview()
    ? getPreviewVillageBusinesses(slug)
    : (await unwrap(await api.v1.villages[':slug'].businesses.$get({ param: { slug } }))).data,
)

export const getBusiness = cache((slug: string) =>
  isCataloguePreview()
    ? Promise.resolve(getPreviewBusiness(slug) ?? notFound())
    : orNotFound(
        async () => (await unwrap(await api.v1.businesses[':slug'].$get({ param: { slug } }))).data,
      ),
)

const readProduct = cache(
  async (slug: string) =>
    (await unwrap(await api.v1.products[':slug'].$get({ param: { slug } }))).data,
)

export const getProduct = cache((slug: string) => orNotFound(() => readProduct(slug)))
export const getStoryProduct = (slug: string) => readSection(readProduct(slug))

export interface ProductQuery {
  q?: string
  category?: string
  region?: string
  village?: string
  business?: string
  sort?: 'newest' | 'price_asc' | 'price_desc'
  page?: number
  pageSize?: number
}

const readProductPage = async (query: ProductQuery) =>
  unwrap(
    await api.v1.products.$get({
      query: {
        q: query.q || undefined,
        category: query.category || undefined,
        region: query.region || undefined,
        village: query.village || undefined,
        business: query.business || undefined,
        sort: query.sort ?? 'newest',
        page: String(query.page ?? 1),
        pageSize: String(query.pageSize ?? 20),
      },
    }),
  )

export const searchProducts = async (query: ProductQuery): Promise<ApiProductPage> =>
  isCataloguePreview() ? searchPreviewProducts(query) : readProductPage(query)

export const getCategories = async () => (await unwrap(await api.v1.categories.$get())).data

export const getRegencies = async () => (await unwrap(await api.v1.regions.regencies.$get())).data

type ApiProductPage = Awaited<ReturnType<typeof readProductPage>>
export type ProductSummary = ApiProductPage['data'][number]
export type VillageDetail = Awaited<ReturnType<typeof readVillage>>

export async function getMapProducts(query: ProductQuery) {
  const pageSize = 50
  const first = await searchProducts({ ...query, page: 1, pageSize })
  const data = [...first.data]
  for (let page = 2; (page - 1) * pageSize < first.meta.total; page++) {
    const next = await readSection(searchProducts({ ...query, page, pageSize }))
    if (!next) return { data, meta: first.meta, incomplete: true }
    if (next.data.length === 0) break
    data.push(...next.data)
  }
  return { data, meta: first.meta, incomplete: false }
}

export async function getMapVillagePoints(products: ProductSummary[]) {
  const slugs = new Set(products.map(({ village }) => village.slug))
  const outcomes = await Promise.allSettled(
    [...slugs].map(async (slug) => {
      try {
        const village = await readVillage(slug)
        if (!village.regionCode || village.regionCode.split('.').length !== 4) return null
        const { data } = await unwrap(
          await api.v1.regions[':code'].$get({ param: { code: village.regionCode } }),
        )
        if (data.level !== 'village' || data.lat == null || data.lng == null) return null
        return { slug, lat: data.lat, lng: data.lng }
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null
        throw error
      }
    }),
  )
  return {
    points: outcomes.flatMap((outcome) =>
      outcome.status === 'fulfilled' && outcome.value ? [outcome.value] : [],
    ),
    incomplete: outcomes.some((outcome) => outcome.status === 'rejected'),
  }
}

/** Slugs of every public page for sitemap.xml. Throws when the API fails: an empty sitemap would drop every page. */
export const getSitemapEntries = async () => (await unwrap(await api.v1.sitemap.$get())).data
