/**
 * Seed script.
 *   bun run db:seed        → upsert reference data, then (re)create all demo rows
 *   bun run db:seed:reset  → delete demo rows only (is_seed = true); reference data stays
 *
 * Safe to run repeatedly. Refuses to run with NODE_ENV=production unless --allow-production.
 * Docs: docs/guides/seed-data.md
 */
import { hashPassword } from 'better-auth/crypto'
import { and, eq, inArray } from 'drizzle-orm'
import { createDb, type Database } from '../index'
import {
  accounts,
  analyticsEvents,
  businessMembers,
  businesses,
  categories,
  categoryTranslations,
  productReviews,
  products,
  productImages,
  productTranslations,
  users,
  villageMembers,
  villages,
} from '../schema'
import {
  DEMO_EMAIL_DOMAIN,
  DEMO_PASSWORD,
  demoCompareAtPrices,
  demoVillages,
  productPhotos,
} from './demo-data'
import { demoProductContent } from './demo-content'
import { importRegions } from '../regions/import'
import { categorySeed } from './reference-data'

const args = new Set(process.argv.slice(2))
const resetOnly = args.has('--reset')

if (process.env.NODE_ENV === 'production' && !args.has('--allow-production')) {
  console.error(
    'Refusing to seed with NODE_ENV=production. Pass --allow-production if you really mean it.',
  )
  process.exit(1)
}

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('DATABASE_URL is not set (copy .env.example to .env).')
  process.exit(1)
}

/**
 * Demo login password. The default (demo12345) is public in the repo, so any database that is not
 * on this machine must get its own SEED_DEMO_PASSWORD (otherwise anyone could sign in as super admin).
 */
const isLocalDatabase = /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(databaseUrl)
const demoPassword = process.env.SEED_DEMO_PASSWORD || (isLocalDatabase ? DEMO_PASSWORD : '')
if (!resetOnly && !demoPassword) {
  console.error(
    'Refusing to seed a non-local database with the public demo password. Set SEED_DEMO_PASSWORD in .env.',
  )
  process.exit(1)
}

/** All demo businesses share one WhatsApp number so demo clicks never reach strangers. */
const demoWhatsApp = process.env.SEED_WHATSAPP_NUMBER || '6281200000000'

const db = createDb(databaseUrl, { max: 1 })

