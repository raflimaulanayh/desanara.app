import { expect, test } from 'bun:test'
import { absoluteUrl, isIndexable, localeAlternates, pageAlternates, siteUrl } from './site-url'

const base = 'https://desanara.app'

test('the default locale has no prefix, English is under /en', () => {
  expect(absoluteUrl('/', 'id', base)).toBe('https://desanara.app')
  expect(absoluteUrl('/', 'en', base)).toBe('https://desanara.app/en')
  expect(absoluteUrl('/desa/baros', 'id', base)).toBe('https://desanara.app/desa/baros')
  expect(absoluteUrl('/desa/baros', 'en', base)).toBe('https://desanara.app/en/desa/baros')
})

test('alternates list every locale and x-default', () => {
  expect(localeAlternates('/produk/dodol', base)).toEqual({
    id: 'https://desanara.app/produk/dodol',
    en: 'https://desanara.app/en/produk/dodol',
    'x-default': 'https://desanara.app/produk/dodol',
  })
  expect(pageAlternates('/jelajah', 'en', base).canonical).toBe('https://desanara.app/en/jelajah')
})

test('site URL drops the trailing slash and refuses to fall back to localhost in production', () => {
  expect(siteUrl({ NEXT_PUBLIC_WEB_URL: 'https://desanara.app/' })).toBe(base)
  expect(siteUrl({})).toBe('http://localhost:3000')
  expect(() => siteUrl({ VERCEL_ENV: 'production' })).toThrow()
})

test('only production sites are indexable, on Vercel or elsewhere', () => {
  expect(isIndexable({ VERCEL_ENV: 'production', NEXT_PUBLIC_WEB_URL: base })).toBe(true)
  expect(isIndexable({ VERCEL_ENV: 'preview', NEXT_PUBLIC_WEB_URL: base })).toBe(false)
  expect(isIndexable({ NEXT_PUBLIC_WEB_URL: base })).toBe(true)
  expect(isIndexable({ NEXT_PUBLIC_WEB_URL: 'http://localhost:3000' })).toBe(false)
  expect(isIndexable({})).toBe(false)
})
