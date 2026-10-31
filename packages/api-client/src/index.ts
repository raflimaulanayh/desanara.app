import type { AppType } from 'api/app-type'
import { hc } from 'hono/client'

/**
 * Typed API client shared by apps/web, apps/dashboard and (later) apps/mobile.
 * Types come from apps/api at compile time only — no server code is bundled.
 *
 *   const api = createApiClient(process.env.NEXT_PUBLIC_API_URL!)
 *   const res = await api.v1.villages.$get({ query: { page: '1', pageSize: '12' } })
 */
export function createApiClient(baseUrl: string, init?: { headers?: Record<string, string> }) {
  return hc<AppType>(baseUrl, {
    headers: init?.headers,
    init: { credentials: 'include' },
  })
}

export type ApiClient = ReturnType<typeof createApiClient>

export interface ApiErrorBody {
  error: { code: string; message: string; details?: unknown; requestId?: string }
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: ApiErrorBody | null,
  ) {
    super(body?.error.message ?? `API request failed with ${status}`)
    this.name = 'ApiError'
  }
}

type AnyResponse = { ok: boolean; status: number; json(): Promise<unknown> }

/** JSON body type of the successful (2xx) members of a Hono client response union. */
export type SuccessBody<R> = R extends { ok: true; json(): Promise<infer T> } ? T : never

/** Unwraps a Hono client response or throws ApiError with the standard envelope. */
export async function unwrap<R extends AnyResponse>(res: R): Promise<SuccessBody<R>> {
  if (res.ok) return (await res.json()) as SuccessBody<R>
  let body: ApiErrorBody | null = null
  try {
    body = (await res.json()) as ApiErrorBody
  } catch {
    body = null
  }
  throw new ApiError(res.status, body)
}
