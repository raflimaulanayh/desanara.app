import { createRoute, z } from '@hono/zod-openapi'
import {
  businessCreateSchema,
  businessManageListQuerySchema,
  businessTakedownSchema,
  businessUpdateSchema,
  businessVerifySchema,
} from '@repo/validators'
import type { Context } from 'hono'
import type { AppEnv } from '../../lib/context'
import { createRouter, errorResponseSchema, errorResponses } from '../../lib/router'
import {
  businessManageListResponseSchema,
  businessManageResponseSchema,
} from './manage-businesses.schema'
import * as service from './manage-businesses.service'

/**
 * Dashboard endpoints for businesses, mounted at /v1/manage/businesses behind `requireUser`.
 * Public, cacheable reads stay in the `businesses` module (by slug); everything here is private,
 * addressed by id and never cached.
 */

const tags = ['Manage: businesses']
const idParam = z.object({ id: z.uuid() })
const json = <T extends z.ZodType>(schema: T) => ({ 'application/json': { schema } })
const conflict = {
  description: 'Business rule not met; `details.reason` says which',
  content: json(errorResponseSchema),
}
const authErrors = { 401: errorResponses[401], 403: errorResponses[403] }
const one = { description: 'Business', content: json(businessManageResponseSchema) }

const ctx = (c: Context<AppEnv>): service.Ctx => {
  c.header('Cache-Control', 'no-store')
  return { db: c.get('db'), actor: c.get('actor'), requestId: c.get('requestId') }
}

const listRoute = createRoute({
  method: 'get',
  path: '/',
  tags,
  summary: 'Businesses the caller may manage (all, their villages, or their memberships)',
  request: { query: businessManageListQuerySchema },
  responses: {
    200: { description: 'Businesses', content: json(businessManageListResponseSchema) },
    ...authErrors,
    422: errorResponses[422],
  },
})

const createBusinessRoute = createRoute({
  method: 'post',
  path: '/',
  tags,
  summary: 'Create a draft business in a village (slug generated from the name)',
  request: { body: { content: json(businessCreateSchema), required: true } },
  responses: {
    201: one,
    ...authErrors,
    404: errorResponses[404],
    422: errorResponses[422],
  },
})

const getRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags,
  summary: 'Private view of one business',
  request: { params: idParam },
  responses: { 200: one, ...authErrors, 404: errorResponses[404] },
})

const updateRoute = createRoute({
  method: 'patch',
  path: '/{id}',
  tags,
  summary: 'Update fields; missing = unchanged, empty/null = cleared',
  request: { params: idParam, body: { content: json(businessUpdateSchema), required: true } },
  responses: {
    200: one,
    ...authErrors,
    404: errorResponses[404],
    409: conflict,
    422: errorResponses[422],
  },
})

const verifyRoute = createRoute({
  method: 'post',
  path: '/{id}/verify',
  tags,
  summary: 'Village admin accepts or rejects a pending business (rejection needs a note)',
  request: { params: idParam, body: { content: json(businessVerifySchema), required: true } },
  responses: {
    200: one,
    ...authErrors,
    404: errorResponses[404],
    409: conflict,
    422: errorResponses[422],
  },
})

const publishRoute = createRoute({
  method: 'post',
  path: '/{id}/publish',
  tags,
  summary: 'Show on public pages (needs verification, consent, WhatsApp number, no takedown)',
  request: { params: idParam },
  responses: { 200: one, ...authErrors, 404: errorResponses[404], 409: conflict },
})

const unpublishRoute = createRoute({
  method: 'post',
  path: '/{id}/unpublish',
  tags,
  summary: 'Hide from public pages (back to draft)',
  request: { params: idParam },
  responses: { 200: one, ...authErrors, 404: errorResponses[404] },
})

const takedownRoute = createRoute({
  method: 'post',
  path: '/{id}/takedown',
  tags,
  summary: 'Village admin hides a business; it cannot be republished until restored',
  request: { params: idParam, body: { content: json(businessTakedownSchema), required: true } },
  responses: {
    200: one,
    ...authErrors,
    404: errorResponses[404],
    409: conflict,
    422: errorResponses[422],
  },
})

const restoreRoute = createRoute({
  method: 'post',
  path: '/{id}/restore',
  tags,
  summary: 'Lift a takedown (the business stays a draft)',
  request: { params: idParam },
  responses: { 200: one, ...authErrors, 404: errorResponses[404], 409: conflict },
})

const deleteRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  tags,
  summary: 'Soft delete (village admin)',
  request: { params: idParam },
  responses: {
    204: { description: 'Deleted' },
    ...authErrors,
    404: errorResponses[404],
  },
})

export const manageBusinessRoutes = createRouter()
  .openapi(listRoute, async (c) => c.json(await service.list(ctx(c), c.req.valid('query')), 200))
  .openapi(createBusinessRoute, async (c) =>
    c.json(await service.create(ctx(c), c.req.valid('json')), 201),
  )
  .openapi(getRoute, async (c) => c.json(await service.get(ctx(c), c.req.valid('param').id), 200))
  .openapi(updateRoute, async (c) =>
    c.json(await service.update(ctx(c), c.req.valid('param').id, c.req.valid('json')), 200),
  )
  .openapi(verifyRoute, async (c) =>
    c.json(await service.verify(ctx(c), c.req.valid('param').id, c.req.valid('json')), 200),
  )
  .openapi(publishRoute, async (c) =>
    c.json(await service.publish(ctx(c), c.req.valid('param').id), 200),
  )
  .openapi(unpublishRoute, async (c) =>
    c.json(await service.unpublish(ctx(c), c.req.valid('param').id), 200),
  )
  .openapi(takedownRoute, async (c) =>
    c.json(await service.takedown(ctx(c), c.req.valid('param').id, c.req.valid('json')), 200),
  )
  .openapi(restoreRoute, async (c) =>
    c.json(await service.restore(ctx(c), c.req.valid('param').id), 200),
  )
  .openapi(deleteRoute, async (c) => {
    await service.remove(ctx(c), c.req.valid('param').id)
    return c.body(null, 204)
  })
