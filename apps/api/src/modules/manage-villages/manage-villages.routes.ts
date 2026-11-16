import { createRoute, z } from '@hono/zod-openapi'
import {
  villageListQuerySchema,
  villageSettingsSchema as villageSettingsInputSchema,
} from '@repo/validators'
import type { Context } from 'hono'
import type { AppEnv } from '../../lib/context'
import { createRouter, errorResponses } from '../../lib/router'
import { villageListResponseSchema, villageSettingsResponseSchema } from './manage-villages.schema'
import * as service from './manage-villages.service'

/**
 * "Pengaturan desa", mounted at /v1/manage/villages behind `requireUser`. Read: the village's
 * admins and assistants (`village.view`); edit: its admins (`village.update`).
 */

const tags = ['Manage: villages']
const idParam = z.object({ id: z.uuid() })
const json = <T extends z.ZodType>(schema: T) => ({ 'application/json': { schema } })
const authErrors = { 401: errorResponses[401], 403: errorResponses[403] }
const one = { description: 'Village settings', content: json(villageSettingsResponseSchema) }

const ctx = (c: Context<AppEnv>): service.Ctx => {
  c.header('Cache-Control', 'no-store')
  return { db: c.get('db'), actor: c.get('actor'), requestId: c.get('requestId') }
}

const listRoute = createRoute({
  method: 'get',
  path: '/',
  tags,
  summary: 'Villages whose settings the caller may open (super admin: all, drafts included)',
  request: { query: villageListQuerySchema },
  responses: {
    200: { description: 'Villages', content: json(villageListResponseSchema) },
    ...authErrors,
    422: errorResponses[422],
  },
})

const getRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags,
  summary: 'Village settings (profile and map centre)',
  request: { params: idParam },
  responses: { 200: one, ...authErrors, 404: errorResponses[404] },
})

const updateRoute = createRoute({
  method: 'patch',
  path: '/{id}',
  tags,
  summary: 'Edit the profile or move the map centre (null on both = back to the region point)',
  request: {
    params: idParam,
    body: { content: json(villageSettingsInputSchema), required: true },
  },
  responses: { 200: one, ...authErrors, 404: errorResponses[404], 422: errorResponses[422] },
})

export const manageVillageRoutes = createRouter()
  .openapi(listRoute, async (c) => c.json(await service.list(ctx(c), c.req.valid('query')), 200))
  .openapi(getRoute, async (c) => c.json(await service.get(ctx(c), c.req.valid('param').id), 200))
  .openapi(updateRoute, async (c) =>
    c.json(await service.update(ctx(c), c.req.valid('param').id, c.req.valid('json')), 200),
  )
