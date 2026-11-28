import { type Actor, ForbiddenError, assertCan, can } from '@repo/auth/permissions'
import type { Database } from '@repo/db'
import type { ReviewModerationInput, ReviewReplyInput } from '@repo/validators'
import { writeAudit } from '../../lib/audit'
import { AppError } from '../../lib/errors'
import * as repo from './manage-reviews.repository'
import type { ManageReview } from './manage-reviews.schema'

/**
 * Dashboard side of buyer reviews (PLAN-product-reviews).
 * - Village admins and assistants approve or reject (`review.moderate` on the village): a neutral party,
 *   so a business cannot hide honest criticism.
 * - The business sees all reviews of its products (`review.view`) and writes one public reply to an
 *   approved review (`review.reply`).
 * Ids for every check come from the review row, never from input. Every change is audited.
 */

export interface Ctx {
  db: Database
  actor: Actor | null
  requestId?: string
}

type Row = NonNullable<Awaited<ReturnType<typeof repo.findById>>>

function requireActor(actor: Actor | null): Actor {
  if (!actor) throw new ForbiddenError('review.view')
  return actor
}

const villageOf = (row: { villageId: string }) =>
  ({ type: 'village', villageId: row.villageId }) as const
const businessOf = (row: { villageId: string; businessId: string }) =>
  ({ type: 'business', villageId: row.villageId, businessId: row.businessId }) as const

function canSee(actor: Actor, row: Row) {
  return can(actor, 'review.moderate', villageOf(row)) || can(actor, 'review.view', businessOf(row))
}

export function toDto(row: Row, actor: Actor): ManageReview {
  return {
    id: row.id,
    villageId: row.villageId,
    business: { id: row.businessId, name: row.businessName },
    product: { id: row.productId, slug: row.productSlug, name: row.productName },
    reviewerName: row.reviewerName,
    rating: row.rating,
    body: row.body,
    locale: row.locale,
    status: row.status,
    rejectionReason: row.rejectionReason,
    moderatedAt: row.moderatedAt?.toISOString() ?? null,
    reply: row.reply,
    repliedAt: row.repliedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    canModerate: can(actor, 'review.moderate', villageOf(row)),
    canReply: row.status === 'approved' && can(actor, 'review.reply', businessOf(row)),
  }
}

/**
 * The queue of one village (moderators) or one business (its members). The super admin may list
 * without a scope. The scope is checked before any row is read.
 */
export async function listReviews(
  { db, actor: maybeActor }: Ctx,
  query: {
    villageId?: string
    businessId?: string
    status?: 'pending' | 'approved' | 'rejected'
    page: number
    pageSize: number
  },
) {
  const actor = requireActor(maybeActor)
  let scope: repo.ReviewScope
  if (query.businessId) {
    const business = await repo.findBusiness(db, query.businessId)
    if (!business) throw AppError.notFound('Business')
    if (
      !can(
        actor,
        'review.view',
        businessOf({ villageId: business.villageId, businessId: business.id }),
      ) &&
      !can(actor, 'review.moderate', villageOf(business))
    ) {
      throw new ForbiddenError('review.view')
    }
    scope = { businessIds: [business.id] }
  } else if (query.villageId) {
    assertCan(actor, 'review.moderate', { type: 'village', villageId: query.villageId })
    scope = { villageIds: [query.villageId] }
  } else if (actor.globalRole === 'super_admin') {
    scope = {}
  } else {
    throw AppError.invalid('villageId', 'Pilih desa atau UMKM')
  }

  const [rows, countRows] = await Promise.all([
    repo.list(db, scope, query.status, query.page, query.pageSize),
    repo.countByStatus(db, scope),
  ])
  const counts = { pending: 0, approved: 0, rejected: 0 }
  for (const { status, total } of countRows) counts[status] = total
  return {
    data: rows.map((row) => toDto(row, actor)),
    meta: {
      page: query.page,
      pageSize: query.pageSize,
      total: query.status
        ? counts[query.status]
        : counts.pending + counts.approved + counts.rejected,
      counts,
    },
  }
}

async function load(db: Database, actor: Actor, id: string) {
  const row = await repo.findById(db, id)
  // Hide reviews of other tenants behind the same 404 as a missing one.
  if (!row || !canSee(actor, row)) throw AppError.notFound('Review')
  return row
}

export async function moderateReview(
  { db, actor: maybeActor, requestId }: Ctx,
  id: string,
  input: ReviewModerationInput,
) {
  const actor = requireActor(maybeActor)
  const row = await load(db, actor, id)
  assertCan(actor, 'review.moderate', villageOf(row))
  const rejectionReason = input.status === 'rejected' ? (input.rejectionReason ?? null) : null
  await db.transaction(async (tx) => {
    await repo.update(tx, id, {
      status: input.status,
      rejectionReason,
      moderatedBy: actor.userId,
      moderatedAt: new Date(),
    })
    await writeAudit(tx, {
      actorId: actor.userId,
      villageId: row.villageId,
      action: 'review.moderate',
      entityType: 'product_review',
      entityId: id,
      changes: {
        status: { from: row.status, to: input.status },
        rejectionReason: { from: row.rejectionReason, to: rejectionReason },
      },
      requestId,
    })
  })
  return { data: toDto((await repo.findById(db, id))!, actor) }
}

export async function replyToReview(
  { db, actor: maybeActor, requestId }: Ctx,
  id: string,
  input: ReviewReplyInput | null,
) {
  const actor = requireActor(maybeActor)
  const row = await load(db, actor, id)
  assertCan(actor, 'review.reply', businessOf(row))
  if (input && row.status !== 'approved') {
    throw AppError.conflict('Only approved reviews can be answered', 'review_not_approved')
  }
  await db.transaction(async (tx) => {
    await repo.update(tx, id, {
      reply: input?.reply ?? null,
      repliedBy: input ? actor.userId : null,
      repliedAt: input ? new Date() : null,
    })
    await writeAudit(tx, {
      actorId: actor.userId,
      villageId: row.villageId,
      action: 'review.reply',
      entityType: 'product_review',
      entityId: id,
      changes: { reply: { from: row.reply, to: input?.reply ?? null } },
      requestId,
    })
  })
  return { data: toDto((await repo.findById(db, id))!, actor) }
}
