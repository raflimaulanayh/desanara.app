import { type Actor, ForbiddenError, assertCan, can } from '@repo/auth/permissions'
import type { Database } from '@repo/db'
import { type Mailer, invitationEmail } from '@repo/email'
import {
  INVITATION_DAYS,
  INVITATIONS_PER_DAY,
  type InvitationAcceptInput,
  type InvitationCreateInput,
  type InvitationRole,
  ROLE_LABEL,
  ROLE_TARGET,
} from '@repo/validators'
import { createCredentialUser } from '../../lib/accounts'
import { writeAudit } from '../../lib/audit'
import type { SessionUser } from '../../lib/context'
import { AppError } from '../../lib/errors'
import * as repo from './invitations.repository'
import {
  emailProof,
  hashInvitationToken,
  isValidEmailProof,
  newInvitationToken,
} from './invitations.tokens'
import { isUniqueViolation } from '../../lib/db-errors'

export interface Ctx {
  db: Database
  actor: Actor | null
  user: SessionUser | null
  mailer: Mailer
  secret: string
  dashboardUrl: string
  requestId?: string
}

type Target =
  | { kind: 'village'; villageId: string; name: string }
  | { kind: 'business'; villageId: string; businessId: string; name: string }

async function loadTarget(
  db: Database,
  role: InvitationRole,
  ids: { villageId?: string | null; businessId?: string | null },
): Promise<Target> {
  if (ROLE_TARGET[role] === 'village') {
    const village = ids.villageId ? await repo.findLiveVillage(db, ids.villageId) : null
    if (!village) throw AppError.notFound('Village')
    return { kind: 'village', villageId: village.id, name: village.name }
  }
  const business = ids.businessId ? await repo.findLiveBusiness(db, ids.businessId) : null
  if (!business) throw AppError.notFound('Business')
  return {
    kind: 'business',
    villageId: business.villageId,
    businessId: business.id,
    name: business.name,
  }
}

/**
 * Who may invite whom (docs/plan/PLAN-registration-email.md): nobody can hand out a role above
 * their own. Village admins are invited by the super admin only. The same rule decides who may
 * see and revoke an invitation.
 */
function mayInvite(actor: Actor | null, role: InvitationRole, target: Target, assert = false) {
  const check = (assert ? assertCan : can) as typeof can
  if (target.kind === 'village') {
    if (role === 'village_admin') return check(actor, 'user.manage', { type: 'platform' })
    return check(actor, 'village.invite_members', { type: 'village', villageId: target.villageId })
  }
  const resource = {
    type: 'business',
    villageId: target.villageId,
    businessId: target.businessId,
  } as const
  return check(
    actor,
    role === 'owner' ? 'business.invite_owner' : 'business.invite_members',
    resource,
  )
}

const assertMayInvite = (actor: Actor | null, role: InvitationRole, target: Target) =>
  void mayInvite(actor, role, target, true)

/** Higher number = more rights. An invitation never lowers a role. */
const RANK: Record<InvitationRole, number> = {
  village_assistant: 1,
  village_admin: 2,
  assistant: 1,
  owner: 2,
}

const roleOf = (row: { villageRole: string | null; businessRole: string | null }) =>
  (row.businessRole ?? row.villageRole) as InvitationRole

const dateId = (d: Date) =>
  d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  })

