import { ApiError } from '@repo/api-client'

export function isReadRestricted(error: unknown) {
  return error instanceof ApiError && [401, 403, 404].includes(error.status)
}

export function readableData<T>(query: { data: T | undefined; error: unknown }) {
  return isReadRestricted(query.error) ? undefined : query.data
}

/**
 * Turns an API error into plain Indonesian for people who are not tech-savvy:
 * - 409 `details.reason` (NOT_VERIFIED, NO_PHOTO, …) → `errors.reason.<CODE>`
 * - 422 field errors → `fields` (shown next to each input)
 * - 401/403/404/503/network → one sentence each
 */
export interface DescribedError {
  message: string
  fields: Record<string, string>
  /** The session is gone: the caller should send the user to /login. */
  sessionExpired: boolean
}

type Translate = ((key: string) => string) & { has?: (key: string) => boolean }

interface TreeError {
  errors?: string[]
  properties?: Record<string, TreeError>
}

/** First message per field from the `z.treeifyError` shape the API returns for 422. */
export function fieldErrors(details: unknown): Record<string, string> {
  const out: Record<string, string> = {}
  const walk = (node: TreeError | undefined, path: string) => {
    if (!node) return
    if (path && node.errors?.[0]) out[path] = node.errors[0]
    for (const [key, child] of Object.entries(node.properties ?? {})) {
      walk(child, path ? `${path}.${key}` : key)
    }
  }
  walk(details as TreeError, '')
  return out
}

export function describeApiError(error: unknown, t: Translate): DescribedError {
  const result: DescribedError = { message: t('errors.generic'), fields: {}, sessionExpired: false }
  if (!(error instanceof ApiError)) {
    result.message = t('errors.network')
    return result
  }
  const details = error.body?.error.details as { reason?: string } | undefined
  switch (error.status) {
    case 401:
      result.sessionExpired = true
      result.message = t('errors.sessionExpired')
      break
    case 403:
      result.message = t('errors.forbidden')
      break
    case 404:
      result.message = t('errors.notFound')
      break
    case 409: {
      const key = `errors.reason.${details?.reason}`
      result.message = details?.reason && t.has?.(key) ? t(key) : t('errors.conflict')
      break
    }
    case 422:
      result.fields = fieldErrors(details)
      result.message = t('errors.invalid')
      break
    case 503:
      result.message = t('errors.unavailable')
      break
  }
  return result
}
