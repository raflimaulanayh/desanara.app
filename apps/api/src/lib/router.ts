import { OpenAPIHono, z } from '@hono/zod-openapi'
import type { AppEnv } from './context'
import { errorBody } from './errors'

/** Every module router is created here so validation errors share one envelope. */
export function createRouter() {
  return new OpenAPIHono<AppEnv>({
    defaultHook: (result, c) => {
      if (!result.success) {
        return c.json(
          errorBody(c, 'VALIDATION_FAILED', 'Invalid request', z.treeifyError(result.error)),
          422,
        )
      }
    },
  })
}

export const errorResponseSchema = z
  .object({
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.unknown().optional(),
      requestId: z.string().optional(),
    }),
  })
  .openapi('Error')

export const errorResponses = {
  401: {
    description: 'Not logged in',
    content: { 'application/json': { schema: errorResponseSchema } },
  },
  403: {
    description: 'Forbidden',
    content: { 'application/json': { schema: errorResponseSchema } },
  },
  404: {
    description: 'Not found',
    content: { 'application/json': { schema: errorResponseSchema } },
  },
  422: {
    description: 'Validation failed',
    content: { 'application/json': { schema: errorResponseSchema } },
  },
} as const
