import { ApiError, unwrap } from '@repo/api-client'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { api } from './api'

/** Lists degrade to empty when the API is down (build time, local dev); details 404 properly. */
async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch {
    return fallback
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

export const getVillages = () =>
  safe(
    async () =>
      (await unwrap(await api.v1.villages.$get({ query: { page: '1', pageSize: '24' } }))).data,
    [],
  )

export const getVillage = cache((slug: string) =>
  orNotFound(
    async () => (await unwrap(await api.v1.villages[':slug'].$get({ param: { slug } }))).data,
  ),
)

export const getVillageBusinesses = cache((slug: string) =>
  safe(
    async () =>
      (await unwrap(await api.v1.villages[':slug'].businesses.$get({ param: { slug } }))).data,
    [],
  ),
)

export const getBusiness = cache((slug: string) =>
  orNotFound(
    async () => (await unwrap(await api.v1.businesses[':slug'].$get({ param: { slug } }))).data,
  ),
)

export const getProduct = cache((slug: string) =>
  orNotFound(
    async () => (await unwrap(await api.v1.products[':slug'].$get({ param: { slug } }))).data,
  ),
)

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

export const searchProducts = (query: ProductQuery) =>
  safe(
    async () =>
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
      ),
    { data: [], meta: { page: 1, pageSize: query.pageSize ?? 20, total: 0 } },
  )

export const getCategories = () =>
  safe(async () => (await unwrap(await api.v1.categories.$get())).data, [])

export const getRegencies = () =>
  safe(async () => (await unwrap(await api.v1.regions.regencies.$get())).data, [])

export type ProductSummary = Awaited<ReturnType<typeof searchProducts>>['data'][number]

/** Slugs of every public page for sitemap.xml. Throws when the API fails: an empty sitemap would drop every page. */
export const getSitemapEntries = async () => (await unwrap(await api.v1.sitemap.$get())).data
