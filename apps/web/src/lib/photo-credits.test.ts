/// <reference types="bun" />
import { describe, expect, test } from 'bun:test'
import { join } from 'node:path'
import { licenseUrl, readPhotoCredits } from './photo-credits'

describe('licenseUrl', () => {
  test.each([
    ['CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
    ['CC BY 2.0', 'https://creativecommons.org/licenses/by/2.0/'],
    ['CC0', 'https://creativecommons.org/publicdomain/zero/1.0/'],
    ['Public domain', 'https://creativecommons.org/publicdomain/mark/1.0/'],
  ])('%s', (license, url) => {
    expect(licenseUrl(license)).toBe(url)
  })
})

test('every licensed sample photo has an author, a source and a known licence', async () => {
  const credits = await readPhotoCredits(join(import.meta.dir, '../../public/media'))
  expect(credits.length).toBeGreaterThan(20)
  for (const c of credits) {
    expect(c.licenseUrl).not.toBeNull()
    expect(c.source).toStartWith('https://')
    if (c.license !== 'Public domain' && c.license !== 'CC0') expect(c.author).toBeTruthy()
  }
})
