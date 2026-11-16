import { type Actor, ForbiddenError, assertCan, can } from '@repo/auth/permissions'
import type { Database } from '@repo/db'
import type { VillageListQuery, VillageSettingsInput } from '@repo/validators'
import { diffFields, writeAudit } from '../../lib/audit'
import { AppError } from '../../lib/errors'
import * as repo from './manage-villages.repository'
import type { VillageSettings } from './manage-villages.schema'

export interface Ctx {
  db: Database
  actor: Actor | null
  requestId?: string
}

const pointOf = (lat: number | null, lng: number | null) =>
  lat !== null && lng !== null ? { lat, lng } : null

function toDto(row: repo.VillageRow, actor: Actor): VillageSettings {
  const center = pointOf(row.centerLat, row.centerLng)
  const regionPoint = pointOf(row.regionLat, row.regionLng)
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    status: row.status,
    description: row.description,
    contactPhone: row.contactPhone,
    contactEmail: row.contactEmail,
    address: row.address,
    region: row.regionCode
      ? { code: row.regionCode, fullName: row.regionFullName ?? '', point: regionPoint }
      : null,
    center,
    mapCenter: center ?? regionPoint,
    permissions: { update: can(actor, 'village.update', { type: 'village', villageId: row.id }) },
    updatedAt: row.updatedAt.toISOString(),
  }
}

/** Loads a live village and checks `action` on it (ids from the row, never from the request). */
async function load(ctx: Ctx, id: string, action: 'village.view' | 'village.update') {
  if (!ctx.actor) throw new ForbiddenError(action)
  const row = await repo.findVillage(ctx.db, id)
  if (!row) throw AppError.notFound('Village')
  assertCan(ctx.actor, action, { type: 'village', villageId: row.id })
  return { actor: ctx.actor, row }
}

export async function get(ctx: Ctx, id: string) {
  const { actor, row } = await load(ctx, id, 'village.view')
  return { data: toDto(row, actor) }
}

export async function update(ctx: Ctx, id: string, input: VillageSettingsInput) {
  const { actor, row } = await load(ctx, id, 'village.update')
  const patch: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(input)) if (value !== undefined) patch[key] = value
  const changes = diffFields(row, patch)
  if (Object.keys(changes).length === 0) return { data: toDto(row, actor) }

  await ctx.db.transaction(async (tx) => {
    await repo.updateVillage(tx, row.id, {
      ...Object.fromEntries(Object.keys(changes).map((k) => [k, patch[k]])),
      updatedAt: new Date(),
    })
    await writeAudit(tx, {
      actorId: actor.userId,
      villageId: row.id,
      action: 'village.update',
      entityType: 'village',
      entityId: row.id,
      changes,
      requestId: ctx.requestId,
    })
  })
  const fresh = await repo.findVillage(ctx.db, row.id)
  return { data: toDto(fresh!, actor) }
}

/**
 * Villages whose settings the caller may open: every village for a super admin (drafts too, so a
 * new village can be set up), otherwise the villages they belong to with `village.view`.
 */
export async function list(ctx: Ctx, query: VillageListQuery) {
  if (!ctx.actor) throw new ForbiddenError('village.view')
  const actor = ctx.actor
  const all = can(actor, 'village.create', { type: 'platform' })
  const ids = all
    ? null
    : Object.keys(actor.villageRoles).filter((villageId) =>
        can(actor, 'village.view', { type: 'village', villageId }),
      )
  const { rows, total } =
    ids && ids.length === 0
      ? { rows: [], total: 0 }
      : await repo.listVillages(ctx.db, { ids, ...query })
  return {
    data: rows.map(({ regionFullName, ...v }) => ({
      ...v,
      regionFullName,
      permissions: { update: can(actor, 'village.update', { type: 'village', villageId: v.id }) },
    })),
    meta: { page: query.page, pageSize: query.pageSize, total },
  }
}
