import { createRoute, z } from '@hono/zod-openapi'
import { analyticsEvents, businesses, products, villages } from '@repo/db'
import { eq } from 'drizzle-orm'
import { createRouter, errorResponses } from '../../lib/router'

/**
 * Public impact tracking (views, WhatsApp/marketplace clicks). Stores no personal data.
 * The tenant keys are derived from the database, never trusted from the client.
 */
const eventSchema = z.object({
  type: z.enum([
    'product_view',
    'business_view',
    'village_view',
    'whatsapp_click',
    'marketplace_click',
  ]),
  productSlug: z.string().max(200).optional(),
  businessSlug: z.string().max(200).optional(),
  villageSlug: z.string().max(200).optional(),
  locale: z.enum(['id', 'en']).optional(),
})

const eventRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Analytics'],
  summary: 'Record a view or click',
  request: { body: { content: { 'application/json': { schema: eventSchema } } } },
  responses: {
    202: {
      description: 'Accepted',
      content: { 'application/json': { schema: z.object({ ok: z.literal(true) }) } },
    },
    422: errorResponses[422],
  },
})

export const eventRoutes = createRouter().openapi(eventRoute, async (c) => {
  const db = c.get('db')
  const body = c.req.valid('json')
  let productId: string | null = null
  let businessId: string | null = null
  let villageId: string | null = null

  if (body.productSlug) {
    const [p] = await db
      .select({ id: products.id, businessId: products.businessId, villageId: products.villageId })
      .from(products)
      .where(eq(products.slug, body.productSlug))
    if (p) ({ id: productId, businessId, villageId } = p)
  } else if (body.businessSlug) {
    const [b] = await db
      .select({ id: businesses.id, villageId: businesses.villageId })
      .from(businesses)
      .where(eq(businesses.slug, body.businessSlug))
    if (b) ({ id: businessId, villageId } = b)
  } else if (body.villageSlug) {
    const [v] = await db
      .select({ id: villages.id })
      .from(villages)
      .where(eq(villages.slug, body.villageSlug))
    if (v) villageId = v.id
  }

  if (villageId) {
    await db
      .insert(analyticsEvents)
      .values({ type: body.type, productId, businessId, villageId, locale: body.locale })
  }
  return c.json({ ok: true as const }, 202)
})
