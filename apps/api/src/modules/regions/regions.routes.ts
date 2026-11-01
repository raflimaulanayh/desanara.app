import { createRoute, z } from '@hono/zod-openapi'
import { regions, villages } from '@repo/db'
import { and, asc, eq, inArray, like, or, sql } from 'drizzle-orm'
import { createRouter } from '../../lib/router'
import { publicVillage } from '../../lib/visibility'

const regencyRoute = createRoute({
  method: 'get',
  path: '/regencies',
  tags: ['Regions'],
  summary: 'Regencies/cities that have at least one published village (for filters)',
  responses: {
    200: {
      description: 'Regencies',
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(
              z.object({ code: z.string(), name: z.string(), villageCount: z.number().int() }),
            ),
          }),
        },
      },
    },
  },
})

export const regionRoutes = createRouter().openapi(regencyRoute, async (c) => {
  const db = c.get('db')
  const villageCount = sql<number>`(
    select count(*)::int from ${villages}
    where (${villages.regionCode} = ${regions.code} or ${villages.regionCode} like ${regions.code} || '.%') and ${publicVillage}
  )`
  const rows = await db
    .select({ code: regions.code, name: regions.name, villageCount })
    .from(regions)
    .where(
      and(
        eq(regions.level, 'regency'),
        inArray(
          regions.code,
          db
            .select({ code: sql<string>`left(${villages.regionCode}, 5)` })
            .from(villages)
            .where(
              and(
                publicVillage,
                or(like(villages.regionCode, '__.__'), like(villages.regionCode, '__.__.%')),
              ),
            ),
        ),
      ),
    )
    .orderBy(asc(regions.name))
  return c.json({ data: rows }, 200)
})
