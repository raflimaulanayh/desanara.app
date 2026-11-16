import { createRoute, z } from '@hono/zod-openapi'
import { mediaAttachSchema, mediaPresignSchema, mediaRemoveQuerySchema } from '@repo/validators'
import type { Context } from 'hono'
import type { AppEnv } from '../../lib/context'
import { createRouter, errorResponseSchema, errorResponses } from '../../lib/router'
import * as service from './media.service'

/**
 * Image uploads for every target (product photos, business logo, village logo/banner), mounted at
 * /v1/manage/media behind `requireUser`. Product photo order lives in the products module.
 */

const tags = ['Manage: media']
const json = <T extends z.ZodType>(schema: T) => ({ 'application/json': { schema } })
const err = (description: string) => ({ description, content: json(errorResponseSchema) })
const authErrors = { 401: errorResponses[401], 403: errorResponses[403] }

const keysResponse = z.object({
  data: z.object({ keys: z.array(z.string()).describe('Attached keys, in display order') }),
})

const ctx = (c: Context<AppEnv>): service.Ctx => {
  c.header('Cache-Control', 'no-store')
  return {
    db: c.get('db'),
    storage: c.get('storage'),
    actor: c.get('actor'),
    requestId: c.get('requestId'),
  }
}

const presignRoute = createRoute({
  method: 'post',
  path: '/presign',
  tags,
  summary: 'One-time upload URL (5 minutes) signed for this exact content type and size',
  request: { body: { content: json(mediaPresignSchema), required: true } },
  responses: {
    200: {
      description: 'PUT the file to `uploadUrl` with `headers`, then call POST /v1/manage/media',
      content: json(
        z.object({
          data: z.object({
            key: z.string(),
            uploadUrl: z.string(),
            method: z.literal('PUT'),
            headers: z.record(z.string(), z.string()),
            expiresAt: z.string(),
          }),
        }),
      ),
    },
    ...authErrors,
    404: errorResponses[404],
    409: err('`TOO_MANY_FILES`'),
    422: errorResponses[422],
    503: err('Storage not configured'),
  },
})

const attachRoute = createRoute({
  method: 'post',
  path: '/',
  tags,
  summary:
    'Attach an uploaded file (checked in storage first); a single slot replaces the old file',
  request: { body: { content: json(mediaAttachSchema), required: true } },
  responses: {
    200: { description: 'Attached', content: json(keysResponse) },
    ...authErrors,
    404: errorResponses[404],
    409: err('`TOO_MANY_FILES`'),
    422: errorResponses[422],
    503: err('Storage not configured'),
  },
})

const removeRoute = createRoute({
  method: 'delete',
  path: '/',
  tags,
  summary: 'Remove a file from its entity and from storage',
  request: { query: mediaRemoveQuerySchema },
  responses: {
    200: { description: 'Removed', content: json(keysResponse) },
    ...authErrors,
    404: errorResponses[404],
    409: err('`LAST_PHOTO`: a published product needs at least one photo'),
    422: errorResponses[422],
    503: err('Storage not configured'),
  },
})

export const mediaRoutes = createRouter()
  .openapi(presignRoute, async (c) =>
    c.json(await service.presign(ctx(c), c.req.valid('json')), 200),
  )
  .openapi(attachRoute, async (c) => c.json(await service.attach(ctx(c), c.req.valid('json')), 200))
  .openapi(removeRoute, async (c) =>
    c.json(await service.remove(ctx(c), c.req.valid('query')), 200),
  )
