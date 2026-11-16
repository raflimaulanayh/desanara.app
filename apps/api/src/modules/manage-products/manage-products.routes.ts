import { createRoute, z } from '@hono/zod-openapi'
import {
  productCreateSchema,
  productManageListQuerySchema,
  productUpdateSchema,
} from '@repo/validators'
import type { Context } from 'hono'
import type { AppEnv } from '../../lib/context'
import { createRouter, errorResponseSchema, errorResponses } from '../../lib/router'
import {
  productManageListResponseSchema,
  productManageResponseSchema,
} from './manage-products.schema'
import * as service from './manage-products.service'

/**
 * Dashboard endpoints for products, mounted at /v1/manage behind `requireUser`:
 * - /businesses/{businessId}/products: list and create inside one business
 * - /products/{id}: read, edit, publish, delete one product
 * Public, cacheable reads stay in the `catalog` module (by slug).
 */

const tags = ['Manage: products']
const idParam = z.object({ id: z.uuid() })
const businessParam = z.object({ businessId: z.uuid() })
const json = <T extends z.ZodType>(schema: T) => ({ 'application/json': { schema } })
const conflict = {
  description: 'Business rule not met; `details.reason` says which',
  content: json(errorResponseSchema),
}
const authErrors = { 401: errorResponses[401], 403: errorResponses[403] }
const one = { description: 'Product', content: json(productManageResponseSchema) }

const ctx = (c: Context<AppEnv>): service.Ctx => {
  c.header('Cache-Control', 'no-store')
  return { db: c.get('db'), actor: c.get('actor'), requestId: c.get('requestId') }
}

const listRoute = createRoute({
  method: 'get',
  path: '/businesses/{businessId}/products',
  tags,
  summary: 'Products of one business, drafts included',
  request: { params: businessParam, query: productManageListQuerySchema },
  responses: {
    200: { description: 'Products', content: json(productManageListResponseSchema) },
    ...authErrors,
    404: errorResponses[404],
    422: errorResponses[422],
  },
})

const createProductRoute = createRoute({
  method: 'post',
  path: '/businesses/{businessId}/products',
  tags,
  summary: 'Create a draft product (slug generated from the name; price 0 = free)',
  request: { params: businessParam, body: { content: json(productCreateSchema), required: true } },
  responses: {
    201: one,
    ...authErrors,
    404: errorResponses[404],
    422: errorResponses[422],
  },
})

const getRoute = createRoute({
  method: 'get',
  path: '/products/{id}',
  tags,
  summary: 'Private view of one product',
  request: { params: idParam },
  responses: { 200: one, ...authErrors, 404: errorResponses[404] },
})

const updateRoute = createRoute({
  method: 'patch',
  path: '/products/{id}',
  tags,
  summary:
    'Update fields; missing = unchanged, empty/null = cleared, `en: null` drops the translation',
  request: { params: idParam, body: { content: json(productUpdateSchema), required: true } },
  responses: { 200: one, ...authErrors, 404: errorResponses[404], 422: errorResponses[422] },
})

const publishRoute = createRoute({
  method: 'post',
  path: '/products/{id}/publish',
  tags,
  summary:
    'Show on public pages (needs a category and a photo; visible while the business is public)',
  request: { params: idParam },
  responses: { 200: one, ...authErrors, 404: errorResponses[404], 409: conflict },
})

const unpublishRoute = createRoute({
  method: 'post',
  path: '/products/{id}/unpublish',
  tags,
  summary: 'Hide from public pages (back to draft)',
  request: { params: idParam },
  responses: { 200: one, ...authErrors, 404: errorResponses[404] },
})

const deleteRoute = createRoute({
  method: 'delete',
  path: '/products/{id}',
  tags,
  summary: 'Soft delete',
  request: { params: idParam },
  responses: { 204: { description: 'Deleted' }, ...authErrors, 404: errorResponses[404] },
})

export const manageProductRoutes = createRouter()
  .openapi(listRoute, async (c) =>
    c.json(await service.list(ctx(c), c.req.valid('param').businessId, c.req.valid('query')), 200),
  )
  .openapi(createProductRoute, async (c) =>
    c.json(await service.create(ctx(c), c.req.valid('param').businessId, c.req.valid('json')), 201),
  )
  .openapi(getRoute, async (c) => c.json(await service.get(ctx(c), c.req.valid('param').id), 200))
  .openapi(updateRoute, async (c) =>
    c.json(await service.update(ctx(c), c.req.valid('param').id, c.req.valid('json')), 200),
  )
  .openapi(publishRoute, async (c) =>
    c.json(await service.publish(ctx(c), c.req.valid('param').id), 200),
  )
  .openapi(unpublishRoute, async (c) =>
    c.json(await service.unpublish(ctx(c), c.req.valid('param').id), 200),
  )
  .openapi(deleteRoute, async (c) => {
    await service.remove(ctx(c), c.req.valid('param').id)
    return c.body(null, 204)
  })
