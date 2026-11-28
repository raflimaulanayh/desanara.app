import { createRoute, z } from '@hono/zod-openapi'
import { productReviewCreateSchema, productReviewListQuerySchema } from '@repo/validators'
import { hashedClientKey, hit } from '../../lib/rate-limit'
import { createRouter, errorResponses } from '../../lib/router'
import { reviewCreatedSchema, reviewListResponseSchema } from './reviews.schema'
import * as service from './reviews.service'

const tags = ['Catalog: reviews']
const slugParam = z.object({ slug: z.string().min(1) })

const listRoute = createRoute({
  method: 'get',
  path: '/products/{slug}/reviews',
  tags,
  summary: 'Approved buyer reviews of a public product, newest first, with the rating summary',
  request: { params: slugParam, query: productReviewListQuerySchema },
  responses: {
    200: {
      description: 'Reviews',
      content: { 'application/json': { schema: reviewListResponseSchema } },
    },
    404: errorResponses[404],
    422: errorResponses[422],
  },
})

const createReviewRoute = createRoute({
  method: 'post',
  path: '/products/{slug}/reviews',
  tags,
  summary:
    'Send a buyer review. It is shown only after a village admin or assistant approves it. `website` must stay empty (honeypot). Limited per address: 3 an hour, 1 per product a day.',
  request: {
    params: slugParam,
    body: {
      content: { 'application/json': { schema: productReviewCreateSchema } },
      required: true,
    },
  },
  responses: {
    202: {
      description: 'Received, waiting for moderation',
      content: { 'application/json': { schema: reviewCreatedSchema } },
    },
    404: errorResponses[404],
    422: errorResponses[422],
    429: errorResponses[429],
  },
})

export const reviewRoutes = createRouter()
  .openapi(listRoute, async (c) => {
    c.header('Cache-Control', 'public, max-age=60, s-maxage=300')
    return c.json(
      await service.listReviews(c.get('db'), c.req.valid('param').slug, c.req.valid('query')),
      200,
    )
  })
  .openapi(createReviewRoute, async (c) => {
    const db = c.get('db')
    const client = await hashedClientKey(c)
    const { perHour, perProductDay } = service.REVIEW_LIMITS
    const result = await service.createReview(
      db,
      c.req.valid('param').slug,
      c.req.valid('json'),
      async (productId) =>
        (await hit(db, `review:h:${client}`, perHour.limit, perHour.windowMs)) &&
        (await hit(
          db,
          `review:p:${productId}:${client}`,
          perProductDay.limit,
          perProductDay.windowMs,
        )),
    )
    c.header('Cache-Control', 'no-store')
    return c.json(result, 202)
  })
