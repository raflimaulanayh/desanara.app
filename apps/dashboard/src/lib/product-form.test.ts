/// <reference types="bun" />
import { describe, expect, test } from 'bun:test'
import { productCreateSchema, productUpdateSchema } from '@repo/validators'
import {
  digitsOnly,
  formatDigits,
  moveItem,
  priceErrors,
  toCreateInput,
  toPatch,
  valuesFrom,
} from './product-form'
import type { Product } from './products'

const t = (key: string) => key
const categoryId = '0b7a2f4e-8a5e-4f7b-9a43-5b8f1c2d3e4f'

const original = {
  name: 'Keripik Singkong Balado 250 gr',
  category: { id: categoryId, slug: 'makanan-camilan', name: 'Makanan & Camilan' },
  description: 'Pedas manis',
  price: 17000,
  compareAtPrice: 20000,
  isFree: false,
  isAvailable: true,
  en: { name: 'Spicy Cassava Chips 250 g', description: null },
} as unknown as Product

describe('price input', () => {
  test('keeps digits only, so a decimal can never sneak in', () => {
    expect(digitsOnly('Rp 15.000')).toBe('15000')
    expect(digitsOnly('15,5')).toBe('155')
    expect(digitsOnly('007')).toBe('7')
    expect(digitsOnly('0')).toBe('0')
    expect(digitsOnly('')).toBe('')
  })

  test('shows Indonesian thousand dots', () => {
    expect(formatDigits('15000')).toBe('15.000')
    expect(formatDigits('1250000')).toBe('1.250.000')
    expect(formatDigits('900')).toBe('900')
  })
})

describe('create input', () => {
  test('a filled form passes the shared schema', () => {
    const v = {
      ...valuesFrom(null),
      name: '  Keripik Singkong Original 250 gr ',
      categoryId,
      price: '15000',
      onPromo: true,
      compareAtPrice: '18000',
    }
    const input = toCreateInput(v)
    expect(input).toEqual({
      categoryId,
      name: 'Keripik Singkong Original 250 gr',
      price: 15000,
      compareAtPrice: 18000,
      isAvailable: true,
    })
    expect(productCreateSchema.safeParse(input).success).toBe(true)
  })

  test('free sends price 0 and ignores the typed price', () => {
    const v = { ...valuesFrom(null), name: 'Sampel', categoryId, price: '5000', isFree: true }
    expect(toCreateInput(v).price).toBe(0)
  })

  test('a promo switched off sends no struck-through price', () => {
    const v = { ...valuesFrom(null), price: '15000', onPromo: false, compareAtPrice: '18000' }
    expect(toCreateInput(v)).not.toHaveProperty('compareAtPrice')
  })
})

describe('patch', () => {
  test('nothing changed: empty patch', () => {
    expect(toPatch(original, valuesFrom(original))).toEqual({})
  })

  test('ending a promo clears the struck-through price', () => {
    const patch = toPatch(original, { ...valuesFrom(original), onPromo: false })
    expect(patch).toEqual({ compareAtPrice: null })
    expect(productUpdateSchema.safeParse(patch).success).toBe(true)
  })

  test('emptying the English name removes the translation', () => {
    expect(toPatch(original, { ...valuesFrom(original), enName: ' ' })).toEqual({ en: null })
  })

  test('making it free sends price 0', () => {
    expect(toPatch(original, { ...valuesFrom(original), isFree: true })).toEqual({ price: 0 })
  })
})

describe('price errors', () => {
  test('asks for a price in words, and refuses a typo below Rp100', () => {
    expect(priceErrors(valuesFrom(null), t).price).toBe('productForm.priceRequired')
    expect(priceErrors({ ...valuesFrom(null), price: '50' }, t).price).toBe(
      'productForm.priceTooLow',
    )
    expect(priceErrors({ ...valuesFrom(null), isFree: true }, t)).toEqual({})
  })

  test('the struck-through price must be above the selling price', () => {
    const v = { ...valuesFrom(null), price: '20000', onPromo: true, compareAtPrice: '20000' }
    expect(priceErrors(v, t).compareAtPrice).toContain('lebih tinggi')
  })
})

describe('moveItem', () => {
  test('moves left, right and to the front', () => {
    expect(moveItem(['a', 'b', 'c'], 1, 0)).toEqual(['b', 'a', 'c'])
    expect(moveItem(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a'])
  })

  test('ignores moves past either end', () => {
    expect(moveItem(['a', 'b'], 0, -1)).toEqual(['a', 'b'])
    expect(moveItem(['a', 'b'], 1, 2)).toEqual(['a', 'b'])
  })
})
