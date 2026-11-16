import { type Action, type Actor, ForbiddenError, assertCan, can } from '@repo/auth/permissions'
import type { Database } from '@repo/db'
import {
  type BusinessCreateInput,
  type BusinessTakedownInput,
  type BusinessUpdateInput,
  type BusinessVerifyInput,
  slugWithSuffix,
  toSlug,
} from '@repo/validators'
import { diffFields, writeAudit } from '../../lib/audit'
import { AppError } from '../../lib/errors'
import * as repo from './manage-businesses.repository'
import type { BusinessManage } from './manage-businesses.schema'

/**
 * Dashboard management of businesses (UMKM). Every function authorizes with `assertCan()` using the
 * village/business ids from the database row, and every mutation writes `audit_logs` in the same
 * transaction. Rules that are not "who" questions (publish needs verification + consent, takedown
 * blocks publishing, …) live here, not in `can()`.
 */

export interface Ctx {
  db: Database
  actor: Actor | null
  requestId?: string
}

function requireActor(actor: Actor | null, action: Action): Actor {
  if (!actor) throw new ForbiddenError(action)
  return actor
}

const iso = (d: Date | null) => d?.toISOString() ?? null

export function toManageDto(row: repo.ManageBusinessRow, actor: Actor): BusinessManage {
  const business = { type: 'business', villageId: row.villageId, businessId: row.id } as const
  const village = { type: 'village', villageId: row.villageId } as const
  const { villageId, villageSlug, villageName, villageCenterLat, villageCenterLng, ...b } = row
  return {
    ...b,
    village: {
      id: villageId,
      slug: villageSlug,
      name: villageName,
      center:
        villageCenterLat !== null && villageCenterLng !== null
          ? { lat: villageCenterLat, lng: villageCenterLng }
          : null,
    },
    closedUntil: iso(b.closedUntil),
    verifiedAt: iso(b.verifiedAt),
    consentAt: iso(b.consentAt),
    takenDownAt: iso(b.takenDownAt),
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    permissions: {
      update: can(actor, 'business.update', business),
      publish: can(actor, 'business.publish', business),
      changeSlug: can(actor, 'business.change_slug', business),
      delete: can(actor, 'business.delete', business),
      verify: can(actor, 'business.verify', village),
      takedown: can(actor, 'business.takedown', village),
    },
  }
}

async function loadRow(ctx: Ctx, id: string) {
  const row = await repo.findById(ctx.db, id)
  if (!row) throw AppError.notFound('Business')
  return row
}

async function loadAuthorized(
  ctx: Ctx,
  id: string,
  action: 'business.view' | 'business.update' | 'business.publish' | 'business.delete',
) {
  const actor = requireActor(ctx.actor, action)
  const row = await loadRow(ctx, id)
  assertCan(actor, action, { type: 'business', villageId: row.villageId, businessId: row.id })
  return { actor, row }
}

async function reload(ctx: Ctx, actor: Actor, id: string) {
  return { data: toManageDto(await loadRow(ctx, id), actor) }
}

// ── Reads ────────────────────────────────────────────────────────────────────

export async function list(ctx: Ctx, filters: repo.ListFilters) {
  const actor = requireActor(ctx.actor, 'business.list')
  const scope: repo.ListScope = {
    all: can(actor, 'business.list_all', { type: 'platform' }),
    villageIds: Object.keys(actor.villageRoles).filter((villageId) =>
      can(actor, 'business.list', { type: 'village', villageId }),
    ),
    // A business membership (owner/assistant) always grants `business.view` on that business.
    businessIds: Object.keys(actor.businessRoles),
  }
  const { rows, total } = await repo.listForScope(ctx.db, scope, filters)
  return {
    data: rows.map((r) => toManageDto(r, actor)),
    meta: { page: filters.page, pageSize: filters.pageSize, total },
  }
}

export async function get(ctx: Ctx, id: string) {
  const { actor, row } = await loadAuthorized(ctx, id, 'business.view')
  return { data: toManageDto(row, actor) }
}

// ── Create ───────────────────────────────────────────────────────────────────

async function nextFreeSlug(ctx: Ctx, base: string) {
  const taken = new Set(await repo.slugsLike(ctx.db, base))
  let n = 1
  while (taken.has(slugWithSuffix(base, n))) n++
  return slugWithSuffix(base, n)
}

const isUniqueViolation = (e: unknown) =>
  typeof e === 'object' && e !== null && 'code' in e && (e as { code: string }).code === '23505'

