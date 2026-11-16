import { type Action, type Actor, ForbiddenError, assertCan, can } from '@repo/auth/permissions'
import type { Database } from '@repo/db'
import {
  COMPARE_AT_PRICE_MESSAGE,
  type ProductCreateInput,
  type ProductImageOrderInput,
  type ProductUpdateInput,
  slugWithSuffix,
  toSlug,
} from '@repo/validators'
import { diffFields, writeAudit } from '../../lib/audit'
import { AppError } from '../../lib/errors'
import * as repo from './manage-products.repository'
import type { ProductManage } from './manage-products.schema'

/**
 * Dashboard management of products. Authorization: `business.view` / `product.create` on the
 * business, `product.update|publish|delete` on the product, always with ids from the database row.
 * The village of a product is always its business's village, never taken from input.
 * Publishing needs a category and at least one photo; the product shows publicly only while its
 * business is public too (lib/visibility.ts).
 */

export interface Ctx {
  db: Database
  actor: Actor | null
  requestId?: string
}

type Image = Awaited<ReturnType<typeof repo.imagesFor>>[number]

function requireActor(actor: Actor | null, action: Action): Actor {
  if (!actor) throw new ForbiddenError(action)
  return actor
}

const productResource = (row: { villageId: string; businessId: string }) =>
  ({ type: 'product', villageId: row.villageId, businessId: row.businessId }) as const

export function toManageDto(
  row: repo.ManageProductRow,
  images: Image[],
  actor: Actor,
): ProductManage {
  const resource = productResource(row)
  return {
    id: row.id,
    business: { id: row.businessId, slug: row.businessSlug, name: row.businessName },
    villageId: row.villageId,
    category:
      row.categoryId && row.categorySlug && row.categoryName
        ? { id: row.categoryId, slug: row.categorySlug, name: row.categoryName }
        : null,
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: row.price,
    compareAtPrice: row.compareAtPrice,
    isFree: row.price === 0,
    isAvailable: row.isAvailable,
    status: row.status,
    en: row.nameEn ? { name: row.nameEn, description: row.descriptionEn } : null,
    images: images
      .filter((i) => i.productId === row.id)
      .map(({ id, key, alt, sortOrder }) => ({ id, key, alt, sortOrder })),
    isSeed: row.isSeed,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    permissions: {
      update: can(actor, 'product.update', resource),
      publish: can(actor, 'product.publish', resource),
      delete: can(actor, 'product.delete', resource),
    },
  }
}

async function loadRow(ctx: Ctx, id: string) {
  const row = await repo.findById(ctx.db, id)
  if (!row) throw AppError.notFound('Product')
  return row
}

async function loadAuthorized(
  ctx: Ctx,
  id: string,
  action: 'product.update' | 'product.publish' | 'product.delete',
) {
  const actor = requireActor(ctx.actor, action)
  const row = await loadRow(ctx, id)
  assertCan(actor, action, productResource(row))
  return { actor, row }
}

async function loadBusiness(
  ctx: Ctx,
  businessId: string,
  action: 'business.view' | 'product.create',
) {
  const actor = requireActor(ctx.actor, action)
  const business = await repo.findLiveBusiness(ctx.db, businessId)
  if (!business) throw AppError.notFound('Business')
  assertCan(actor, action, { type: 'business', villageId: business.villageId, businessId })
  return { actor, business }
}

async function reload(ctx: Ctx, actor: Actor, id: string) {
  const row = await loadRow(ctx, id)
  return { data: toManageDto(row, await repo.imagesFor(ctx.db, [id]), actor) }
}

async function assertCategory(ctx: Ctx, categoryId: string) {
  if (!(await repo.categoryExists(ctx.db, categoryId))) {
    throw AppError.invalid('categoryId', 'Kategori tidak ditemukan')
  }
}

// ── Reads ────────────────────────────────────────────────────────────────────

export async function list(ctx: Ctx, businessId: string, filters: repo.ListFilters) {
  const { actor } = await loadBusiness(ctx, businessId, 'business.view')
  const { rows, total } = await repo.listForBusiness(ctx.db, businessId, filters)
  const images = await repo.imagesFor(
    ctx.db,
    rows.map((r) => r.id),
  )
  return {
    data: rows.map((r) => toManageDto(r, images, actor)),
    meta: { page: filters.page, pageSize: filters.pageSize, total },
  }
}

