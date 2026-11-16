import { ForbiddenError } from '@repo/auth/permissions'
import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import type { AppEnv } from './context'

/**
 * Stable error envelope (docs/architecture/api-conventions.md):
 * { "error": { "code": "NOT_FOUND", "message": "...", "details"?: ..., "requestId": "..." } }
 */
export type ErrorCode =
  | 'BAD_REQUEST'
  | 'VALIDATION_FAILED'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL'

export class AppError extends Error {
  constructor(
    public readonly status: ContentfulStatusCode,
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
  }

  static notFound(what = 'Resource') {
    return new AppError(404, 'NOT_FOUND', `${what} not found`)
  }
  static unauthenticated() {
    return new AppError(401, 'UNAUTHENTICATED', 'Login required')
  }
  /** 409. `reason` is a stable machine code the dashboard can translate (in `details.reason`). */
  static conflict(message: string, reason: string) {
    return new AppError(409, 'CONFLICT', message, { reason })
  }
  /** 422 for a rule checked by the service, in the same `details` shape as request validation. */
  static invalid(field: string, message: string) {
    return new AppError(422, 'VALIDATION_FAILED', 'Invalid request', {
      errors: [],
      properties: { [field]: { errors: [message] } },
    })
  }
}

export function errorBody(c: Context<AppEnv>, code: ErrorCode, message: string, details?: unknown) {
  return { error: { code, message, details, requestId: c.get('requestId') } }
}

export function handleError(err: Error, c: Context<AppEnv>) {
  if (err instanceof AppError) {
    return c.json(errorBody(c, err.code, err.message, err.details), err.status)
  }
  if (err instanceof ForbiddenError) {
    return c.json(errorBody(c, 'FORBIDDEN', 'You are not allowed to do this'), 403)
  }
  if (err instanceof HTTPException) {
    // Middleware errors (basic auth, body limit, …). Keep their headers: a 401 from basic auth
    // carries WWW-Authenticate, which is what makes the browser show its login prompt.
    const code: ErrorCode =
      err.status === 401
        ? 'UNAUTHENTICATED'
        : err.status === 403
          ? 'FORBIDDEN'
          : err.status === 404
            ? 'NOT_FOUND'
            : 'BAD_REQUEST'
    const fallback = err.status === 401 ? 'Login required' : 'Bad request'
    const res = c.json(errorBody(c, code, err.message || fallback), err.status)
    err.getResponse().headers.forEach((value, key) => {
      if (!['content-type', 'content-length'].includes(key.toLowerCase()))
        res.headers.set(key, value)
    })
    return res
  }
  console.error(`[${c.get('requestId')}]`, err)
  return c.json(errorBody(c, 'INTERNAL', 'Internal server error'), 500)
}
