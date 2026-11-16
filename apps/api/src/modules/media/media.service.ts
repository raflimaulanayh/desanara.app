import { type Actor, ForbiddenError } from '@repo/auth/permissions'
import type { Database } from '@repo/db'
import {
  type MediaAttachInput,
  type MediaPresignInput,
  type MediaRemoveQuery,
  extensionFor,
  mediaContentTypes,
  mediaRules,
} from '@repo/validators'
import { writeAudit } from '../../lib/audit'
import { AppError } from '../../lib/errors'
import type { Storage } from '../../lib/storage'
import { MANAGED_PREFIX, targets } from './media.targets'

/**
 * Image uploads in three steps (docs/architecture/storage.md):
 * 1. `presign`: permission + limits checked, a 5-minute PUT URL signed for that exact type and size.
 * 2. The browser PUTs the compressed file straight to R2 (the API never carries the bytes).
 * 3. `attach`: the API checks the object in R2 (exists, type, size, key belongs to the entity) and
 *    records it. Files that fail the check are deleted right away.
 * Files never attached (tab closed mid-upload) are removed by scripts/clean-orphan-media.ts.
 */

export interface Ctx {
  db: Database
  storage: Storage | null
  actor: Actor | null
  requestId?: string
}

const PRESIGN_SECONDS = 5 * 60
const keyTail = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(webp|jpg)$/

function requireStorage(ctx: Ctx): Storage {
  if (!ctx.storage) {
    throw new AppError(503, 'SERVICE_UNAVAILABLE', 'File storage is not configured')
  }
  return ctx.storage
}

async function loadAuthorized(ctx: Ctx, target: MediaPresignInput['target'], id: string) {
  const def = targets[target]
  if (!ctx.actor) throw new ForbiddenError('product.update')
  const entity = await def.load(ctx.db, id)
  if (!entity) throw AppError.notFound('Entity')
  def.authorize(ctx.actor, entity, id)
  return { def, entity, actor: ctx.actor, rule: mediaRules[target] }
}

const isFull = (count: number, maxCount: number) => maxCount > 1 && count >= maxCount

async function deleteQuietly(storage: Storage, key: string) {
  if (!key.startsWith(MANAGED_PREFIX)) return
  try {
    await storage.delete(key)
  } catch (e) {
    // The row is already gone; a leftover file is only storage, and the clean-up script catches it.
    console.error('media: could not delete', key, e)
  }
}

export async function presign(ctx: Ctx, input: MediaPresignInput) {
  const storage = requireStorage(ctx)
  const { def, entity, rule } = await loadAuthorized(ctx, input.target, input.id)
  if (isFull(entity.keys.length, rule.maxCount)) {
    throw AppError.conflict(`At most ${rule.maxCount} files`, 'TOO_MANY_FILES')
  }
  const key = `${def.prefix(entity, input.id)}${crypto.randomUUID()}.${extensionFor(input.contentType)}`
  const uploadUrl = await storage.presignPut(key, {
    contentType: input.contentType,
    size: input.size,
    expiresIn: PRESIGN_SECONDS,
  })
  return {
    data: {
      key,
      uploadUrl,
      method: 'PUT' as const,
      /** Send exactly these headers; the browser sets Content-Length from the body. */
      headers: { 'Content-Type': input.contentType },
      expiresAt: new Date(Date.now() + PRESIGN_SECONDS * 1000).toISOString(),
    },
  }
}

export async function attach(ctx: Ctx, input: MediaAttachInput) {
  const storage = requireStorage(ctx)
  const { def, entity, actor, rule } = await loadAuthorized(ctx, input.target, input.id)

  const prefix = def.prefix(entity, input.id)
  if (!input.key.startsWith(prefix) || !keyTail.test(input.key.slice(prefix.length))) {
    throw AppError.invalid('key', 'File ini bukan milik data tersebut')
  }
  if (entity.keys.includes(input.key)) return { data: { keys: entity.keys } }
  if (isFull(entity.keys.length, rule.maxCount)) {
    await deleteQuietly(storage, input.key)
    throw AppError.conflict(`At most ${rule.maxCount} files`, 'TOO_MANY_FILES')
  }

  const object = await storage.head(input.key)
  if (!object) throw AppError.invalid('key', 'File belum selesai diunggah')
  const typeOk = (mediaContentTypes as readonly string[]).includes(object.contentType ?? '')
  if (!typeOk || object.size > rule.maxBytes) {
    await deleteQuietly(storage, input.key)
    throw AppError.invalid('key', 'File harus gambar WebP/JPEG dan tidak melebihi batas ukuran')
  }

  const replaced = rule.maxCount === 1 ? (entity.keys[0] ?? null) : null
  await ctx.db.transaction(async (tx) => {
    await def.attach(tx, input.id, input.key, input.alt ?? null)
    await writeAudit(tx, {
      actorId: actor.userId,
      villageId: entity.villageId,
      action: 'media.attach',
      entityType: def.entityType,
      entityId: input.id,
      changes: { target: input.target, key: input.key, replaced, size: object.size },
      requestId: ctx.requestId,
    })
  })
  if (replaced && replaced !== input.key) await deleteQuietly(storage, replaced)

  const after = await def.load(ctx.db, input.id)
  return { data: { keys: after?.keys ?? [] } }
}

export async function remove(ctx: Ctx, input: MediaRemoveQuery) {
  const storage = requireStorage(ctx)
  const { def, entity, actor } = await loadAuthorized(ctx, input.target, input.id)
  if (!entity.keys.includes(input.key)) throw AppError.notFound('File')
  const blocked = entity.removeBlocked?.(input.key)
  if (blocked) {
    throw AppError.conflict('A published product needs at least one photo', blocked)
  }

  await ctx.db.transaction(async (tx) => {
    if (!(await def.detach(tx, input.id, input.key))) throw AppError.notFound('File')
    await writeAudit(tx, {
      actorId: actor.userId,
      villageId: entity.villageId,
      action: 'media.remove',
      entityType: def.entityType,
      entityId: input.id,
      changes: { target: input.target, key: input.key },
      requestId: ctx.requestId,
    })
  })
  await deleteQuietly(storage, input.key)
  const after = await def.load(ctx.db, input.id)
  return { data: { keys: after?.keys ?? [] } }
}
