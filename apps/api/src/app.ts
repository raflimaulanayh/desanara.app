import type { Auth } from '@repo/auth/server'
import type { Database } from '@repo/db'
import { Scalar } from '@scalar/hono-api-reference'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { requestId } from 'hono/request-id'
import { secureHeaders } from 'hono/secure-headers'
import { registerDocsAuth } from './lib/docs-auth'
import { errorBody, handleError } from './lib/errors'
import type { Storage } from './lib/storage'
import { createRouter } from './lib/router'
import { requireUser, sessionMiddleware } from './middleware/session'
import { healthRoutes } from './modules/health/health.routes'
import { meRoutes } from './modules/me/me.routes'
import { businessRoutes } from './modules/businesses/businesses.routes'
import { catalogRoutes } from './modules/catalog/catalog.routes'
import { eventRoutes } from './modules/events/events.routes'
import { manageBusinessRoutes } from './modules/manage-businesses/manage-businesses.routes'
import { mediaRoutes } from './modules/media/media.routes'
import { manageProductRoutes } from './modules/manage-products/manage-products.routes'
import { regionRoutes } from './modules/regions/regions.routes'
import { villageRoutes } from './modules/villages/villages.routes'

/**
 * Who may read the API reference (/docs, /openapi.json).
 * `open` locally, `password` (branded login page + signed cookie) in production, `off` when
 * production has no DOCS_PASSWORD.
 */
export type DocsAccess =
  { mode: 'open' } | { mode: 'password'; username: string; password: string } | { mode: 'off' }

export interface AppDeps {
  db: Database
  auth: Auth
  storage?: Storage | null
  trustedOrigins: string[]
  logRequests?: boolean
  docs?: DocsAccess
}

/**
 * Builds the API. Dependencies are injected so tests can pass fakes.
 * Add a module: create src/modules/<name>/{<name>.routes,service,repository,schema}.ts
 * and chain `.route('/v1/<name>', <name>Routes)` below (keep the chain for RPC types).
 */
export function createApp({
  db,
  auth,
  storage = null,
  trustedOrigins,
  logRequests = true,
  docs = { mode: 'open' },
}: AppDeps) {
  const app = createRouter()

  app.use('*', requestId())
  if (logRequests) app.use('*', logger())
  app.use('*', secureHeaders())
  app.use('*', cors({ origin: trustedOrigins, credentials: true, maxAge: 600 }))
  app.use('*', async (c, next) => {
    c.set('db', db)
    c.set('auth', auth)
    c.set('storage', storage)
    await next()
  })

  // Better Auth owns /api/auth/* (sign-in, sign-up, sessions).
  app.on(['GET', 'POST'], '/api/auth/*', (c) => auth.handler(c.req.raw))

  app.use('/v1/*', sessionMiddleware)
  // Everything under /v1/manage is the logged-in dashboard: private, never cached.
  app.use('/v1/manage/*', requireUser)

  const routes = app
    .route('/health', healthRoutes)
    .route('/v1/me', meRoutes)
    .route('/v1/villages', villageRoutes)
    .route('/v1/businesses', businessRoutes)
    .route('/v1/regions', regionRoutes)
    .route('/v1/events', eventRoutes)
    .route('/v1/manage/businesses', manageBusinessRoutes)
    .route('/v1/manage/media', mediaRoutes)
    .route('/v1/manage', manageProductRoutes)
    .route('/v1', catalogRoutes)

  if (docs.mode !== 'off') {
    if (docs.mode === 'password') {
      const guard = registerDocsAuth(app, docs)
      app.use('/docs', guard)
      app.use('/openapi.json', guard)
    }
    const docConfig = {
      openapi: '3.1.0',
      info: { title: 'Desanara API', version: '0.1.0' },
    } as const
    app.doc31('/openapi.json', docConfig)
    // The document is embedded in the page, so the reference renders from a single request.
    let document: object | undefined
    app.get(
      '/docs',
      Scalar(() => {
        document ??= app.getOpenAPI31Document(docConfig)
        return { content: document, pageTitle: 'Desanara API' }
      }),
    )
  }

  app.notFound((c) => c.json(errorBody(c, 'NOT_FOUND', 'Route not found'), 404))
  app.onError(handleError)

  return routes
}

export type AppType = ReturnType<typeof createApp>
