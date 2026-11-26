import { expect, test } from 'bun:test'
import { publicNavSection } from './paths'

test('mobile navigation highlights the section for public routes and the villages anchor', () => {
  expect(publicNavSection('/')).toBe('home')
  expect(publicNavSection('/', '#desa')).toBe('villages')
  expect(publicNavSection('/', '#main')).toBe('home')
  expect(publicNavSection('/jelajah')).toBe('products')
  expect(publicNavSection('/produk/kopi')).toBe('products')
  expect(publicNavSection('/desa')).toBe('villages')
  expect(publicNavSection('/desa/baros/warung')).toBe('villages')
  expect(publicNavSection('/pengaturan')).toBe('settings')
  expect(publicNavSection('/tentang')).toBeNull()
})
