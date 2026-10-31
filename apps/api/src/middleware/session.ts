import { createMiddleware } from 'hono/factory'
import type { AppEnv } from '../lib/context'
import { loadActor } from '../lib/actor'
import { AppError } from '../lib/errors'

/** Resolves the Better Auth session (cookie or bearer) and the authorization actor. */
export const sessionMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const session = await c.get('auth').api.getSession({ headers: c.req.raw.headers })
  if (!session) {
    c.set('user', null)
    c.set('actor', null)
    return next()
  }
  c.set('user', { id: session.user.id, name: session.user.name, email: session.user.email })
  c.set('actor', await loadActor(c.get('db'), session.user.id))
  return next()
})

/** Use on routers that require a logged-in user. */
export const requireUser = createMiddleware<AppEnv>(async (c, next) => {
  if (!c.get('user')) throw AppError.unauthenticated()
  return next()
})
