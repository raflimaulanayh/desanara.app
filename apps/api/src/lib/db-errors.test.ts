import { expect, test } from 'bun:test'
import { isUniqueViolation } from './db-errors'

test('recognises a unique violation, wrapped by drizzle or not', () => {
  expect(isUniqueViolation({ code: '23505' })).toBe(true)
  expect(
    isUniqueViolation(Object.assign(new Error('query failed'), { cause: { code: '23505' } })),
  ).toBe(true)
  expect(isUniqueViolation(Object.assign(new Error('x'), { cause: { code: '23503' } }))).toBe(false)
  expect(isUniqueViolation(null)).toBe(false)
})
