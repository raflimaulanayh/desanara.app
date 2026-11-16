import { describe, expect, test } from 'bun:test'
import { regionCodeSchema, regionSearchQuerySchema, regionSearchTerms } from './region'

describe('regionSearchTerms', () => {
  test('lowercases, splits and drops punctuation', () => {
    expect(regionSearchTerms('Baros, Kec. Arjasari')).toEqual(['baros', 'kec', 'arjasari'])
  })

  test('LIKE wildcards cannot reach the query', () => {
    expect(regionSearchTerms('%_ba%ros_')).toEqual(['ba', 'ros'])
  })

  test('keeps at most five words and ignores single letters', () => {
    expect(regionSearchTerms('a bb cc dd ee ff gg')).toEqual(['bb', 'cc', 'dd', 'ee', 'ff'])
  })
})

describe('region schemas', () => {
  test('codes follow the Kemendagri shape', () => {
    for (const ok of ['32', '32.04', '32.04.16', '32.04.16.2005']) {
      expect(regionCodeSchema.safeParse(ok).success).toBe(true)
    }
    for (const bad of ['3', '32.4', '32.04.16.205', '32.04.16.2005.1', "32' or 1=1"]) {
      expect(regionCodeSchema.safeParse(bad).success).toBe(false)
    }
  })

  test('search needs two characters and caps the limit', () => {
    expect(regionSearchQuerySchema.safeParse({ q: 'b' }).success).toBe(false)
    expect(regionSearchQuerySchema.safeParse({ q: 'ba', limit: '50' }).success).toBe(false)
    expect(regionSearchQuerySchema.parse({ q: ' baros ' })).toEqual({ q: 'baros', limit: 10 })
  })
})
