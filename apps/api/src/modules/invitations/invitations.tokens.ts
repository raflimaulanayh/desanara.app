import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

/** 32 random bytes, URL-safe. Shown once in the link; only its hash is stored. */
export function newInvitationToken(): string {
  return randomBytes(32).toString('base64url')
}

export function hashInvitationToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/**
 * Proof that the person opened the link from the invitation email (`?e=` in that link only).
 * Bound to the invitation and the address, signed with the server secret, so the WhatsApp copy of
 * the link (without it) cannot skip email verification.
 */
export function emailProof(secret: string, invitationId: string, email: string): string {
  return createHmac('sha256', secret)
    .update(`invitation-email:${invitationId}:${email.toLowerCase()}`)
    .digest('base64url')
    .slice(0, 32)
}

export function isValidEmailProof(
  secret: string,
  invitationId: string,
  email: string,
  proof: string | undefined,
): boolean {
  if (!proof) return false
  const expected = Buffer.from(emailProof(secret, invitationId, email))
  const given = Buffer.from(proof)
  return expected.length === given.length && timingSafeEqual(expected, given)
}
