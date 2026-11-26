import { createApiClient } from '@repo/api-client'

const productionApi = 'https://api.desanara.app'
const apiOrigin =
  process.env.NODE_ENV === 'development'
    ? process.env.WEB_API_URL || productionApi
    : process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || productionApi

/** Server-side API client for Server Components (public data only). */
export const api = createApiClient(apiOrigin)
