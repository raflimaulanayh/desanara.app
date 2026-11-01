import { createRoute, z } from '@hono/zod-openapi'
import { createRouter, errorResponses } from '../../lib/router'
import { businessDetailSchema } from './businesses.schema'
import * as service from './businesses.service'

const detailRoute = createRoute({
  method: 'get',
  path: '/{slug}',
  tags: ['Businesses'],
  summary: 'Published, verified business with its village (theme, timezone)',
  request: { params: z.object({ slug: z.string().min(1) }) },
  responses: {
    200: {
      description: 'Business',
      content: { 'application/json': { schema: z.object({ data: businessDetailSchema }) } },
    },
    404: errorResponses[404],
  },
})

export const businessRoutes = createRouter().openapi(detailRoute, async (c) =>
  c.json(await service.getBusiness(c.get('db'), c.req.valid('param').slug), 200),
)
