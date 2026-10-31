import { createApiClient } from '@repo/api-client'

/** Server-side API client for Server Components (public data only). */
export const api = createApiClient(
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787',
)
