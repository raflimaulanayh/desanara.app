import { createRoute, z } from '@hono/zod-openapi'
import { createRouter, errorResponses } from '../../lib/router'
import { requireUser } from '../../middleware/session'

const meSchema = z
  .object({
    user: z.object({ id: z.string(), name: z.string(), email: z.string() }),
    actor: z.object({
      userId: z.string(),
      globalRole: z.enum(['super_admin']).nullable(),
      villageRoles: z.record(z.string(), z.enum(['village_admin', 'village_assistant'])),
      businessRoles: z.record(z.string(), z.enum(['owner', 'assistant'])),
    }),
  })
  .openapi('Me')

const meRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Account'],
  summary: 'Current user and their roles',
  middleware: [requireUser] as const,
  responses: {
    200: {
      description: 'Current user',
      content: { 'application/json': { schema: z.object({ data: meSchema }) } },
    },
    401: errorResponses[401],
  },
})

export const meRoutes = createRouter().openapi(meRoute, (c) => {
  const user = c.get('user')!
  const actor = c.get('actor')!
  return c.json({ data: { user, actor } }, 200)
})
