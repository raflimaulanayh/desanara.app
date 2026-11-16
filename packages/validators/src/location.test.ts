import { describe, expect, test } from 'bun:test'
import { businessCreateSchema, businessUpdateSchema } from './business'
import { formatRtRw, isInIndonesia, roundCoordinate, rtRwSchema } from './location'
import { villageSettingsSchema } from './village'

const villageId = '0b7a2f4e-8a5e-4f7b-9a43-5b8f1c2d3e4f'

describe('RT/RW', () => {
  test('stored as three digits, whatever was typed', () => {
    expect(rtRwSchema.parse('1')).toBe('001')
    expect(rtRwSchema.parse(' 12 ')).toBe('012')
    expect(rtRwSchema.parse('005')).toBe('005')
  })

  test('rejects zero, letters and long numbers', () => {
    for (const bad of ['0', '000', 'RT 1', '1234', '-1']) {
      expect(rtRwSchema.safeParse(bad).success).toBe(false)
    }
  })

  test('formats what is known', () => {
    expect(formatRtRw('001', '002')).toBe('RT 001 / RW 002')
    expect(formatRtRw(null, '002')).toBe('RW 002')
    expect(formatRtRw(null, null)).toBe('')
  })
})

describe('map pin', () => {
  test('inside Indonesia only (catches swapped or zero coordinates)', () => {
    expect(isInIndonesia(-7.0658, 107.6302)).toBe(true)
    expect(isInIndonesia(107.6302, -7.0658)).toBe(false)
    expect(isInIndonesia(0, 0)).toBe(false)
    expect(isInIndonesia(51.5, -0.12)).toBe(false)
  })

  test('rounds to six decimals', () => {
    expect(roundCoordinate(-7.065772264163892)).toBe(-7.065772)
  })

  test('create needs both coordinates or none', () => {
    const base = { villageId, name: 'Keripik Bu Ani' }
    expect(businessCreateSchema.safeParse({ ...base, lat: -7.06, lng: 107.63 }).success).toBe(true)
    expect(businessCreateSchema.safeParse(base).success).toBe(true)
    const half = businessCreateSchema.safeParse({ ...base, lat: -7.06 })
    expect(half.success).toBe(false)
    expect(half.error?.issues[0]?.path).toEqual(['lat'])
  })

  test('update can clear the pin with null on both, not on one', () => {
    expect(businessUpdateSchema.safeParse({ lat: null, lng: null }).success).toBe(true)
    expect(businessUpdateSchema.safeParse({ lat: null, lng: 107.63 }).success).toBe(false)
    expect(businessUpdateSchema.parse({ rt: '', rw: '7' }) as unknown).toEqual({
      rt: null,
      rw: '007',
    })
  })
})

describe('village settings', () => {
  test('centre moves as a pair, can reset to the region, contact fields clear with ""', () => {
    expect(
      villageSettingsSchema.parse({ centerLat: -7.0658, centerLng: 107.6302 }) as unknown,
    ).toEqual({
      centerLat: -7.0658,
      centerLng: 107.6302,
    })
    expect(villageSettingsSchema.safeParse({ centerLat: null, centerLng: null }).success).toBe(true)
    expect(villageSettingsSchema.safeParse({ centerLat: -7.06 }).success).toBe(false)
    expect(
      villageSettingsSchema.parse({ contactEmail: '', contactPhone: '022-5950 123' }) as unknown,
    ).toEqual({
      contactEmail: null,
      contactPhone: '022-5950 123',
    })
    expect(villageSettingsSchema.safeParse({ contactPhone: 'telepon' }).success).toBe(false)
  })
})
