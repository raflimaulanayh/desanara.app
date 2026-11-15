import { createRoute, z } from '@hono/zod-openapi'
import { sql } from 'drizzle-orm'
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

const readySchema = z.object({ status: z.enum(['ok', 'unavailable']), database: z.boolean() })

/**
 * Readiness: also pings the database. A daily Vercel Cron calls it, which keeps a Supabase Free
 * project from pausing after 7 idle days (ADR 0009).
 */
const readyRoute = createRoute({
  method: 'get',
  path: '/ready',
  tags: ['System'],
  summary: 'Readiness check (pings the database)',
  responses: {
    200: {
      description: 'API and database are up',
      content: { 'application/json': { schema: readySchema } },
    },
    503: {
      description: 'Database unreachable',
      content: { 'application/json': { schema: readySchema } },
    },
  },
})

export const healthRoutes = createRouter()
  .openapi(healthRoute, (c) =>
    c.json({ status: 'ok' as const, time: new Date().toISOString() }, 200),
  )
  .openapi(readyRoute, async (c) => {
    try {
      await c.get('db').execute(sql`select 1`)
      return c.json({ status: 'ok' as const, database: true }, 200)
    } catch {
      return c.json({ status: 'unavailable' as const, database: false }, 503)
    }
  })
