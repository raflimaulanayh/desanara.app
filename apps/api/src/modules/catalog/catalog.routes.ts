import { createRoute, z } from '@hono/zod-openapi'
import { productSearchSchema } from '@repo/validators'
import { createRouter, errorResponses } from '../../lib/router'
import {
  categorySchema,
  productDetailSchema,
  productListResponseSchema,
  sitemapSchema,
} from './catalog.schema'
import * as service from './catalog.service'

const searchRoute = createRoute({
  method: 'get',
  path: '/products',
  tags: ['Catalog'],
  summary: 'Search published products (q, category, region code prefix, village, business)',
  request: { query: productSearchSchema.extend({ business: z.string().optional() }) },
  responses: {
    200: {
      description: 'Products',
      content: { 'application/json': { schema: productListResponseSchema } },
    },
    422: errorResponses[422],
  },
})

const productRoute = createRoute({
  method: 'get',
  path: '/products/{slug}',
  tags: ['Catalog'],
  summary: 'Published product with its business, village and related products',
  request: { params: z.object({ slug: z.string().min(1) }) },
  responses: {
    200: {
      description: 'Product',
      content: { 'application/json': { schema: z.object({ data: productDetailSchema }) } },
    },
    404: errorResponses[404],
  },
})

const categoriesRoute = createRoute({
  method: 'get',
  path: '/categories',
  tags: ['Catalog'],
  summary: 'Product categories with English names',
  responses: {
    200: {
      description: 'Categories',
      content: { 'application/json': { schema: z.object({ data: z.array(categorySchema) }) } },
    },
  },
})

const sitemapRoute = createRoute({
  method: 'get',
  path: '/sitemap',
  tags: ['Catalog'],
  summary: 'Slugs and last change of every public village, business and product (for sitemap.xml)',
  responses: {
    200: {
      description: 'Public pages',
      content: { 'application/json': { schema: z.object({ data: sitemapSchema }) } },
    },
  },
})

/** Search engines read the sitemap rarely; an hour of CDN cache keeps it off the database. */
const SITEMAP_CACHE = 'public, max-age=600, s-maxage=3600'

export const catalogRoutes = createRouter()
  .openapi(searchRoute, async (c) =>
    c.json(await service.searchProducts(c.get('db'), c.req.valid('query')), 200),
  )
  .openapi(productRoute, async (c) =>
    c.json(await service.getProduct(c.get('db'), c.req.valid('param').slug), 200),
  )
  .openapi(categoriesRoute, async (c) => c.json(await service.listCategories(c.get('db')), 200))
  .openapi(sitemapRoute, async (c) => {
    c.header('Cache-Control', SITEMAP_CACHE)
    return c.json(await service.getSitemap(c.get('db')), 200)
  })
