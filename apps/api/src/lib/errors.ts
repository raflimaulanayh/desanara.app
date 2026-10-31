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
    return c.json(errorBody(c, 'BAD_REQUEST', err.message), err.status)
  }
  console.error(`[${c.get('requestId')}]`, err)
  return c.json(errorBody(c, 'INTERNAL', 'Internal server error'), 500)
}
