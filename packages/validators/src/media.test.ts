import { describe, expect, test } from 'bun:test'
import { fitWithin, mediaPresignSchema, productImageOrderSchema } from './media'

const id = '0b7a2f4e-8a5e-4f7b-9a43-5b8f1c2d3e4f'

describe('mediaPresignSchema', () => {
  test('limits follow the target', () => {
    const ok = { target: 'product_image', id, contentType: 'image/webp', size: 2 * 1024 * 1024 }
    expect(mediaPresignSchema.safeParse(ok).success).toBe(true)
    expect(mediaPresignSchema.safeParse({ ...ok, target: 'business_logo' }).success).toBe(false)
  })

  test('only re-encoded WebP/JPEG are accepted (no PNG, SVG or HEIC)', () => {
    for (const contentType of ['image/png', 'image/svg+xml', 'image/heic']) {
      const input = { target: 'product_image', id, contentType, size: 1000 }
      expect(mediaPresignSchema.safeParse(input).success).toBe(false)
    }
  })
})

describe('productImageOrderSchema', () => {
  test('rejects duplicates and more than 10 photos', () => {
    expect(productImageOrderSchema.safeParse({ order: [id, id] }).success).toBe(false)
    const eleven = Array.from({ length: 11 }, () => crypto.randomUUID())
    expect(productImageOrderSchema.safeParse({ order: eleven }).success).toBe(false)
  })
})

describe('fitWithin', () => {
  test('scales the longest edge down and never up', () => {
    expect(fitWithin(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 })
    expect(fitWithin(3000, 4000, 1600)).toEqual({ width: 1200, height: 1600 })
    expect(fitWithin(800, 600, 1600)).toEqual({ width: 800, height: 600 })
  })
})
