import { describe, expect, test } from 'bun:test'
import { contrastRatio, readableForeground, WHITE } from './color'
import {
  DEFAULT_VILLAGE_THEME,
  MIN_ACCENT_CONTRAST,
  parseVillageTheme,
  villageThemePresets,
  villageThemeSchema,
} from './village-theme'

describe('colour helpers', () => {
  test('contrast of black on white is 21', () => {
    expect(contrastRatio('#000000', WHITE)).toBeCloseTo(21, 5)
  })
  test('readableForeground picks white on dark and ink on light', () => {
    expect(readableForeground('#1565c0')).toBe(WHITE)
    expect(readableForeground('#fde68a')).not.toBe(WHITE)
  })
})

describe('villageThemeSchema', () => {
  test('default theme and every preset are valid', () => {
    expect(villageThemeSchema.safeParse(DEFAULT_VILLAGE_THEME).success).toBe(true)
    for (const p of villageThemePresets) {
      expect(contrastRatio(p.accent, WHITE)).toBeGreaterThanOrEqual(MIN_ACCENT_CONTRAST)
      expect(
        villageThemeSchema.safeParse({ ...DEFAULT_VILLAGE_THEME, accent: p.accent }).success,
      ).toBe(true)
    }
  })
  test('rejects colours unreadable on white', () => {
    expect(
      villageThemeSchema.safeParse({ ...DEFAULT_VILLAGE_THEME, accent: '#fde68a' }).success,
    ).toBe(false)
  })
  test('rejects unknown templates and fonts', () => {
    expect(
      villageThemeSchema.safeParse({ ...DEFAULT_VILLAGE_THEME, template: 'neon' }).success,
    ).toBe(false)
    expect(
      villageThemeSchema.safeParse({ ...DEFAULT_VILLAGE_THEME, font: 'comic-sans' }).success,
    ).toBe(false)
  })
})

describe('parseVillageTheme', () => {
  test('null and garbage fall back to the default', () => {
    expect(parseVillageTheme(null)).toEqual(DEFAULT_VILLAGE_THEME)
    expect(parseVillageTheme('oops')).toEqual(DEFAULT_VILLAGE_THEME)
  })
  test('keeps valid fields and repairs invalid ones', () => {
    const theme = parseVillageTheme({ accent: '#1565c0', font: 'comic-sans', radius: 'pill' })
    expect(theme).toEqual({ ...DEFAULT_VILLAGE_THEME, accent: '#1565c0', radius: 'pill' })
  })
})
