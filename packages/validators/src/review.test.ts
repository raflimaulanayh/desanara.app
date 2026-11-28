import { describe, expect, test } from 'bun:test'
import { productReviewCreateSchema, reviewModerationSchema, reviewReplySchema } from './review'

const base = { reviewerName: 'Rina S.', rating: 5, body: 'Keripiknya renyah dan bumbunya pas.' }

describe('productReviewCreateSchema', () => {
  test('accepts a normal review and defaults the locale', () => {
    expect(productReviewCreateSchema.parse(base).locale).toBe('id')
  })

  test('trims the name and collapses spaces', () => {
    expect(
      productReviewCreateSchema.parse({ ...base, reviewerName: '  Rina   S.  ' }).reviewerName,
    ).toBe('Rina S.')
  })

  test('keeps paragraphs but no more than one blank line', () => {
    const body = 'Baris satu.\n\n\n\nBaris dua   panjang.'
    expect(productReviewCreateSchema.parse({ ...base, body }).body).toBe(
      'Baris satu.\n\nBaris dua panjang.',
    )
  })

  test('rejects ratings outside 1 to 5, short bodies and short names', () => {
    expect(productReviewCreateSchema.safeParse({ ...base, rating: 0 }).success).toBe(false)
    expect(productReviewCreateSchema.safeParse({ ...base, rating: 6 }).success).toBe(false)
    expect(productReviewCreateSchema.safeParse({ ...base, rating: 4.5 }).success).toBe(false)
    expect(productReviewCreateSchema.safeParse({ ...base, body: 'Oke    ' }).success).toBe(false)
    expect(productReviewCreateSchema.safeParse({ ...base, reviewerName: ' A ' }).success).toBe(
      false,
    )
    expect(productReviewCreateSchema.safeParse({ ...base, body: 'x'.repeat(1001) }).success).toBe(
      false,
    )
  })
})

describe('reviewModerationSchema', () => {
  test('a rejection needs a reason, an approval does not', () => {
    expect(reviewModerationSchema.safeParse({ status: 'approved' }).success).toBe(true)
    expect(reviewModerationSchema.safeParse({ status: 'rejected' }).success).toBe(false)
    expect(
      reviewModerationSchema.safeParse({ status: 'rejected', rejectionReason: 'spam' }).success,
    ).toBe(true)
  })
})

describe('reviewReplySchema', () => {
  test('rejects an empty reply and very long ones', () => {
    expect(reviewReplySchema.safeParse({ reply: '   ' }).success).toBe(false)
    expect(reviewReplySchema.safeParse({ reply: 'x'.repeat(601) }).success).toBe(false)
    expect(reviewReplySchema.parse({ reply: ' Terima kasih! ' }).reply).toBe('Terima kasih!')
  })
})
