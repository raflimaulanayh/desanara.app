'use client'

import type { SuccessBody } from '@repo/api-client'
import { createContext, useContext } from 'react'
import type { api } from './api'

export type Session = SuccessBody<Awaited<ReturnType<typeof api.v1.me.$get>>>['data']

const SessionContext = createContext<Session | null>(null)

export const SessionProvider = SessionContext.Provider

/** The logged-in user, their roles and memberships. Only valid inside the (app) layout. */
export function useSession(): Session {
  const session = useContext(SessionContext)
  if (!session) throw new Error('useSession() outside the logged-in layout')
  return session
}