/** Deterministic PRNG so demo statistics look the same on every run. */
function rng(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

async function resetDemoData(tx: Database) {
  await tx.delete(analyticsEvents).where(eq(analyticsEvents.isSeed, true))
  await tx.delete(productReviews).where(eq(productReviews.isSeed, true))
  await tx.delete(products).where(eq(products.isSeed, true))
  await tx.delete(businesses).where(eq(businesses.isSeed, true))
  await tx.delete(villages).where(eq(villages.isSeed, true))

  const seedUsers = await tx.select({ id: users.id }).from(users).where(eq(users.isSeed, true))
  const seedUserIds = seedUsers.map(({ id }) => id)
  if (!seedUserIds.length) return
  // Memberships of demo accounts are recreated below, also in real villages such as Baros.
  await tx.delete(villageMembers).where(inArray(villageMembers.userId, seedUserIds))
  await tx.delete(businessMembers).where(inArray(businessMembers.userId, seedUserIds))
  // A demo account may have done real work (sent an invitation, verified a business, left an audit
  // row). Those rows must survive, so such an account is kept and reused by createDemoUser.
  let kept = 0
  for (const id of seedUserIds) {
    try {
      await tx.transaction(async (savepoint) => {
        await savepoint.delete(users).where(eq(users.id, id))
      })
    } catch {
      kept++
    }
  }
  if (kept) console.log(`Kept ${kept} demo account(s) that real rows still reference.`)
}

async function upsertReferenceData(tx: Database) {
  // Every Kemendagri region (skipped when the dataset version is already loaded).
  const imported = await importRegions(tx)
  if (!imported.skipped) console.log(`Imported ${imported.upserted} regions.`)

  for (const [i, c] of categorySeed.entries()) {
    const [row] = await tx
      .insert(categories)
      .values({ slug: c.slug, name: c.name, icon: c.icon, sortOrder: i })
      .onConflictDoUpdate({
        target: categories.slug,
        set: { name: c.name, icon: c.icon, sortOrder: i },
      })
      .returning({ id: categories.id })
    await tx
      .insert(categoryTranslations)
      .values({ categoryId: row!.id, locale: 'en', name: c.en })
      .onConflictDoUpdate({
        target: [categoryTranslations.categoryId, categoryTranslations.locale],
        set: { name: c.en },
      })
  }
}

async function createDemoUser(
  tx: Database,
  passwordHash: string,
  email: string,
  name: string,
  globalRole: 'super_admin' | null = null,
) {
  const [existing] = await tx.select({ id: users.id }).from(users).where(eq(users.email, email))
  if (existing) {
    // Kept by resetDemoData because real rows reference it: refresh it instead of inserting.
    await tx
      .update(users)
      .set({ name, globalRole, emailVerified: true, isSeed: true })
      .where(eq(users.id, existing.id))
    await tx
      .delete(accounts)
      .where(and(eq(accounts.userId, existing.id), eq(accounts.providerId, 'credential')))
  }
  const id = existing?.id ?? crypto.randomUUID()
  if (!existing) {
    await tx
      .insert(users)
      .values({ id, name, email, emailVerified: true, globalRole, isSeed: true })
  }
  // Better Auth email/password accounts: providerId "credential", accountId = user id.
  await tx.insert(accounts).values({
    id: crypto.randomUUID(),
    accountId: id,
    providerId: 'credential',
    userId: id,
    password: passwordHash,
  })
  return id
}

async function insertDemoData(tx: Database) {
  const passwordHash = await hashPassword(demoPassword)
  const email = (local: string) => `${local}@${DEMO_EMAIL_DOMAIN}`
  const categoryIds = Object.fromEntries(
    (await tx.select({ id: categories.id, slug: categories.slug }).from(categories)).map((c) => [
      c.slug,
      c.id,
    ]),
  )

  const superAdminId = await createDemoUser(
    tx,
    passwordHash,
    email('superadmin'),
    'Super Admin HIMA',
    'super_admin',
  )
  const random = rng(20261211)
  const productIdsForStats: { productId: string; businessId: string; villageId: string }[] = []

  for (const [vi, v] of demoVillages.entries()) {
    const villageValues = {
      slug: v.slug,
      name: v.name,
      regionCode: v.regionCode,
      description: v.description,
      contactPhone: demoWhatsApp,
      logoKey: v.logoKey,
      bannerKey: v.bannerKey,
      theme: v.theme,
      themePublishedAt: new Date(),
      status: 'published' as const,
      // A real partner village (Desa Baros) is kept on reset; only its businesses/products are demo.
      isSeed: !v.isRealVillage,
    }
    const [village] = await tx
      .insert(villages)
      .values(villageValues)
      .onConflictDoUpdate({ target: villages.slug, set: villageValues })
      .returning({ id: villages.id })
    const villageId = village!.id

    const adminId = await createDemoUser(
      tx,
      passwordHash,
      email(`admin.${v.slug}`),
      `Admin ${v.name}`,
    )
    await tx.insert(villageMembers).values({ villageId, userId: adminId, role: 'village_admin' })

    // The first village gets a pendamping (assistant) and one owner account to demo hand-over.
    const assistantId =
      vi === 0
        ? await createDemoUser(
            tx,
            passwordHash,
            email(`pendamping.${v.slug}`),
            `Pendamping ${v.name}`,
          )
        : null
    if (assistantId)
      await tx
        .insert(villageMembers)
        .values({ villageId, userId: assistantId, role: 'village_assistant' })

    for (const [bi, b] of v.businesses.entries()) {
      const [business] = await tx
        .insert(businesses)
        .values({
          villageId,
          slug: b.slug,
          name: b.name,
          ownerName: b.ownerName,
          description: b.description,
          whatsappNumber: demoWhatsApp,
          openingHours: b.hours ?? null,
          closedUntil: b.closedForDays
            ? new Date(Date.now() + b.closedForDays.days * 86_400_000)
            : null,
          closedNote: b.closedForDays?.note ?? null,
          verificationStatus: b.verified ? 'verified' : 'pending',
          verifiedAt: b.verified ? new Date() : null,
          verifiedBy: b.verified ? adminId : null,
          consentAt: new Date(),
          consentMethod: 'paper_form',
          consentRecordedBy: assistantId ?? adminId,
          status: b.verified ? 'published' : 'draft',
          createdBy: assistantId ?? adminId,
          isSeed: true,
        })
        .returning({ id: businesses.id })
      const businessId = business!.id

      if (assistantId && bi < 4) {
        await tx
          .insert(businessMembers)
          .values({ businessId, userId: assistantId, role: 'assistant' })
      }
      if (vi === 0 && bi === 0) {
        const ownerId = await createDemoUser(
          tx,
          passwordHash,
          email(`pemilik.${b.slug}`),
          b.ownerName,
        )
        await tx.insert(businessMembers).values({ businessId, userId: ownerId, role: 'owner' })
      }

      for (const pr of b.products) {
        const slug = `${b.slug}-${pr.slug}`
        const content = demoProductContent[slug]
        const [product] = await tx
          .insert(products)
          .values({
            businessId,
            villageId,
            categoryId: categoryIds[pr.category],
            slug,
            name: pr.name,
            description: content?.description ?? pr.description,
            price: pr.price,
            compareAtPrice: demoCompareAtPrices[pr.slug] ?? null,
            status: b.verified ? 'published' : 'draft',
            createdBy: assistantId ?? adminId,
            isSeed: true,
          })
          .returning({ id: products.id })
        const productId = product!.id
        if (pr.en || content) {
          await tx.insert(productTranslations).values({
            productId,
            locale: 'en',
            name: pr.en ?? pr.name,
            description: content?.descriptionEn ?? null,
          })
        }
        const photos = productPhotos[pr.slug] ?? []
        if (photos.length) {
          await tx.insert(productImages).values(
            photos.map((storageKey, sortOrder) => ({
              productId,
              storageKey,
              alt: sortOrder === 0 ? pr.name : `${pr.name} (${sortOrder + 1})`,
              sortOrder,
            })),
          )
        }
        // Buyer reviews (PLAN-product-reviews): approved by the village admin, a few left pending.
        if (content?.reviews.length) {
          await tx.insert(productReviews).values(
            content.reviews.map((review) => {
              const createdAt = new Date(Date.now() - review.daysAgo * 86_400_000)
              const approved = review.status !== 'pending'
              return {
                productId,
                businessId,
                villageId,
                reviewerName: review.name,
                rating: review.rating,
                body: review.body,
                locale: review.locale,
                status: approved ? ('approved' as const) : ('pending' as const),
                moderatedBy: approved ? adminId : null,
                moderatedAt: approved ? new Date(createdAt.getTime() + 6 * 3_600_000) : null,
                reply: approved ? (review.reply ?? null) : null,
                repliedBy: approved && review.reply ? (assistantId ?? adminId) : null,
                repliedAt:
                  approved && review.reply ? new Date(createdAt.getTime() + 26 * 3_600_000) : null,
                isSeed: true,
                createdAt,
                updatedAt: createdAt,
              }
            }),
          )
        }
        if (b.verified) productIdsForStats.push({ productId: product!.id, businessId, villageId })
      }
    }
  }

  // Fake impact stats for the last 30 days so the analytics page has something to show.
  const now = Date.now()
  const events: (typeof analyticsEvents.$inferInsert)[] = []
  for (const { productId, businessId, villageId } of productIdsForStats) {
    const views = 5 + Math.floor(random() * 55)
    const clicks = Math.floor(views * (0.05 + random() * 0.15))
    for (let i = 0; i < views + clicks; i++) {
      events.push({
        type: i < views ? 'product_view' : 'whatsapp_click',
        productId,
        businessId,
        villageId,
        locale: random() < 0.85 ? 'id' : 'en',
        occurredAt: new Date(now - Math.floor(random() * 30 * 24 * 60 * 60 * 1000)),
        isSeed: true,
      })
    }
  }
  for (let i = 0; i < events.length; i += 500) {
    await tx.insert(analyticsEvents).values(events.slice(i, i + 500))
  }

  return { superAdminId, products: productIdsForStats.length, events: events.length }
}

try {
  await db.transaction(async (tx) => {
    const t = tx as unknown as Database
    await resetDemoData(t)
    if (resetOnly) return
    await upsertReferenceData(t)
    const result = await insertDemoData(t)
    const counts = await t
      .select({ id: businesses.id })
      .from(businesses)
      .where(eq(businesses.isSeed, true))
    console.log(
      `Seeded ${demoVillages.length} villages, ${counts.length} businesses, ${result.products} published products, ${result.events} analytics events.`,
    )
    console.log(
      `Demo accounts: *@${DEMO_EMAIL_DOMAIN} / password ${process.env.SEED_DEMO_PASSWORD ? 'from SEED_DEMO_PASSWORD' : `"${DEMO_PASSWORD}"`} (see docs/guides/seed-data.md)`,
    )
  })
  if (resetOnly) console.log('Demo data removed (reference data kept).')
} finally {
  await db.$client.end()
}
