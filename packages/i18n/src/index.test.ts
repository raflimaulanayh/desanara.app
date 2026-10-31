import { describe, expect, test } from 'bun:test'
import { buildWhatsAppLink, formatRupiah } from './index'

describe('formatRupiah', () => {
  test('formats IDR without decimals', () => {
    expect(formatRupiah(15000).replace(/\s/g, '')).toBe('Rp15.000')
  })
})

describe('buildWhatsAppLink', () => {
  test('encodes the message', () => {
    expect(buildWhatsAppLink('6281234567890', 'Halo, saya mau pesan')).toBe(
      'https://wa.me/6281234567890?text=Halo%2C%20saya%20mau%20pesan',
    )
  })
})
