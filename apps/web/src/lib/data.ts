import { ApiError, unwrap } from '@repo/api-client'
import { notFound, unstable_rethrow } from 'next/navigation'
import { cache } from 'react'
import { api } from './api'
import {
  getPreviewBusiness,
  getPreviewVillageBusinesses,
  isCataloguePreview,
  previewVillagePoints,
  previewVillages,
  searchPreviewProducts,
} from './catalogue-preview'
import { regencyCode } from './explore-filters'

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

async function getVillagePrefix(pageSize: number, limit = Infinity) {
  const first = await getVillagePage(1, pageSize)
  const total = first.meta.total
  const remainingPages = Math.max(0, Math.ceil(Math.min(total, limit) / pageSize) - 1)
  const rest = await Promise.all(
    Array.from({ length: remainingPages }, (_, index) => getVillagePage(index + 2, pageSize)),
  )
  return { data: [...first.data, ...rest.flatMap((page) => page.data)].slice(0, limit), total }
}

export async function getVillagesForFilter() {
  return (await getVillagePrefix(50)).data
}

export const VILLAGES_PER_LOAD = 12

export async function getVillageDirectory(
  page: number | undefined,
  query: string,
  region?: string,
) {
  const limit = page === undefined ? Infinity : page * VILLAGES_PER_LOAD
  if (!query && !region) return getVillagePrefix(Math.min(limit, 48), limit)

  const normalize = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
  const terms = normalize(query).split(/\s+/)
  const matches = (await getVillagesForFilter()).filter((village) => {
    if (region && regencyCode(village.regionCode) !== region) return false
    const text = normalize(`${village.name} ${village.regionName ?? ''}`)
    return terms.every((term) => text.includes(term))
  })
  return { data: matches.slice(0, limit), total: matches.length }
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

/** First page of approved buyer reviews with the rating summary (PLAN-product-reviews). */
export const REVIEWS_PAGE_SIZE = 5
export const getProductReviews = (slug: string) =>
  readSection(
    (async () =>
      unwrap(
        await api.v1.products[':slug'].reviews.$get({
          param: { slug },
          query: { page: '1', pageSize: String(REVIEWS_PAGE_SIZE) },
        }),
      ))(),
  )
export type ProductReviewPage = NonNullable<Awaited<ReturnType<typeof getProductReviews>>>

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

export const getRegion = async (code: string) =>
  (await unwrap(await api.v1.regions[':code'].$get({ param: { code } }))).data

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

type VillageLocation = Pick<VillageDetail, 'slug' | 'regionCode'>

async function readVillageMapPoint({ slug, regionCode }: VillageLocation) {
  if (!regionCode || regionCode.split('.').length !== 4) return null
  const region = await getRegion(regionCode)
  if (region.level !== 'village' || region.lat == null || region.lng == null) return null
  return { slug, lat: region.lat, lng: region.lng }
}

async function collectVillageMapPoints(requests: ReturnType<typeof readVillageMapPoint>[]) {
  const outcomes = await Promise.allSettled(requests)
  return {
    points: outcomes.flatMap((outcome) =>
      outcome.status === 'fulfilled' && outcome.value ? [outcome.value] : [],
    ),
    incomplete: outcomes.some(
      (outcome) =>
        outcome.status === 'rejected' &&
        !(outcome.reason instanceof ApiError && outcome.reason.status === 404),
    ),
  }
}

export function getMapVillagePoints(products: ProductSummary[]) {
  const slugs = new Set(products.map(({ village }) => village.slug))
  return collectVillageMapPoints(
    [...slugs].map(async (slug) => readVillageMapPoint(await readVillage(slug))),
  )
}

export async function getDirectoryMapPoints(villages: VillageLocation[]) {
  if (!isCataloguePreview()) return collectVillageMapPoints(villages.map(readVillageMapPoint))

  const slugs = new Set(villages.map(({ slug }) => slug))
  return { points: previewVillagePoints.filter(({ slug }) => slugs.has(slug)), incomplete: false }
}

/** Slugs of every public page for sitemap.xml. Throws when the API fails: an empty sitemap would drop every page. */
export const getSitemapEntries = async () => (await unwrap(await api.v1.sitemap.$get())).data
