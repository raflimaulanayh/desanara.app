import { z } from '@hono/zod-openapi'

export const publicReviewSchema = z
  .object({
    id: z.uuid(),
    reviewerName: z.string(),
    rating: z.number().int().min(1).max(5),
    body: z.string(),
    locale: z.enum(['id', 'en']),
    createdAt: z.string(),
    /** The business's public reply, or null. */
    reply: z.string().nullable(),
    repliedAt: z.string().nullable(),
  })
  .openapi('ProductReview')

export const ratingSummarySchema = z
  .object({
    /** Average of approved reviews to one decimal, null without reviews. */
    average: z.number().nullable(),
    count: z.number().int(),
    /** Approved reviews per star, keys "1" to "5". */
    distribution: z.record(z.enum(['1', '2', '3', '4', '5']), z.number().int()),
  })
  .openapi('RatingSummary')

export const reviewListResponseSchema = z.object({
  data: z.array(publicReviewSchema),
  meta: z.object({
    page: z.number().int(),
    pageSize: z.number().int(),
    total: z.number().int(),
    summary: ratingSummarySchema,
  }),
})

export const reviewCreatedSchema = z.object({ data: z.object({ status: z.literal('pending') }) })
