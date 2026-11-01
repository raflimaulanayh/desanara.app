import { createRoute, z } from '@hono/zod-openapi'
import { paginationSchema } from '@repo/validators'
import { createRouter, errorResponses } from '../../lib/router'
import { villageDetailResponseSchema, villageListResponseSchema } from './villages.schema'
import * as service from './villages.service'
import { businessPublicSchema } from '../businesses/businesses.schema'
import * as businessService from '../businesses/businesses.service'

const listRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Villages'],
  summary: 'List published villages',
  request: { query: paginationSchema },
  responses: {
    200: {
      description: 'Villages',
      content: { 'application/json': { schema: villageListResponseSchema } },
    },
    422: errorResponses[422],
  },
})

const detailRoute = createRoute({
  method: 'get',
  path: '/{slug}',
  tags: ['Villages'],
  summary: 'Get a published village by slug',
  request: { params: z.object({ slug: z.string().min(1) }) },
  responses: {
    200: {
      description: 'Village',
      content: { 'application/json': { schema: villageDetailResponseSchema } },
    },
    404: errorResponses[404],
  },
})

const businessesRoute = createRoute({
  method: 'get',
  path: '/{slug}/businesses',
  tags: ['Villages'],
  summary: 'Published, verified businesses of a village',
  request: { params: z.object({ slug: z.string().min(1) }) },
  responses: {
    200: {
      description: 'Businesses',
      content: {
        'application/json': { schema: z.object({ data: z.array(businessPublicSchema) }) },
      },
    },
  },
})

export const villageRoutes = createRouter()
  .openapi(listRoute, async (c) => {
    const { page, pageSize } = c.req.valid('query')
    return c.json(await service.listVillages(c.get('db'), page, pageSize), 200)
  })
  .openapi(detailRoute, async (c) => {
    const { slug } = c.req.valid('param')
    return c.json(await service.getVillageBySlug(c.get('db'), slug), 200)
  })
  .openapi(businessesRoute, async (c) => {
    const { slug } = c.req.valid('param')
    return c.json(await businessService.listVillageBusinesses(c.get('db'), slug), 200)
  })
