import { z } from 'zod'
import { paginationSchema } from './common'

export const REVIEW_NAME_MIN = 2
export const REVIEW_NAME_MAX = 40
export const REVIEW_BODY_MIN = 10
export const REVIEW_BODY_MAX = 1000
export const REVIEW_REPLY_MAX = 600

export const reviewStatuses = ['pending', 'approved', 'rejected'] as const
export const reviewRejectionReasons = ['spam', 'abusive', 'personal_data', 'off_topic'] as const

/** Collapses runs of whitespace inside one line; keeps paragraph breaks in the body. */
const singleLine = (value: string) => value.replace(/\s+/g, ' ').trim()
const paragraphs = (value: string) =>
  value
    .replace(/\r\n?/g, '\n')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

/** Public form (PLAN-product-reviews). `website` is a honeypot: people leave it empty, bots fill it. */
export const productReviewCreateSchema = z.object({
  reviewerName: z
    .string()
    .transform(singleLine)
    .pipe(z.string().min(REVIEW_NAME_MIN, 'Nama minimal 2 huruf').max(REVIEW_NAME_MAX)),
  rating: z.number().int().min(1, 'Pilih jumlah bintang').max(5),
  body: z
    .string()
    .transform(paragraphs)
    .pipe(
      z
        .string()
        .min(REVIEW_BODY_MIN, 'Ceritakan sedikit lebih banyak (minimal 10 huruf)')
        .max(REVIEW_BODY_MAX),
    ),
  locale: z.enum(['id', 'en']).default('id'),
  website: z.string().max(200).optional(),
})
export type ProductReviewCreateInput = z.infer<typeof productReviewCreateSchema>

export const productReviewListQuerySchema = paginationSchema.extend({
  pageSize: z.coerce.number().int().min(1).max(20).default(5),
})

export const reviewModerationSchema = z
  .object({
    status: z.enum(['approved', 'rejected']),
    rejectionReason: z.enum(reviewRejectionReasons).optional(),
  })
  .refine((value) => value.status === 'approved' || value.rejectionReason, {
    message: 'Pilih alasan penolakan',
    path: ['rejectionReason'],
  })
export type ReviewModerationInput = z.infer<typeof reviewModerationSchema>

export const reviewReplySchema = z.object({
  reply: z
    .string()
    .transform(paragraphs)
    .pipe(z.string().min(2, 'Balasan masih kosong').max(REVIEW_REPLY_MAX)),
})
export type ReviewReplyInput = z.infer<typeof reviewReplySchema>

export const manageReviewListQuerySchema = paginationSchema.extend({
  villageId: z.uuid().optional(),
  businessId: z.uuid().optional(),
  status: z.enum(reviewStatuses).optional(),
})