export async function create(ctx: Ctx, input: BusinessCreateInput) {
  const actor = requireActor(ctx.actor, 'business.create')
  const village = await repo.findLiveVillage(ctx.db, input.villageId)
  if (!village) throw AppError.notFound('Village')
  assertCan(actor, 'business.create', { type: 'village', villageId: village.id })

  const { villageId: _villageId, consentGiven, ...fields } = input
  const now = new Date()
  const base = toSlug(input.name)

  // Two people creating "Kopi Gayo" at once can race for the same slug; retry on the unique index.
  for (let attempt = 0; ; attempt++) {
    const slug = await nextFreeSlug(ctx, base)
    try {
      const id = await ctx.db.transaction(async (tx) => {
        const id = await repo.insertBusiness(tx, {
          ...fields,
          villageId: village.id,
          slug,
          status: 'draft',
          verificationStatus: 'pending',
          consentAt: consentGiven ? now : null,
          consentMethod: consentGiven ? 'paper_form' : null,
          consentRecordedBy: consentGiven ? actor.userId : null,
          createdBy: actor.userId,
          updatedBy: actor.userId,
        })
        // Whoever cannot manage it through a village role (a village assistant) becomes its
        // assistant, so they keep access (docs/architecture/auth-rbac.md).
        const resource = { type: 'business', villageId: village.id, businessId: id } as const
        if (!can(actor, 'business.update', resource)) {
          await repo.addMember(tx, id, actor.userId, 'assistant')
        }
        await writeAudit(tx, {
          actorId: actor.userId,
          villageId: village.id,
          action: 'business.create',
          entityType: 'business',
          entityId: id,
          changes: { ...fields, slug, consentGiven },
          requestId: ctx.requestId,
        })
        return id
      })
      const resource = { type: 'business', villageId: village.id, businessId: id } as const
      const effective: Actor = can(actor, 'business.update', resource)
        ? actor
        : { ...actor, businessRoles: { ...actor.businessRoles, [id]: 'assistant' } }
      return reload(ctx, effective, id)
    } catch (e) {
      if (isUniqueViolation(e) && attempt < 3) continue
      throw e
    }
  }
}

// ── Update ───────────────────────────────────────────────────────────────────

/**
 * Partial update: missing = unchanged, null = cleared. Only changed fields are written and audited
 * (a WhatsApp number change is visible in `audit_logs`). Editing a rejected business sends it back
 * to review.
 */
export async function update(ctx: Ctx, id: string, input: BusinessUpdateInput) {
  const { actor, row } = await loadAuthorized(ctx, id, 'business.update')
  const { consentGiven, slug, closedUntil, ...rest } = input

  const patch: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(rest)) if (value !== undefined) patch[key] = value
  if (closedUntil !== undefined) patch.closedUntil = closedUntil ? new Date(closedUntil) : null

  if (slug !== undefined && slug !== row.slug) {
    assertCan(actor, 'business.change_slug', {
      type: 'business',
      villageId: row.villageId,
      businessId: row.id,
    })
    if (await repo.slugExists(ctx.db, slug)) {
      throw AppError.conflict('This slug is already used by another business', 'SLUG_TAKEN')
    }
    patch.slug = slug
  }

  const changes = diffFields(row, patch)

  // Consent (UU PDP): given = recorded from the signed paper form; withdrawn = hide right away.
  const consentPatch: Record<string, unknown> = {}
  if (consentGiven === true && !row.consentAt) {
    Object.assign(consentPatch, {
      consentAt: new Date(),
      consentMethod: 'paper_form',
      consentRecordedBy: actor.userId,
    })
    changes.consent = { from: null, to: 'paper_form' }
  } else if (consentGiven === false && row.consentAt) {
    Object.assign(consentPatch, { consentAt: null, consentMethod: null, consentRecordedBy: null })
    if (row.status === 'published') consentPatch.status = 'draft'
    changes.consent = { from: row.consentMethod, to: null }
  }

  if (Object.keys(changes).length === 0) return { data: toManageDto(row, actor) }

  // A rejected business goes back to the review queue once it has been edited.
  const reviewPatch =
    row.verificationStatus === 'rejected' ? { verificationStatus: 'pending' as const } : {}

  const finalPatch = Object.fromEntries(
    Object.keys(changes)
      .filter((k) => k !== 'consent')
      .map((k) => [k, patch[k]]),
  )

  await ctx.db.transaction(async (tx) => {
    await repo.updateBusiness(tx, id, {
      ...finalPatch,
      ...consentPatch,
      ...reviewPatch,
      updatedBy: actor.userId,
    })
    await writeAudit(tx, {
      actorId: actor.userId,
      villageId: row.villageId,
      action: 'business.update',
      entityType: 'business',
      entityId: id,
      changes,
      requestId: ctx.requestId,
    })
  })
  return reload(ctx, actor, id)
}

// ── State changes ────────────────────────────────────────────────────────────

