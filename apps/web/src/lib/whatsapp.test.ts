/// <reference types="bun" />
import { describe, expect, test } from 'bun:test'
import { buildOrderMessage, orderTotal } from './whatsapp'

const base = {
  businessName: 'Keripik Bu Ani',
  villageName: 'Desa Baros',
  productUrl: 'https://desanara.example/produk/keripik',
}
const line = { name: 'Keripik Singkong 250 gr', quantity: 2 }
// formatRupiah uses Intl, which may put a non-breaking space after "Rp".
const plain = (s: string) => s.replace(/\u00a0/g, ' ')

describe('buildOrderMessage', () => {
  test('regular price: greeting, unit price and total', () => {
    const msg = plain(buildOrderMessage({ ...base, lines: [{ ...line, price: 15000 }] }))
    expect(msg).toStartWith('Halo Keripik Bu Ani (Desa Baros), saya mau pesan:')
    expect(msg).toContain('2 x Keripik Singkong 250 gr')
    expect(msg).toMatch(/Rp ?15\.000 per item = Rp ?30\.000/)
    expect(msg).toMatch(/Total: Rp ?30\.000/)
    expect(msg).not.toContain('harga normal')
    expect(msg).toContain('Produk: https://desanara.example/produk/keripik')
  })

  test('discount: repeats the normal price so the seller honours the promo', () => {
    const msg = plain(
      buildOrderMessage({ ...base, lines: [{ ...line, price: 20000, compareAtPrice: 25000 }] }),
    )
    expect(msg).toMatch(/Rp ?20\.000 per item \(harga normal Rp ?25\.000\) = Rp ?40\.000/)
  })

  test('free: says "Gratis" instead of Rp0', () => {
    const msg = plain(
      buildOrderMessage({ ...base, lines: [{ ...line, price: 0, compareAtPrice: 5000 }] }),
    )
    expect(msg).toMatch(/Gratis \(harga normal Rp ?5\.000\)/)
    expect(msg).toContain('Total: Gratis')
    expect(msg).not.toMatch(/Rp ?0\b/)
  })

  test('several items from the same shop add up; zero quantities are left out', () => {
    const lines = [
      { ...line, price: 15000 },
      { name: 'Opak Bakar (isi 10)', price: 12000, quantity: 1 },
      { name: 'Rengginang', price: 20000, quantity: 0 },
    ]
    const msg = plain(buildOrderMessage({ ...base, lines }))
    expect(msg).toContain('1 x Opak Bakar (isi 10)')
    expect(msg).not.toContain('Rengginang')
    expect(msg).toMatch(/Total: Rp ?42\.000/)
    expect(orderTotal(lines)).toBe(42000)
  })

  test('buyer details: name, how to receive, district only when it is delivered', () => {
    const delivered = buildOrderMessage({
      ...base,
      lines: [{ ...line, price: 15000 }],
      buyer: { name: '  Dewi ', delivery: 'delivery', area: 'Kec. Arjasari' },
      note: ' pedas ',
    })
    expect(delivered).toContain('Nama: Dewi')
    expect(delivered).toContain('Pengambilan: Diantar penjual ke Kec. Arjasari')
    expect(delivered).toContain('Catatan: pedas')

    const pickup = buildOrderMessage({
      ...base,
      lines: [{ ...line, price: 15000 }],
      buyer: { name: 'Dewi', delivery: 'pickup', area: 'Kec. Arjasari' },
    })
    expect(pickup).toContain('Pengambilan: Ambil sendiri')
    expect(pickup).not.toContain('Arjasari')
  })
})
