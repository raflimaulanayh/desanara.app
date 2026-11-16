import { createRoute, z } from '@hono/zod-openapi'
import { regions, villages } from '@repo/db'
import { and, asc, eq, inArray, like, or, sql } from 'drizzle-orm'
import {
  regionChildrenQuerySchema,
  regionCodeSchema,
  regionSearchQuerySchema,
  regionSearchTerms,
} from '@repo/validators'
import { AppError } from '../../lib/errors'
import { createRouter, errorResponses } from '../../lib/router'
import * as repo from './regions.repository'
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

const regionSchema = z
  .object({
    code: z.string(),
    name: z.string(),
    level: z.enum(['province', 'regency', 'district', 'village']),
    /** "Baros, Kec. Arjasari, Kabupaten Bandung, Jawa Barat". */
    fullName: z.string(),
    /** Centre point (WGS84), null when the dataset has none. */
    lat: z.number().nullable(),
    lng: z.number().nullable(),
  })
  .openapi('Region')
const regionList = { 'application/json': { schema: z.object({ data: z.array(regionSchema) }) } }

const searchRoute = createRoute({
  method: 'get',
  path: '/search',
  tags: ['Regions'],
  summary: 'Search regions by name: every word must match ("baros arjasari")',
  request: { query: regionSearchQuerySchema },
  responses: {
    200: { description: 'Best matches', content: regionList },
    422: errorResponses[422],
  },
})

const childrenRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Regions'],
  summary: 'Children of a region (provinces when `parent` is missing), for a cascading picker',
  request: { query: regionChildrenQuerySchema },
  responses: {
    200: { description: 'Regions', content: regionList },
    404: errorResponses[404],
    422: errorResponses[422],
  },
})

const oneRoute = createRoute({
  method: 'get',
  path: '/{code}',
  tags: ['Regions'],
  summary: 'One region by Kemendagri code',
  request: { params: z.object({ code: regionCodeSchema }) },
  responses: {
    200: {
      description: 'Region',
      content: { 'application/json': { schema: z.object({ data: regionSchema }) } },
    },
    404: errorResponses[404],
    422: errorResponses[422],
  },
})

/** Region data changes about once a year: browsers keep it an hour, the CDN a day. */
const CACHE = 'public, max-age=3600, s-maxage=86400'

export const regionRoutes = createRouter()
  .openapi(searchRoute, async (c) => {
    const { q, level, within, limit } = c.req.valid('query')
    const terms = regionSearchTerms(q)
    const data = terms.length
      ? await repo.searchRegions(c.get('db'), { terms, level, within, limit })
      : []
    c.header('Cache-Control', CACHE)
    return c.json({ data }, 200)
  })
  .openapi(childrenRoute, async (c) => {
    const { parent } = c.req.valid('query')
    const db = c.get('db')
    if (parent && !(await repo.findRegion(db, parent))) throw AppError.notFound('Region')
    c.header('Cache-Control', CACHE)
    return c.json({ data: await repo.listChildren(db, parent) }, 200)
  })
  .openapi(regencyRoute, async (c) => {
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
  .openapi(oneRoute, async (c) => {
    const region = await repo.findRegion(c.get('db'), c.req.valid('param').code)
    if (!region) throw AppError.notFound('Region')
    c.header('Cache-Control', CACHE)
    return c.json({ data: region }, 200)
  })
