import { expect, test } from 'bun:test'
import { NextRequest } from 'next/server'
import proxy from '../proxy'
import { getPathname } from './navigation'

const origin = 'https://desanara.example'
const headers = { 'accept-language': 'en-US,en;q=0.9', cookie: 'NEXT_LOCALE=en' }

test('unprefixed public URLs stay Indonesian with an English browser and locale cookie', () => {
  const response = proxy(new NextRequest(`${origin}/jelajah?q=kopi`, { headers }))
  expect(response.headers.get('location')).toBeNull()
  expect(response.headers.get('x-middleware-rewrite')).toBe(`${origin}/id/jelajah?q=kopi`)
  expect(response.headers.get('set-cookie')).toBeNull()
})

test('English URLs keep their prefix and legacy Indonesian URLs drop it', () => {
  const english = proxy(new NextRequest(`${origin}/en/jelajah`, { headers }))
  expect(english.headers.get('location')).toBeNull()
  expect(english.headers.get('x-middleware-rewrite')).toBeNull()
  const indonesian = proxy(new NextRequest(`${origin}/id/jelajah?q=kopi`, { headers }))
  expect(indonesian.headers.get('location')).toBe(`${origin}/jelajah?q=kopi`)
})

test('language settings link directly to each canonical URL', () => {
  expect(getPathname({ href: '/pengaturan', locale: 'id' })).toBe('/pengaturan')
  expect(getPathname({ href: '/pengaturan', locale: 'en' })).toBe('/en/pengaturan')
})
