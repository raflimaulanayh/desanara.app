import { hashPassword } from '@repo/auth/server'
import { accounts, users } from '@repo/db'
import type { DbOrTx } from './audit'

/**
 * Creates an email/password account the way Better Auth stores it (providerId "credential",
 * accountId = user id). Public sign-up is off, so this is the only way accounts are made:
 * from an accepted invitation, the seed, or tests.
 */
export async function createCredentialUser(
  tx: DbOrTx,
  input: { name: string; email: string; password: string; emailVerified: boolean },
) {
  const id = crypto.randomUUID()
  const passwordHash = await hashPassword(input.password)
  await tx.insert(users).values({
    id,
    name: input.name,
    email: input.email.toLowerCase(),
    emailVerified: input.emailVerified,
  })
  await tx.insert(accounts).values({
    id: crypto.randomUUID(),
    accountId: id,
    providerId: 'credential',
    userId: id,
    password: passwordHash,
  })
  return id
}
