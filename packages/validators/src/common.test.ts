import { describe, expect, test } from 'bun:test'
import { whatsappNumberSchema } from './common'

describe('whatsappNumberSchema', () => {
  test.each([
    ['081234567890', '6281234567890'],
    ['+62 812-3456-7890', '6281234567890'],
    ['6281234567890', '6281234567890'],
  ])('normalises %s', (input, expected) => {
    expect(whatsappNumberSchema.parse(input)).toBe(expected)
  })

  test('rejects non-mobile numbers', () => {
    expect(whatsappNumberSchema.safeParse('0221234567').success).toBe(false)
  })
})
