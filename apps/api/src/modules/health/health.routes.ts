import { createRoute, z } from '@hono/zod-openapi'
import { createRouter } from '../../lib/router'

const healthRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['System'],
  summary: 'Liveness check',
  responses: {
    200: {
      description: 'API is up',
      content: {
        'application/json': { schema: z.object({ status: z.literal('ok'), time: z.string() }) },
      },
    },
  },
})

export const healthRoutes = createRouter().openapi(healthRoute, (c) =>
  c.json({ status: 'ok' as const, time: new Date().toISOString() }, 200),
)
