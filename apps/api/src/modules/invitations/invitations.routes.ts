import { createRoute, z } from '@hono/zod-openapi'
import { invitationAcceptSchema, invitationCreateSchema } from '@repo/validators'
import type { Context } from 'hono'
import type { AppEnv } from '../../lib/context'
import { createRouter, errorResponses } from '../../lib/router'
import {
  acceptedInvitationSchema,
  createdInvitationSchema,
  invitationPreviewSchema,
  pendingInvitationSchema,
} from './invitations.schema'
import * as service from './invitations.service'

/**
 * Invitations are the only way to create an account (public sign-up is off).
 * Manage routes (/v1/manage/invitations) need a session; the public ones (/v1/invitations/{token})
 * are guarded by the token itself.
 */

const json = <T extends z.ZodType>(schema: T) => ({ 'application/json': { schema } })
const conflict = {
  description: 'Not usable (details.reason)',
  content: errorResponses[404].content,
}

const ctx = (c: Context<AppEnv>): service.Ctx => {
  c.header('Cache-Control', 'no-store')
  return {
    db: c.get('db'),
    actor: c.get('actor'),
    user: c.get('user'),
    mailer: c.get('mailer'),
    secret: c.get('secret'),
    dashboardUrl: c.get('dashboardUrl'),
    requestId: c.get('requestId'),
  }
}

const manageTags = ['Manage: invitations']

const createRouteDef = createRoute({
  method: 'post',
  path: '/',
  tags: manageTags,
  summary:
    'Invite someone with a fixed role (emailed when inviteeEmail is set; share the url by WhatsApp)',
  request: { body: { content: json(invitationCreateSchema), required: true } },
  responses: {
    201: { description: 'Invitation', content: json(z.object({ data: createdInvitationSchema })) },
    401: errorResponses[401],
    403: errorResponses[403],
    404: errorResponses[404],
    409: { ...conflict, description: 'DAILY_LIMIT' },
    422: errorResponses[422],
  },
})

const listRouteDef = createRoute({
  method: 'get',
  path: '/',
  tags: manageTags,
  summary: 'Pending invitations of a village (its staff) or a business',
  request: { query: z.object({ villageId: z.uuid().optional(), businessId: z.uuid().optional() }) },
  responses: {
    200: {
      description: 'Invitations',
      content: json(z.object({ data: z.array(pendingInvitationSchema) })),
    },
    401: errorResponses[401],
    403: errorResponses[403],
    404: errorResponses[404],
    422: errorResponses[422],
  },
})

const revokeRouteDef = createRoute({
  method: 'delete',
  path: '/{id}',
  tags: manageTags,
  summary: 'Revoke a pending invitation (its creator, or anyone allowed to create it)',
  request: { params: z.object({ id: z.uuid() }) },
  responses: {
    204: { description: 'Revoked' },
    401: errorResponses[401],
    403: errorResponses[403],
    404: errorResponses[404],
    409: { ...conflict, description: 'INVITATION_NOT_PENDING' },
  },
})

export const manageInvitationRoutes = createRouter()
  .openapi(createRouteDef, async (c) =>
    c.json(await service.create(ctx(c), c.req.valid('json')), 201),
  )
  .openapi(listRouteDef, async (c) => c.json(await service.list(ctx(c), c.req.valid('query')), 200))
  .openapi(revokeRouteDef, async (c) => {
    await service.revoke(ctx(c), c.req.valid('param').id)
    return c.body(null, 204)
  })

const publicTags = ['Invitations']
const tokenParam = z.object({ token: z.string().min(20).max(100) })

const previewRouteDef = createRoute({
  method: 'get',
  path: '/{token}',
  tags: publicTags,
  summary: 'What an invitation link offers (role, business or village, prefilled name and email)',
  request: { params: tokenParam },
  responses: {
    200: { description: 'Invitation', content: json(z.object({ data: invitationPreviewSchema })) },
    404: errorResponses[404],
    409: { ...conflict, description: 'USED | REVOKED | EXPIRED' },
  },
})

const acceptRouteDef = createRoute({
  method: 'post',
  path: '/{token}/accept',
  tags: publicTags,
  summary: 'Accept: create the account (name, email, password) or join with the current session',
  request: {
    params: tokenParam,
    body: { content: json(invitationAcceptSchema), required: true },
  },
  responses: {
    200: { description: 'Accepted', content: json(z.object({ data: acceptedInvitationSchema })) },
    404: errorResponses[404],
    409: { ...conflict, description: 'USED | REVOKED | EXPIRED | ACCOUNT_EXISTS | WRONG_ACCOUNT' },
    422: errorResponses[422],
  },
})

export const invitationRoutes = createRouter()
  .openapi(previewRouteDef, async (c) => {
    c.header('Cache-Control', 'no-store')
    return c.json(await service.preview(c.get('db'), c.req.valid('param').token), 200)
  })
  .openapi(acceptRouteDef, async (c) =>
    c.json(await service.accept(ctx(c), c.req.valid('param').token, c.req.valid('json')), 200),
  )
