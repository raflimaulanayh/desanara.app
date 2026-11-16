import { describe, expect, test } from 'bun:test'
import { slugSchema } from './common'
import { slugWithSuffix, toSlug } from './slug'

describe('toSlug', () => {
  test('lowercases, strips accents and joins words with hyphens', () => {
    expect(toSlug('Kopi Gayo  Pak Ujang')).toBe('kopi-gayo-pak-ujang')
    expect(toSlug('Café Ibu Siti')).toBe('cafe-ibu-siti')
    expect(toSlug('Kripik & Rengginang')).toBe('kripik-dan-rengginang')
    expect(toSlug('  --Batik "Baros"-- ')).toBe('batik-baros')
  })

  test('falls back when the name has too few usable characters', () => {
    expect(toSlug('!!')).toBe('umkm')
    expect(toSlug('AB', 'produk')).toBe('produk')
  })

  test('always passes slugSchema and stays within 60 characters', () => {
    const long = toSlug('Usaha '.repeat(30))
    expect(long.length).toBeLessThanOrEqual(60)
    for (const s of [long, toSlug('Kopi Gayo'), slugWithSuffix(long, 12)]) {
      expect(slugSchema.safeParse(s).success).toBe(true)
    }
  })

  test('slugWithSuffix numbers duplicates from 2', () => {
    expect(slugWithSuffix('kopi-gayo', 1)).toBe('kopi-gayo')
    expect(slugWithSuffix('kopi-gayo', 2)).toBe('kopi-gayo-2')
    expect(slugWithSuffix('a'.repeat(60), 3)).toBe(`${'a'.repeat(58)}-3`)
  })
})
