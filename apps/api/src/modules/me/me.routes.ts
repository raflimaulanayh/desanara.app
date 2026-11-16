import { createRoute, z } from '@hono/zod-openapi'
import { createRouter, errorResponses } from '../../lib/router'
import { requireUser } from '../../middleware/session'
import { membershipsOf } from './me.repository'

const meSchema = z
  .object({
    user: z.object({ id: z.string(), name: z.string(), email: z.string() }),
    actor: z.object({
      userId: z.string(),
      globalRole: z.enum(['super_admin']).nullable(),
      villageRoles: z.record(z.string(), z.enum(['village_admin', 'village_assistant'])),
      businessRoles: z.record(z.string(), z.enum(['owner', 'assistant'])),
    }),
    /** Where the user has a role, with names, for the dashboard header and home. */
    memberships: z.object({
      villages: z.array(
        z.object({
          id: z.uuid(),
          slug: z.string(),
          name: z.string(),
          role: z.enum(['village_admin', 'village_assistant']),
        }),
      ),
      businesses: z.array(
        z.object({
          id: z.uuid(),
          slug: z.string(),
          name: z.string(),
          villageId: z.uuid(),
          role: z.enum(['owner', 'assistant']),
        }),
      ),
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

export const meRoutes = createRouter().openapi(meRoute, async (c) => {
  const user = c.get('user')!
  const actor = c.get('actor')!
  c.header('Cache-Control', 'no-store')
  const memberships = await membershipsOf(c.get('db'), actor)
  return c.json({ data: { user, actor, memberships } }, 200)
})