export async function get(ctx: Ctx, id: string) {
  const actor = requireActor(ctx.actor, 'business.view')
  const row = await loadRow(ctx, id)
  assertCan(actor, 'business.view', {
    type: 'business',
    villageId: row.villageId,
    businessId: row.businessId,
  })
  return { data: toManageDto(row, await repo.imagesFor(ctx.db, [id]), actor) }
}

// ── Create ───────────────────────────────────────────────────────────────────

/**
 * Product slugs are unique platform-wide and "keripik-singkong" exists in many villages, so a taken
 * name gets the business name appended before falling back to a number:
 * keripik-singkong → keripik-singkong-keripik-bu-ani → keripik-singkong-keripik-bu-ani-2.
 */
async function pickSlug(ctx: Ctx, name: string, businessName: string) {
  const plain = toSlug(name, 'produk')
  if (!(await repo.slugsLike(ctx.db, plain)).includes(plain)) return plain
  const withBusiness = toSlug(`${name} ${businessName}`, plain)
  const taken = new Set(await repo.slugsLike(ctx.db, withBusiness))
  let n = 1
  while (taken.has(slugWithSuffix(withBusiness, n))) n++
  return slugWithSuffix(withBusiness, n)
}

const isUniqueViolation = (e: unknown) =>
  typeof e === 'object' && e !== null && 'code' in e && (e as { code: string }).code === '23505'

export async function create(ctx: Ctx, businessId: string, input: ProductCreateInput) {
  const { actor, business } = await loadBusiness(ctx, businessId, 'product.create')
  await assertCategory(ctx, input.categoryId)
  const { en, ...fields } = input

  // Two people creating the same name at once can race for the slug; retry on the unique index.
  for (let attempt = 0; ; attempt++) {
    const slug = await pickSlug(ctx, input.name, business.name)
    try {
      const id = await ctx.db.transaction(async (tx) => {
        const id = await repo.insertProduct(tx, {
          ...fields,
          businessId: business.id,
          villageId: business.villageId,
          slug,
          status: 'draft',
          createdBy: actor.userId,
          updatedBy: actor.userId,
        })
        if (en)
          await repo.upsertEnglish(tx, id, { name: en.name, description: en.description ?? null })
        await writeAudit(tx, {
          actorId: actor.userId,
          villageId: business.villageId,
          action: 'product.create',
          entityType: 'product',
          entityId: id,
          changes: { ...fields, slug, en: en ?? null },
          requestId: ctx.requestId,
        })
        return id
      })
      return reload(ctx, actor, id)
    } catch (e) {
      if (isUniqueViolation(e) && attempt < 3) continue
      throw e
    }
  }
}

// ── Update ───────────────────────────────────────────────────────────────────

/** Partial update: missing = unchanged, null = cleared. Only changed fields are written and audited. */
export async function update(ctx: Ctx, id: string, input: ProductUpdateInput) {
  const { actor, row } = await loadAuthorized(ctx, id, 'product.update')
  const { en, categoryId, ...rest } = input

  const patch: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(rest)) if (value !== undefined) patch[key] = value
  if (categoryId !== undefined && categoryId !== row.categoryId) {
    await assertCategory(ctx, categoryId)
    patch.categoryId = categoryId
  }

  // The struck-through price is checked against the stored row: raising the price above it
  // without clearing it would show a fake discount (and break the database check).
  const price = (patch.price as number | undefined) ?? row.price
  const compareAtPrice =
    'compareAtPrice' in patch ? (patch.compareAtPrice as number | null) : row.compareAtPrice
  if (compareAtPrice !== null && compareAtPrice <= price) {
    throw AppError.invalid('compareAtPrice', COMPARE_AT_PRICE_MESSAGE)
  }

  const changes: Record<string, unknown> = diffFields(row, patch)

  const before = row.nameEn ? { name: row.nameEn, description: row.descriptionEn } : null
  let english: { name: string; description: string | null } | null | undefined
  if (en === null && before) english = null
  if (en) {
    const next = {
      name: en.name,
      description: en.description === undefined ? (before?.description ?? null) : en.description,
    }
    if (JSON.stringify(next) !== JSON.stringify(before)) english = next
  }
  if (english !== undefined) changes.en = { from: before, to: english }

  if (Object.keys(changes).length === 0) return reload(ctx, actor, id)

  const columns = Object.fromEntries(
    Object.keys(changes)
      .filter((k) => k !== 'en')
      .map((k) => [k, patch[k]]),
  )

  await ctx.db.transaction(async (tx) => {
    await repo.updateProduct(tx, id, { ...columns, updatedBy: actor.userId })
    if (english === null) await repo.deleteEnglish(tx, id)
    else if (english) await repo.upsertEnglish(tx, id, english)
    await writeAudit(tx, {
      actorId: actor.userId,
      villageId: row.villageId,
      action: 'product.update',
      entityType: 'product',
      entityId: id,
      changes,
      requestId: ctx.requestId,
    })
  })
  return reload(ctx, actor, id)
}

