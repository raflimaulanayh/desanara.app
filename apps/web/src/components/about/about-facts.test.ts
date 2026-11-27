import { describe, expect, test } from 'bun:test'
import { ABOUT_REGENCIES, ABOUT_STATS, HERO_PRODUCTS, OTHER_VILLAGES } from './about-facts'

describe('about facts', () => {
  test('regency split adds up to the village count', () => {
    const total = ABOUT_REGENCIES.reduce((sum, regency) => sum + regency.villages, 0)
    expect(total).toBe(ABOUT_STATS.villages)
    expect(ABOUT_REGENCIES).toHaveLength(ABOUT_STATS.regencies)
  })

  test('the ribbon lists every partner village except Baros, once', () => {
    expect(OTHER_VILLAGES).toHaveLength(ABOUT_STATS.villages - 1)
    expect(new Set(OTHER_VILLAGES.map(([slug]) => slug)).size).toBe(OTHER_VILLAGES.length)
    expect(OTHER_VILLAGES.map(([slug]) => slug as string)).not.toContain('baros')
  })

  test('hero products are distinct and even in number, so the shapes alternate across the loop', () => {
    expect(new Set(HERO_PRODUCTS.map((p) => p.slug)).size).toBe(HERO_PRODUCTS.length)
    expect(HERO_PRODUCTS.length % 2).toBe(0)
  })
})