export async function create(ctx: Ctx, input: InvitationCreateInput) {
  if (!ctx.actor || !ctx.user) throw AppError.unauthenticated()
  const target = await loadTarget(ctx.db, input.role, input)
  assertMayInvite(ctx.actor, input.role, target)

  const token = newInvitationToken()
  const expiresAt = new Date(Date.now() + INVITATION_DAYS * 24 * 60 * 60 * 1000)
  const isVillage = target.kind === 'village'
  const id = await ctx.db.transaction(async (tx) => {
    await repo.lockInviter(tx, ctx.actor!.userId)
    if ((await repo.countRecentBy(tx, ctx.actor!.userId)) >= INVITATIONS_PER_DAY) {
      throw AppError.conflict('Too many invitations in the last 24 hours', 'DAILY_LIMIT')
    }
    const id = await repo.insertInvitation(tx, {
      tokenHash: hashInvitationToken(token),
      target: target.kind,
      villageId: target.villageId,
      businessId: isVillage ? null : target.businessId,
      villageRole: isVillage ? (input.role as 'village_admin' | 'village_assistant') : null,
      businessRole: isVillage ? null : (input.role as 'owner' | 'assistant'),
      inviteeName: input.inviteeName ?? null,
      inviteeEmail: input.inviteeEmail ?? null,
      sentTo: input.inviteeEmail ?? null,
      expiresAt,
      createdBy: ctx.actor!.userId,
    })
    await writeAudit(tx, {
      actorId: ctx.actor!.userId,
      villageId: target.villageId,
      action: 'invitation.create',
      entityType: 'invitation',
      entityId: id,
      // The token is never logged.
      changes: { role: input.role, target: target.kind, inviteeEmail: input.inviteeEmail ?? null },
      requestId: ctx.requestId,
    })
    return id
  })

  const url = `${ctx.dashboardUrl}/undangan/${token}`
  let emailed = false
  if (input.inviteeEmail) {
    try {
      await ctx.mailer.send(
        invitationEmail({
          to: input.inviteeEmail,
          inviteeName: input.inviteeName ?? null,
          inviterName: ctx.user.name,
          roleLabel: ROLE_LABEL[input.role],
          targetName: target.name,
          url: `${url}?e=${emailProof(ctx.secret, id, input.inviteeEmail)}`,
          expiresOn: dateId(expiresAt),
        }),
      )
      emailed = true
    } catch (e) {
      // The link still works through WhatsApp; the dashboard says the email did not go out.
      console.error(`[invitation ${id}] email failed:`, (e as Error).message)
    }
  }

  return {
    data: {
      id,
      url,
      role: input.role,
      roleLabel: ROLE_LABEL[input.role],
      targetName: target.name,
      inviteeName: input.inviteeName ?? null,
      expiresAt: expiresAt.toISOString(),
      emailed,
    },
  }
}

/**
 * Pending invitations the caller could have created (and so may revoke). Invitee names and emails
 * are personal data: someone who cannot invite sees none.
 */
export async function list(ctx: Ctx, filter: { villageId?: string; businessId?: string }) {
  if (!ctx.actor) throw AppError.unauthenticated()
  let target: Target
  let roles: InvitationRole[]
  if (filter.businessId) {
    target = await loadTarget(ctx.db, 'owner', { businessId: filter.businessId })
    roles = ['owner', 'assistant']
  } else if (filter.villageId) {
    target = await loadTarget(ctx.db, 'village_assistant', { villageId: filter.villageId })
    roles = ['village_admin', 'village_assistant']
  } else {
    throw AppError.invalid('villageId', 'Pilih desa atau UMKM')
  }
  const visible = roles.filter((r) => mayInvite(ctx.actor, r, target))
  if (visible.length === 0) {
    throw new ForbiddenError(
      filter.businessId ? 'business.invite_members' : 'village.invite_members',
    )
  }
  const rows = (await repo.listPending(ctx.db, filter)).filter((r) => visible.includes(roleOf(r)))
  return {
    data: rows.map((r) => ({
      id: r.id,
      role: roleOf(r),
      roleLabel: ROLE_LABEL[roleOf(r)],
      inviteeName: r.inviteeName,
      inviteeEmail: r.inviteeEmail,
      inviterName: r.inviterName,
      createdAt: r.createdAt.toISOString(),
      expiresAt: r.expiresAt.toISOString(),
    })),
  }
}

/** Whoever may create this invitation today may revoke it (its creator included, while allowed). */
export async function revoke(ctx: Ctx, id: string) {
  if (!ctx.actor) throw AppError.unauthenticated()
  const row = await repo.findById(ctx.db, id)
  if (!row) throw AppError.notFound('Invitation')
  assertMayInvite(ctx.actor, roleOf(row), await loadTarget(ctx.db, roleOf(row), row))
  await ctx.db.transaction(async (tx) => {
    if (!(await repo.revoke(tx, id))) {
      throw AppError.conflict('This invitation is no longer pending', 'INVITATION_NOT_PENDING')
    }
    await writeAudit(tx, {
      actorId: ctx.actor!.userId,
      villageId: row.villageId,
      action: 'invitation.revoke',
      entityType: 'invitation',
      entityId: id,
      requestId: ctx.requestId,
    })
  })
}

/** Loads a usable invitation or explains (409 `details.reason`) why it cannot be used. */
async function usable(db: Database, token: string) {
  const row = await repo.findByTokenHash(db, hashInvitationToken(token))
  if (!row) throw AppError.notFound('Invitation')
  if (row.status === 'accepted') throw AppError.conflict('Invitation already used', 'USED')
  if (row.status === 'revoked') throw AppError.conflict('Invitation revoked', 'REVOKED')
  if (row.status === 'expired' || row.expiresAt <= new Date()) {
    throw AppError.conflict('Invitation expired', 'EXPIRED')
  }
  // The business or village was deleted after the invitation was sent.
  const gone = row.businessId ? !row.businessName || row.businessDeletedAt : false
  if (gone || !row.villageName || row.villageDeletedAt) {
    throw AppError.conflict('Invitation revoked', 'REVOKED')
  }
  return row
}

