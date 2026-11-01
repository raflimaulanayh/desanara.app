import type { Auth } from '@repo/auth/server'
import type { Database } from '@repo/db'
import { Scalar } from '@scalar/hono-api-reference'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { requestId } from 'hono/request-id'
import { secureHeaders } from 'hono/secure-headers'
import { errorBody, handleError } from './lib/errors'
import { createRouter } from './lib/router'
import { sessionMiddleware } from './middleware/session'
import { healthRoutes } from './modules/health/health.routes'
import { meRoutes } from './modules/me/me.routes'
import { businessRoutes } from './modules/businesses/businesses.routes'
import { catalogRoutes } from './modules/catalog/catalog.routes'
import { eventRoutes } from './modules/events/events.routes'
import { regionRoutes } from './modules/regions/regions.routes'
import { villageRoutes } from './modules/villages/villages.routes'

export interface AppDeps {
  db: Database
  auth: Auth
  trustedOrigins: string[]
  logRequests?: boolean
}

/**
 * Builds the API. Dependencies are injected so tests can pass fakes.
 * Add a module: create src/modules/<name>/{<name>.routes,service,repository,schema}.ts
 * and chain `.route('/v1/<name>', <name>Routes)` below (keep the chain for RPC types).
 */
export function createApp({ db, auth, trustedOrigins, logRequests = true }: AppDeps) {
  const app = createRouter()

  app.use('*', requestId())
  if (logRequests) app.use('*', logger())
  app.use('*', secureHeaders())
  app.use('*', cors({ origin: trustedOrigins, credentials: true, maxAge: 600 }))
  app.use('*', async (c, next) => {
    c.set('db', db)
    c.set('auth', auth)
    await next()
  })

  // Better Auth owns /api/auth/* (sign-in, sign-up, sessions).
  app.on(['GET', 'POST'], '/api/auth/*', (c) => auth.handler(c.req.raw))

  app.use('/v1/*', sessionMiddleware)

  const routes = app
    .route('/health', healthRoutes)
    .route('/v1/me', meRoutes)
    .route('/v1/villages', villageRoutes)
    .route('/v1/businesses', businessRoutes)
    .route('/v1/regions', regionRoutes)
    .route('/v1/events', eventRoutes)
    .route('/v1', catalogRoutes)

  app.doc31('/openapi.json', {
    openapi: '3.1.0',
    info: { title: 'UMKM Desa API', version: '0.1.0' },
  })
  app.get('/docs', Scalar({ url: '/openapi.json', pageTitle: 'UMKM Desa API' }))

  app.notFound((c) => c.json(errorBody(c, 'NOT_FOUND', 'Route not found'), 404))
  app.onError(handleError)

  return routes
}

export type AppType = ReturnType<typeof createApp>