// ── State changes ────────────────────────────────────────────────────────────

async function setStatus(
  ctx: Ctx,
  actor: Actor,
  row: repo.ManageProductRow,
  action: string,
  status: 'draft' | 'published',
) {
  await ctx.db.transaction(async (tx) => {
    await repo.updateProduct(tx, row.id, { status, updatedBy: actor.userId })
    await writeAudit(tx, {
      actorId: actor.userId,
      villageId: row.villageId,
      action,
      entityType: 'product',
      entityId: row.id,
      changes: { status: { from: row.status, to: status } },
      requestId: ctx.requestId,
    })
  })
  return reload(ctx, actor, row.id)
}

export async function publish(ctx: Ctx, id: string) {
  const { actor, row } = await loadAuthorized(ctx, id, 'product.publish')
  if (!row.categoryId) {
    throw AppError.conflict('Choose a category first', 'NO_CATEGORY')
  }
  const images = await repo.imagesFor(ctx.db, [id])
  if (images.length === 0) {
    throw AppError.conflict('Add at least one photo first', 'NO_PHOTO')
  }
  if (row.status === 'published') return { data: toManageDto(row, images, actor) }
  return setStatus(ctx, actor, row, 'product.publish', 'published')
}

export async function unpublish(ctx: Ctx, id: string) {
  const { actor, row } = await loadAuthorized(ctx, id, 'product.publish')
  if (row.status !== 'published') return reload(ctx, actor, id)
  return setStatus(ctx, actor, row, 'product.unpublish', 'draft')
}

/** Soft delete. The slug stays reserved so old links never point at a different product. */
export async function remove(ctx: Ctx, id: string) {
  const { actor, row } = await loadAuthorized(ctx, id, 'product.delete')
  await ctx.db.transaction(async (tx) => {
    await repo.updateProduct(tx, id, {
      deletedAt: new Date(),
      status: 'draft',
      updatedBy: actor.userId,
    })
    await writeAudit(tx, {
      actorId: actor.userId,
      villageId: row.villageId,
      action: 'product.delete',
      entityType: 'product',
      entityId: id,
      changes: { name: row.name, slug: row.slug },
      requestId: ctx.requestId,
    })
  })
}

/** Photo order for the slider; the first photo is the cover. `order` must list every photo once. */
export async function reorderImages(ctx: Ctx, id: string, input: ProductImageOrderInput) {
  const { actor, row } = await loadAuthorized(ctx, id, 'product.update')
  const images = await repo.imagesFor(ctx.db, [id])
  const current = images.map((i) => i.id)
  const sameSet =
    input.order.length === current.length && input.order.every((i) => current.includes(i))
  if (!sameSet) throw AppError.invalid('order', 'Urutan harus berisi semua foto produk ini')
  if (input.order.every((imageId, i) => current[i] === imageId)) return reload(ctx, actor, id)

  await ctx.db.transaction(async (tx) => {
    await repo.setImageOrder(tx, id, input.order)
    await writeAudit(tx, {
      actorId: actor.userId,
      villageId: row.villageId,
      action: 'product.reorder_images',
      entityType: 'product',
      entityId: id,
      changes: { order: { from: current, to: input.order } },
      requestId: ctx.requestId,
    })
  })
  return reload(ctx, actor, id)
}
