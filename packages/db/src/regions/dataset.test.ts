/// <reference types="bun" />
import { describe, expect, test } from 'bun:test'
import { LEVELS, parseRegionsCsv, readRegionDataset } from './dataset'

describe('committed region dataset', () => {
  const rows = readRegionDataset()
  const byCode = new Map(rows.map((r) => [r.code, r]))

  test('matches the Kepmendagri 2025 recapitulation', () => {
    const count = (level: string) => rows.filter((r) => r.level === level).length
    expect([count('province'), count('regency'), count('district'), count('village')]).toEqual([
      38, 514, 7285, 83762,
    ])
    expect(byCode.size).toBe(rows.length)
  })

  test('every row has its parent earlier in the file (safe insert order) and a matching level', () => {
    const seen = new Set<string>()
    for (const r of rows) {
      expect(r.level).toBe(LEVELS[r.code.split('.').length - 1]!)
      if (r.parentCode) expect(seen.has(r.parentCode)).toBe(true)
      seen.add(r.code)
    }
  })

  test('the pilot village is there with a centre point inside Indonesia', () => {
    const baros = byCode.get('32.04.16.2005')!
    expect(baros.fullName).toBe('Baros, Kec. Arjasari, Kabupaten Bandung, Jawa Barat')
    expect(baros.lat).toBeCloseTo(-7.0658, 3)
    expect(baros.lng).toBeCloseTo(107.6302, 3)
    for (const r of rows) {
      if (r.lat === null) continue
      expect(r.lat > -12 && r.lat < 7 && r.lng! > 94 && r.lng! < 142).toBe(true)
    }
  })
})

describe('parseRegionsCsv', () => {
  test('reads quoted fields and empty coordinates', () => {
    const csv =
      'code,name,level,parent_code,full_name,lat,lng\n32,Jawa Barat,province,,Jawa Barat,,\n' +
      '32.04,"Bandung, ""Kab""",regency,32,"Bandung, Jawa Barat",-7.1,107.6\n'
    expect(parseRegionsCsv(csv)).toEqual([
      {
        code: '32',
        name: 'Jawa Barat',
        level: 'province',
        parentCode: null,
        fullName: 'Jawa Barat',
        lat: null,
        lng: null,
      },
      {
        code: '32.04',
        name: 'Bandung, "Kab"',
        level: 'regency',
        parentCode: '32',
        fullName: 'Bandung, Jawa Barat',
        lat: -7.1,
        lng: 107.6,
      },
    ])
  })

  test('refuses an unexpected header', () => {
    expect(() => parseRegionsCsv('kode,nama\n')).toThrow('Unexpected regions CSV header')
  })
})
