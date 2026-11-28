import { z } from '@hono/zod-openapi'
import { reviewRejectionReasons, reviewStatuses } from '@repo/validators'

export const manageReviewSchema = z
  .object({
    id: z.uuid(),
    villageId: z.uuid(),
    business: z.object({ id: z.uuid(), name: z.string() }),
    product: z.object({ id: z.uuid(), slug: z.string(), name: z.string() }),
    reviewerName: z.string(),
    rating: z.number().int(),
    body: z.string(),
    locale: z.enum(['id', 'en']),
    status: z.enum(reviewStatuses),
    rejectionReason: z.enum(reviewRejectionReasons).nullable(),
    moderatedAt: z.string().nullable(),
    reply: z.string().nullable(),
    repliedAt: z.string().nullable(),
    createdAt: z.string(),
    /** What the current user may do (UX only; the API checks again). */
    canModerate: z.boolean(),
    canReply: z.boolean(),
  })
  .openapi('ManageReview')

export type ManageReview = z.infer<typeof manageReviewSchema>

export const manageReviewListResponseSchema = z.object({
  data: z.array(manageReviewSchema),
  meta: z.object({
    page: z.number().int(),
    pageSize: z.number().int(),
    total: z.number().int(),
    counts: z.object({
      pending: z.number().int(),
      approved: z.number().int(),
      rejected: z.number().int(),
    }),
  }),
})

export const manageReviewResponseSchema = z.object({ data: manageReviewSchema })
