import { createRoute, z } from '@hono/zod-openapi'
import {
  manageReviewListQuerySchema,
  reviewModerationSchema,
  reviewReplySchema,
} from '@repo/validators'
import type { Context } from 'hono'
import type { AppEnv } from '../../lib/context'
import { createRouter, errorResponseSchema, errorResponses } from '../../lib/router'
import { manageReviewListResponseSchema, manageReviewResponseSchema } from './manage-reviews.schema'
import * as service from './manage-reviews.service'

/** Dashboard endpoints for buyer reviews, mounted at /v1/manage/reviews behind `requireUser`. */

const tags = ['Manage: reviews']
const idParam = z.object({ id: z.uuid() })
const json = <T extends z.ZodType>(schema: T) => ({ 'application/json': { schema } })
const authErrors = { 401: errorResponses[401], 403: errorResponses[403] }
const one = { description: 'Review', content: json(manageReviewResponseSchema) }

const ctx = (c: Context<AppEnv>): service.Ctx => {
  c.header('Cache-Control', 'no-store')
  return { db: c.get('db'), actor: c.get('actor'), requestId: c.get('requestId') }
}

const listRoute = createRoute({
  method: 'get',
  path: '/',
  tags,
  summary:
    'Reviews of one village (moderators) or one business (its members), with counts per status',
  request: { query: manageReviewListQuerySchema },
  responses: {
    200: { description: 'Reviews', content: json(manageReviewListResponseSchema) },
    ...authErrors,
    404: errorResponses[404],
    422: errorResponses[422],
  },
})

const moderateRoute = createRoute({
  method: 'patch',
  path: '/{id}',
  tags,
  summary: 'Approve or reject a review (village admins and assistants; rejection needs a reason)',
  request: { params: idParam, body: { content: json(reviewModerationSchema), required: true } },
  responses: { 200: one, ...authErrors, 404: errorResponses[404], 422: errorResponses[422] },
})

const replyRoute = createRoute({
  method: 'put',
  path: '/{id}/reply',
  tags,
  summary: 'Write or replace the business reply to an approved review',
  request: { params: idParam, body: { content: json(reviewReplySchema), required: true } },
  responses: {
    200: one,
    ...authErrors,
    404: errorResponses[404],
    409: { description: 'Review not approved', content: json(errorResponseSchema) },
    422: errorResponses[422],
  },
})

const deleteReplyRoute = createRoute({
  method: 'delete',
  path: '/{id}/reply',
  tags,
  summary: 'Remove the business reply',
  request: { params: idParam },
  responses: { 200: one, ...authErrors, 404: errorResponses[404] },
})

export const manageReviewRoutes = createRouter()
  .openapi(listRoute, async (c) =>
    c.json(await service.listReviews(ctx(c), c.req.valid('query')), 200),
  )
  .openapi(moderateRoute, async (c) =>
    c.json(await service.moderateReview(ctx(c), c.req.valid('param').id, c.req.valid('json')), 200),
  )
  .openapi(replyRoute, async (c) =>
    c.json(await service.replyToReview(ctx(c), c.req.valid('param').id, c.req.valid('json')), 200),
  )
  .openapi(deleteReplyRoute, async (c) =>
    c.json(await service.replyToReview(ctx(c), c.req.valid('param').id, null), 200),
  )