/**
 * Gives the invited role inside the accepting transaction. Someone who already has that role or a
 * higher one gets 409 ALREADY_MEMBER, and the rollback keeps the invitation usable.
 */
async function join(
  tx: Parameters<Parameters<Database['transaction']>[0]>[0],
  inv: repo.InvitationRow,
  userId: string,
) {
  const current = (await repo.findMembershipRole(tx, inv, userId)) as InvitationRole | null
  if (current && RANK[current] >= RANK[roleOf(inv)]) {
    throw AppError.conflict('Already a member with this role or a higher one', 'ALREADY_MEMBER')
  }
  await repo.upsertMembership(tx, inv, userId)
}

/** Public: what the acceptance page shows. Holding the token is the permission. */
export async function preview(db: Database, token: string) {
  const row = await usable(db, token)
  const role = roleOf(row)
  return {
    data: {
      role,
      roleLabel: ROLE_LABEL[role],
      targetName: (row.businessName ?? row.villageName)!,
      villageName: row.villageName,
      inviterName: row.inviterName,
      inviteeName: row.inviteeName,
      inviteeEmail: row.inviteeEmail,
      expiresAt: row.expiresAt.toISOString(),
      accountExists: row.inviteeEmail
        ? Boolean(await repo.findUserByEmail(db, row.inviteeEmail))
        : false,
    },
  }
}

/**
 * Accepts an invitation. Logged in: the current account joins. Otherwise a new account is created;
 * its email counts as verified only with the proof from the emailed link, else the dashboard signs
 * in, gets EMAIL_NOT_VERIFIED and asks for the 6-digit code Better Auth sends.
 */
export async function accept(ctx: Ctx, token: string, input: InvitationAcceptInput) {
  const inv = await usable(ctx.db, token)
  const audit = (tx: Parameters<Parameters<Database['transaction']>[0]>[0], userId: string) =>
    writeAudit(tx, {
      actorId: userId,
      villageId: inv.villageId,
      action: 'invitation.accept',
      entityType: 'invitation',
      entityId: inv.id,
      changes: { role: roleOf(inv) },
      requestId: ctx.requestId,
    })

  if (ctx.user) {
    const user = ctx.user
    if (inv.inviteeEmail && inv.inviteeEmail !== user.email.toLowerCase()) {
      throw AppError.conflict('This invitation is for another email address', 'WRONG_ACCOUNT')
    }
    await ctx.db.transaction(async (tx) => {
      if (!(await repo.claim(tx, inv.id, user.id))) {
        throw AppError.conflict('Invitation already used', 'USED')
      }
      await join(tx, inv, user.id)
      await audit(tx, user.id)
    })
    return { data: { email: user.email, emailVerified: true, joined: true } }
  }

  const { name, email, password } = input
  if (!name) throw AppError.invalid('name', 'Isi nama Anda')
  if (!email) throw AppError.invalid('email', 'Isi email Anda')
  if (!password) throw AppError.invalid('password', 'Buat password minimal 8 karakter')
  if (inv.inviteeEmail && inv.inviteeEmail !== email) {
    throw AppError.invalid('email', `Gunakan email yang diundang: ${inv.inviteeEmail}`)
  }
  if (await repo.findUserByEmail(ctx.db, email)) {
    throw AppError.conflict('An account with this email exists; sign in first', 'ACCOUNT_EXISTS')
  }
  const emailVerified =
    !!inv.inviteeEmail && isValidEmailProof(ctx.secret, inv.id, inv.inviteeEmail, input.emailProof)

  try {
    await ctx.db.transaction(async (tx) => {
      const userId = await createCredentialUser(tx, { name, email, password, emailVerified })
      if (!(await repo.claim(tx, inv.id, userId))) {
        throw AppError.conflict('Invitation already used', 'USED')
      }
      await join(tx, inv, userId)
      await audit(tx, userId)
    })
  } catch (e) {
    if (isUniqueViolation(e)) {
      throw AppError.conflict('An account with this email exists; sign in first', 'ACCOUNT_EXISTS')
    }
    throw e
  }
  return { data: { email, emailVerified, joined: true } }
}
