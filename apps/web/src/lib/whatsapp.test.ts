/// <reference types="bun" />
import { describe, expect, test } from 'bun:test'
import { buildOrderMessage } from './whatsapp'

const base = {
  businessName: 'Keripik Bu Ani',
  villageName: 'Desa Baros',
  productUrl: 'https://desanara.example/produk/keripik',
}
const line = { name: 'Keripik Singkong 250 gr', quantity: 2 }
// formatRupiah uses Intl, which may put a non-breaking space after "Rp".
const plain = (s: string) => s.replace(/\u00a0/g, ' ')

describe('buildOrderMessage', () => {
  test('regular price: unit price and total', () => {
    const msg = plain(buildOrderMessage({ ...base, line: { ...line, price: 15000 } }))
    expect(msg).toContain('2 × Keripik Singkong 250 gr')
    expect(msg).toMatch(/@ Rp ?15\.000 = Rp ?30\.000/)
    expect(msg).not.toContain('harga normal')
  })

  test('discount: repeats the normal price so the seller honours the promo', () => {
    const msg = plain(
      buildOrderMessage({ ...base, line: { ...line, price: 20000, compareAtPrice: 25000 } }),
    )
    expect(msg).toMatch(/@ Rp ?20\.000 \(harga normal Rp ?25\.000\) = Rp ?40\.000/)
  })

  test('free: says "Gratis" instead of Rp0', () => {
    const msg = plain(
      buildOrderMessage({ ...base, line: { ...line, price: 0, compareAtPrice: 5000 } }),
    )
    expect(msg).toMatch(/@ Gratis \(harga normal Rp ?5\.000\)/)
    expect(msg).toContain('Jumlah: Gratis')
    expect(msg).not.toMatch(/Rp ?0\b/)
  })
})
