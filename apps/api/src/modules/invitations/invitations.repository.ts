import {
  type Database,
  businesses,
  businessMembers,
  invitations,
  users,
  villageMembers,
  villages,
} from '@repo/db'
import { aliasedTable, and, count, desc, eq, gt, isNull, sql } from 'drizzle-orm'
import type { DbOrTx } from '../../lib/audit'

export async function findLiveVillage(db: Database, id: string) {
  const [row] = await db
    .select({ id: villages.id, name: villages.name })
    .from(villages)
    .where(and(eq(villages.id, id), isNull(villages.deletedAt)))
  return row ?? null
}

export async function findLiveBusiness(db: Database, id: string) {
  const [row] = await db
    .select({ id: businesses.id, name: businesses.name, villageId: businesses.villageId })
    .from(businesses)
    .where(and(eq(businesses.id, id), isNull(businesses.deletedAt)))
  return row ?? null
}

/**
 * Invitations this person created in the last 24 hours (daily cap). Call inside the insert
 * transaction after `lockInviter`, so parallel requests cannot all pass the cap.
 */
export async function countRecentBy(db: DbOrTx, userId: string) {
  const [row] = await db
    .select({ n: count() })
    .from(invitations)
    .where(
      and(
        eq(invitations.createdBy, userId),
        gt(invitations.createdAt, sql`now() - interval '24 hours'`),
      ),
    )
  return row?.n ?? 0
}

/** Serialises one person's invitation creates until the transaction ends. */
export async function lockInviter(tx: DbOrTx, userId: string) {
  await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`invitations:${userId}`}))`)
}

export type NewInvitation = typeof invitations.$inferInsert

export async function insertInvitation(tx: DbOrTx, values: NewInvitation) {
  const [row] = await tx.insert(invitations).values(values).returning({ id: invitations.id })
  return row!.id
}

const inviter = aliasedTable(users, 'inviter')

/** One invitation with the names the acceptance page shows. */
export async function findByTokenHash(db: Database, tokenHash: string) {
  const [row] = await db
    .select({
      id: invitations.id,
      target: invitations.target,
      villageId: invitations.villageId,
      businessId: invitations.businessId,
      villageRole: invitations.villageRole,
      businessRole: invitations.businessRole,
      inviteeName: invitations.inviteeName,
      inviteeEmail: invitations.inviteeEmail,
      status: invitations.status,
      expiresAt: invitations.expiresAt,
      villageName: villages.name,
      villageDeletedAt: villages.deletedAt,
      businessName: businesses.name,
      businessDeletedAt: businesses.deletedAt,
      inviterName: inviter.name,
    })
    .from(invitations)
    .leftJoin(businesses, eq(businesses.id, invitations.businessId))
    .leftJoin(villages, eq(villages.id, invitations.villageId))
    .innerJoin(inviter, eq(inviter.id, invitations.createdBy))
    .where(eq(invitations.tokenHash, tokenHash))
  return row ?? null
}

export type InvitationRow = NonNullable<Awaited<ReturnType<typeof findByTokenHash>>>

export async function findById(db: Database, id: string) {
  const [row] = await db
    .select({
      id: invitations.id,
      target: invitations.target,
      villageId: invitations.villageId,
      businessId: invitations.businessId,
      villageRole: invitations.villageRole,
      businessRole: invitations.businessRole,
      status: invitations.status,
      createdBy: invitations.createdBy,
    })
    .from(invitations)
    .where(eq(invitations.id, id))
  return row ?? null
}

/** Pending, unexpired invitations of one village (its own roles) or one business. */
export async function listPending(
  db: Database,
  filter: { villageId?: string; businessId?: string },
) {
  return db
    .select({
      id: invitations.id,
      villageRole: invitations.villageRole,
      businessRole: invitations.businessRole,
      inviteeName: invitations.inviteeName,
      inviteeEmail: invitations.inviteeEmail,
      inviterName: inviter.name,
      createdAt: invitations.createdAt,
      expiresAt: invitations.expiresAt,
    })
    .from(invitations)
    .innerJoin(inviter, eq(inviter.id, invitations.createdBy))
    .where(
      and(
        eq(invitations.status, 'pending'),
        gt(invitations.expiresAt, sql`now()`),
        filter.businessId
          ? eq(invitations.businessId, filter.businessId)
          : and(eq(invitations.villageId, filter.villageId!), isNull(invitations.businessId)),
      ),
    )
    .orderBy(desc(invitations.createdAt))
    .limit(100)
}

/** Flips a pending, unexpired invitation to accepted. Null when someone else got there first. */
export async function claim(tx: DbOrTx, id: string, userId: string) {
  const [row] = await tx
    .update(invitations)
    .set({ status: 'accepted', acceptedBy: userId, acceptedAt: new Date() })
    .where(
      and(
        eq(invitations.id, id),
        eq(invitations.status, 'pending'),
        gt(invitations.expiresAt, sql`now()`),
      ),
    )
    .returning({ id: invitations.id })
  return row ?? null
}

export async function revoke(tx: DbOrTx, id: string) {
  const [row] = await tx
    .update(invitations)
    .set({ status: 'revoked' })
    .where(and(eq(invitations.id, id), eq(invitations.status, 'pending')))
    .returning({ id: invitations.id })
  return row ?? null
}

type MembershipTarget = Pick<
  InvitationRow,
  'villageId' | 'businessId' | 'villageRole' | 'businessRole'
>

/** The person's current role on the invitation's village or business, if any. */
export async function findMembershipRole(tx: DbOrTx, inv: MembershipTarget, userId: string) {
  if (inv.businessId) {
    const [row] = await tx
      .select({ role: businessMembers.role })
      .from(businessMembers)
      .where(
        and(eq(businessMembers.businessId, inv.businessId), eq(businessMembers.userId, userId)),
      )
    return row?.role ?? null
  }
  const [row] = await tx
    .select({ role: villageMembers.role })
    .from(villageMembers)
    .where(and(eq(villageMembers.villageId, inv.villageId!), eq(villageMembers.userId, userId)))
  return row?.role ?? null
}

/** Adds the membership, or raises an existing lower one to the invited role. */
export async function upsertMembership(tx: DbOrTx, inv: MembershipTarget, userId: string) {
  if (inv.businessId && inv.businessRole) {
    await tx
      .insert(businessMembers)
      .values({ businessId: inv.businessId, userId, role: inv.businessRole })
      .onConflictDoUpdate({
        target: [businessMembers.businessId, businessMembers.userId],
        set: { role: inv.businessRole },
      })
    return
  }
  await tx
    .insert(villageMembers)
    .values({ villageId: inv.villageId!, userId, role: inv.villageRole! })
    .onConflictDoUpdate({
      target: [villageMembers.villageId, villageMembers.userId],
      set: { role: inv.villageRole! },
    })
}

export async function findUserByEmail(db: DbOrTx, email: string) {
  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
  return row ?? null
}