async function applyStateChange(
  ctx: Ctx,
  actor: Actor,
  row: repo.ManageBusinessRow,
  action: string,
  values: Parameters<typeof repo.updateBusiness>[2],
  changes: Record<string, unknown>,
) {
  await ctx.db.transaction(async (tx) => {
    await repo.updateBusiness(tx, row.id, { ...values, updatedBy: actor.userId })
    await writeAudit(tx, {
      actorId: actor.userId,
      villageId: row.villageId,
      action,
      entityType: 'business',
      entityId: row.id,
      changes,
      requestId: ctx.requestId,
    })
  })
  return reload(ctx, actor, row.id)
}

export async function verify(ctx: Ctx, id: string, input: BusinessVerifyInput) {
  const actor = requireActor(ctx.actor, 'business.verify')
  const row = await loadRow(ctx, id)
  assertCan(actor, 'business.verify', { type: 'village', villageId: row.villageId })
  if (row.verificationStatus !== 'pending') {
    throw AppError.conflict('Only businesses waiting for review can be reviewed', 'NOT_PENDING')
  }
  const verified = input.decision === 'verified'
  return applyStateChange(
    ctx,
    actor,
    row,
    'business.verify',
    {
      verificationStatus: input.decision,
      verificationNote: input.note ?? null,
      verifiedAt: verified ? new Date() : null,
      verifiedBy: verified ? actor.userId : null,
    },
    { decision: input.decision, note: input.note ?? null },
  )
}

export async function publish(ctx: Ctx, id: string) {
  const { actor, row } = await loadAuthorized(ctx, id, 'business.publish')
  if (row.takenDownAt) {
    throw AppError.conflict('A taken-down business cannot be published', 'TAKEN_DOWN')
  }
  if (row.verificationStatus !== 'verified') {
    throw AppError.conflict('The village admin has not verified this business yet', 'NOT_VERIFIED')
  }
  if (!row.consentAt) {
    throw AppError.conflict('The owner has not consented to publishing their data', 'NO_CONSENT')
  }
  if (!row.whatsappNumber) {
    throw AppError.conflict('Buyers need a WhatsApp number to order', 'NO_WHATSAPP')
  }
  if (row.status === 'published') return { data: toManageDto(row, actor) }
  return applyStateChange(
    ctx,
    actor,
    row,
    'business.publish',
    { status: 'published' },
    {
      status: { from: row.status, to: 'published' },
    },
  )
}

export async function unpublish(ctx: Ctx, id: string) {
  const { actor, row } = await loadAuthorized(ctx, id, 'business.publish')
  if (row.status !== 'published') return { data: toManageDto(row, actor) }
  return applyStateChange(
    ctx,
    actor,
    row,
    'business.unpublish',
    { status: 'draft' },
    {
      status: { from: row.status, to: 'draft' },
    },
  )
}

export async function takedown(ctx: Ctx, id: string, input: BusinessTakedownInput) {
  const actor = requireActor(ctx.actor, 'business.takedown')
  const row = await loadRow(ctx, id)
  assertCan(actor, 'business.takedown', { type: 'village', villageId: row.villageId })
  if (row.takenDownAt) throw AppError.conflict('Already taken down', 'ALREADY_TAKEN_DOWN')
  return applyStateChange(
    ctx,
    actor,
    row,
    'business.takedown',
    {
      takenDownAt: new Date(),
      takenDownBy: actor.userId,
      takedownReason: input.reason,
      status: 'draft',
    },
    { reason: input.reason, status: { from: row.status, to: 'draft' } },
  )
}

/** Lifts a takedown. The business stays a draft; its team publishes it again when ready. */
export async function restore(ctx: Ctx, id: string) {
  const actor = requireActor(ctx.actor, 'business.takedown')
  const row = await loadRow(ctx, id)
  assertCan(actor, 'business.takedown', { type: 'village', villageId: row.villageId })
  if (!row.takenDownAt) throw AppError.conflict('This business is not taken down', 'NOT_TAKEN_DOWN')
  return applyStateChange(
    ctx,
    actor,
    row,
    'business.restore',
    { takenDownAt: null, takenDownBy: null, takedownReason: null },
    { reason: row.takedownReason },
  )
}

/** Soft delete (duplicates, mistakes). Its products disappear from public pages with it. */
export async function remove(ctx: Ctx, id: string) {
  const { actor, row } = await loadAuthorized(ctx, id, 'business.delete')
  await ctx.db.transaction(async (tx) => {
    await repo.updateBusiness(tx, id, {
      deletedAt: new Date(),
      status: 'draft',
      updatedBy: actor.userId,
    })
    await writeAudit(tx, {
      actorId: actor.userId,
      villageId: row.villageId,
      action: 'business.delete',
      entityType: 'business',
      entityId: id,
      changes: { name: row.name, slug: row.slug },
      requestId: ctx.requestId,
    })
  })
}
