import type { Actor } from '@repo/auth/permissions'
import type { Auth } from '@repo/auth/server'
import type { Database } from '@repo/db'

export interface SessionUser {
  id: string
  name: string
  email: string
}

/** Hono context typing shared by every router. */
export interface AppEnv {
  Variables: {
    requestId: string
    db: Database
    auth: Auth
    user: SessionUser | null
    actor: Actor | null
  }
}
