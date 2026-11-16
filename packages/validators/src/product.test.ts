import { describe, expect, test } from 'bun:test'
import {
  discountPercent,
  productCreateSchema,
  productPriceSchema,
  productUpdateSchema,
} from './product'

const base = { categoryId: '0b7a2f4e-8a5e-4f7b-9a43-5b8f1c2d3e4f', name: 'Keripik Singkong' }

describe('productPriceSchema', () => {
  test('0 (free) and Rp100+ pass', () => {
    expect(productPriceSchema.safeParse(0).success).toBe(true)
    expect(productPriceSchema.safeParse(100).success).toBe(true)
    expect(productPriceSchema.safeParse(15000).success).toBe(true)
  })

  test('typos between 1 and 99, negatives, decimals and strings are rejected', () => {
    for (const v of [5, 99, -1, 1500.5, '15000', '']) {
      expect(productPriceSchema.safeParse(v).success).toBe(false)
    }
  })
})

describe('productCreateSchema', () => {
  test('category is required', () => {
    expect(productCreateSchema.safeParse({ name: 'Keripik', price: 15000 }).success).toBe(false)
  })

  test('availability defaults to true on create', () => {
    expect(productCreateSchema.parse({ ...base, price: 15000 }).isAvailable).toBe(true)
  })

  test('the struck-through price must be higher than the selling price', () => {
    const ok = { ...base, price: 20000, compareAtPrice: 25000 }
    expect(productCreateSchema.safeParse(ok).success).toBe(true)
    expect(productCreateSchema.safeParse({ ...ok, compareAtPrice: 20000 }).success).toBe(false)
    expect(productCreateSchema.safeParse({ ...base, price: 0, compareAtPrice: 5000 }).success).toBe(
      true,
    )
  })
})

describe('productUpdateSchema', () => {
  test('adds no defaults (regression: availability reset on every edit)', () => {
    expect(productUpdateSchema.parse({ price: 12000 }) as unknown).toEqual({ price: 12000 })
  })

  test('empty strings and null clear optional fields', () => {
    expect(productUpdateSchema.parse({ description: '', compareAtPrice: null, en: null })).toEqual({
      description: null,
      compareAtPrice: null,
      en: null,
    })
  })
})

describe('discountPercent', () => {
  test('rounds down so the badge never overstates the discount', () => {
    expect(discountPercent(20000, 25000)).toBe(20)
    expect(discountPercent(17000, 20000)).toBe(15)
    expect(discountPercent(9999, 10000)).toBeNull()
  })

  test('no badge for free products or without a struck-through price', () => {
    expect(discountPercent(0, 15000)).toBeNull()
    expect(discountPercent(15000, null)).toBeNull()
  })
})
