/**
 * Better Auth client errors (`{ code, status }`) as message keys under `auth.error.*`.
 * Unknown codes fall back to a generic sentence: never show raw English to villagers.
 */
export interface AuthClientError {
  code?: string
  status?: number
}

const KNOWN = new Set([
  'INVALID_OTP',
  'OTP_EXPIRED',
  'TOO_MANY_ATTEMPTS',
  'INVALID_EMAIL_OR_PASSWORD',
  'PASSWORD_TOO_SHORT',
])

export function authErrorKey(error: AuthClientError | null | undefined): string {
  if (!error) return 'auth.error.generic'
  if (error.status === 429) return 'auth.error.rateLimited'
  if (error.code && KNOWN.has(error.code)) return `auth.error.${error.code}`
  return 'auth.error.generic'
}

/** Signing in with an email that has not been verified yet (Better Auth sends a code then). */
export const isUnverified = (error: AuthClientError | null | undefined) =>
  error?.code === 'EMAIL_NOT_VERIFIED'
