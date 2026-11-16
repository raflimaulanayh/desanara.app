import { type Actor, assertCan } from '@repo/auth/permissions'
import type { MediaTarget } from '@repo/validators'
import type { DbOrTx } from '../../lib/audit'
import * as repo from './media.repository'

/**
 * Where each kind of image lives and who may change it. Limits (size, count, edge) are in
 * `mediaRules` (@repo/validators) so the dashboard compresses to the same numbers.
 * To add a target: add it to `mediaTargets`/`mediaRules`, then add an entry here.
 */

export interface LoadedEntity {
  villageId: string
  /** Keys currently attached, in display order. */
  keys: string[]
  /** Why removing `key` is not allowed right now (a 409 reason), or null. */
  removeBlocked?: (key: string) => string | null
}

export interface TargetDef {
  entityType: 'product' | 'business' | 'village'
  load(db: DbOrTx, id: string): Promise<LoadedEntity | null>
  authorize(actor: Actor, entity: LoadedEntity, id: string): void
  /** Folder of this entity's files, ending in "/". */
  prefix(entity: LoadedEntity, id: string): string
  /** Attach `key`. Single-slot targets overwrite; the service then deletes the old file. */
  attach(tx: DbOrTx, id: string, key: string, alt: string | null): Promise<void>
  /** Detach `key`; false when it was not attached. */
  detach(tx: DbOrTx, id: string, key: string): Promise<boolean>
}

type ProductEntity = LoadedEntity & { businessId: string }

const product: TargetDef = {
  entityType: 'product',
  async load(db, id) {
    const p = await repo.productForMedia(db, id)
    if (!p) return null
    return {
      villageId: p.villageId,
      businessId: p.businessId,
      keys: p.keys,
      // A published product must keep a photo (publishing requires one).
      removeBlocked: (key) =>
        p.status === 'published' && p.keys.length === 1 && p.keys[0] === key ? 'LAST_PHOTO' : null,
    } satisfies ProductEntity
  },
  authorize(actor, entity) {
    const { villageId, businessId } = entity as ProductEntity
    assertCan(actor, 'product.update', { type: 'product', villageId, businessId })
  },
  prefix(entity, id) {
    const { villageId, businessId } = entity as ProductEntity
    return `villages/${villageId}/businesses/${businessId}/products/${id}/`
  },
  attach: (tx, id, key, alt) => repo.addProductImage(tx, id, key, alt),
  detach: (tx, id, key) => repo.removeProductImage(tx, id, key),
}

const businessLogo: TargetDef = {
  entityType: 'business',
  async load(db, id) {
    const b = await repo.businessForMedia(db, id)
    return b ? { villageId: b.villageId, keys: b.logoKey ? [b.logoKey] : [] } : null
  },
  authorize(actor, entity, id) {
    assertCan(actor, 'business.update', {
      type: 'business',
      villageId: entity.villageId,
      businessId: id,
    })
  },
  prefix: (entity, id) => `villages/${entity.villageId}/businesses/${id}/logo/`,
  attach: (tx, id, key) => repo.setBusinessLogo(tx, id, key),
  async detach(tx, id, key) {
    const b = await repo.businessForMedia(tx, id)
    if (b?.logoKey !== key) return false
    await repo.setBusinessLogo(tx, id, null)
    return true
  },
}

const villageImage = (column: 'logoKey' | 'bannerKey', folder: string): TargetDef => ({
  entityType: 'village',
  async load(db, id) {
    const v = await repo.villageForMedia(db, id)
    if (!v) return null
    const key = v[column]
    return { villageId: v.id, keys: key ? [key] : [] }
  },
  authorize(actor, entity) {
    assertCan(actor, 'village.customize_theme', { type: 'village', villageId: entity.villageId })
  },
  prefix: (entity) => `villages/${entity.villageId}/${folder}/`,
  attach: (tx, id, key) => repo.setVillageImage(tx, id, column, key),
  async detach(tx, id, key) {
    const v = await repo.villageForMedia(tx, id)
    if (v?.[column] !== key) return false
    await repo.setVillageImage(tx, id, column, null)
    return true
  },
})

export const targets: Record<MediaTarget, TargetDef> = {
  product_image: product,
  business_logo: businessLogo,
  village_logo: villageImage('logoKey', 'logo'),
  village_banner: villageImage('bannerKey', 'banner'),
}

/** Only files uploaded through this module are ever deleted (never seed or hand-placed files). */
export const MANAGED_PREFIX = 'villages/'
