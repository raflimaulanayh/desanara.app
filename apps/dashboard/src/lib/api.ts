import { createApiClient } from '@repo/api-client'
import { API_URL } from './env'

/** Browser API client; the session cookie is sent with `credentials: 'include'`. */
export const api = createApiClient(API_URL)
