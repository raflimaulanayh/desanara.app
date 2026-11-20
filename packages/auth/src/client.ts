import { emailOTPClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

/** Browser/React auth client for apps/dashboard (and apps/web if it ever needs a session). */
export function createUmkmAuthClient(baseURL: string) {
  return createAuthClient({
    baseURL,
    fetchOptions: { credentials: 'include' },
    plugins: [emailOTPClient()],
  })
}

export type UmkmAuthClient = ReturnType<typeof createUmkmAuthClient>
