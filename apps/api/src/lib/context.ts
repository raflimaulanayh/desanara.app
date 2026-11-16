import type { Actor } from '@repo/auth/permissions'
import type { Auth } from '@repo/auth/server'
import type { Database } from '@repo/db'
import type { Storage } from './storage'

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
    /** Null when R2 is not configured (uploads answer 503). */
    storage: Storage | null
    user: SessionUser | null
    actor: Actor | null
  }
}
