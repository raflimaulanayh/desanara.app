/// <reference types="bun" />
import { describe, expect, test } from 'bun:test'
import { ApiError } from '@repo/api-client'
import type { Actor } from '@repo/auth/permissions'
import { describeApiError, fieldErrors, readableData } from './api-errors'
import { clearDrafts, draftKey, readDraft, writeDraft } from './form-draft'
import {
  canReview,
  canSeeBusinesses,
  isActive,
  manageableVillageIds,
  navFor,
  safeNext,
} from './nav'

const actor = (over: Partial<Actor> = {}): Actor => ({
  userId: 'u1',
  globalRole: null,
  villageRoles: {},
  businessRoles: {},
  ...over,
})

describe('nav', () => {
  test('safeNext keeps same-site paths only', () => {
    expect(safeNext('/businesses/1')).toBe('/businesses/1')
    for (const bad of [null, '', 'https://evil.test', '//evil.test', '/\\evil.test']) {
      expect(safeNext(bad)).toBe('/')
    }
  })

  test('isActive: home is exact, sections match their children', () => {
    expect(isActive('/', '/')).toBe(true)
    expect(isActive('/businesses', '/')).toBe(false)
    expect(isActive('/businesses/abc', '/businesses')).toBe(true)
    expect(isActive('/products/abc', '/businesses')).toBe(true)
    expect(isActive('/productsx', '/businesses')).toBe(false)
    expect(isActive('/businessesx', '/businesses')).toBe(false)
  })

  test('menu visibility follows roles', () => {
    expect(canSeeBusinesses(actor())).toBe(false)
    expect(canSeeBusinesses(actor({ businessRoles: { b1: 'owner' } }))).toBe(true)
    expect(canReview(actor({ villageRoles: { v1: 'village_assistant' } }))).toBe(false)
    expect(canReview(actor({ villageRoles: { v1: 'village_admin' } }))).toBe(true)
    expect(canReview(actor({ globalRole: 'super_admin' }))).toBe(true)
  })
})

describe('api errors', () => {
  const messages: Record<string, string> = {
    'errors.generic': 'generic',
    'errors.network': 'network',
    'errors.invalid': 'invalid',
    'errors.conflict': 'conflict',
    'errors.sessionExpired': 'expired',
    'errors.reason.NO_PHOTO': 'Tambahkan minimal 1 foto',
  }
  const t = Object.assign((k: string) => messages[k] ?? k, { has: (k: string) => k in messages })
  const apiError = (status: number, details?: unknown) =>
    new ApiError(status, { error: { code: 'X', message: 'x', details } })

  test('409 reason codes become plain sentences; unknown ones fall back', () => {
    expect(describeApiError(apiError(409, { reason: 'NO_PHOTO' }), t).message).toBe(
      'Tambahkan minimal 1 foto',
    )
    expect(describeApiError(apiError(409, { reason: 'NEW_CODE' }), t).message).toBe('conflict')
  })

  test('422 maps field errors, nested paths included', () => {
    const details = {
      errors: [],
      properties: {
        price: { errors: ['Harga minimal Rp100'] },
        en: { errors: [], properties: { name: { errors: ['Too short'] } } },
      },
    }
    expect(fieldErrors(details)).toEqual({ price: 'Harga minimal Rp100', 'en.name': 'Too short' })
    expect(describeApiError(apiError(422, details), t).fields.price).toBe('Harga minimal Rp100')
  })

  test('401 asks for a new login; non-API errors are network errors', () => {
    expect(describeApiError(apiError(401), t).sessionExpired).toBe(true)
    expect(describeApiError(new TypeError('Failed to fetch'), t).message).toBe('network')
  })

  test('cached data stays available during outages and is hidden after access is lost', () => {
    const data = { name: 'UMKM' }
    expect(readableData({ data, error: apiError(503) })).toBe(data)
    expect(readableData({ data, error: new TypeError('Failed to fetch') })).toBe(data)
    for (const status of [401, 403, 404]) {
      expect(readableData({ data, error: apiError(status) })).toBeUndefined()
    }
  })
})

describe('form drafts', () => {
  const store = new Map<string, string>()
  globalThis.localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: (i: number) => [...store.keys()][i] ?? null,
    get length() {
      return store.size
    },
  } as Storage

  test('drafts are per user and expire after 14 days', () => {
    const now = Date.now()
    writeDraft(draftKey('u1', 'product:new'), { name: 'Keripik' }, now)
    expect(readDraft(draftKey('u1', 'product:new'), now)?.value).toEqual({ name: 'Keripik' })
    expect(readDraft(draftKey('u2', 'product:new'), now)).toBeNull()
    expect(readDraft(draftKey('u1', 'product:new'), now + 15 * 24 * 3600 * 1000)).toBeNull()
  })

  test('logout clears only that user', () => {
    writeDraft(draftKey('u1', 'a'), 1)
    writeDraft(draftKey('u2', 'a'), 2)
    store.set('other', 'x')
    clearDrafts('u1')
    expect(store.has(draftKey('u1', 'a'))).toBe(false)
    expect(store.has(draftKey('u2', 'a'))).toBe(true)
    expect(store.has('other')).toBe(true)
  })
})

test('Pengaturan desa: village admins and super admins, never assistants or owners', () => {
  const labels = (a: Parameters<typeof navFor>[0]) => navFor(a, (k) => k).map((i) => i.label)
  const admin = actor({ villageRoles: { v1: 'village_admin', v2: 'village_assistant' } })
  expect(manageableVillageIds(admin)).toEqual(['v1'])
  expect(labels(admin)).toContain('villageSettings')
  expect(labels(actor({ globalRole: 'super_admin' }))).toContain('villageSettings')
  expect(labels(actor({ villageRoles: { v1: 'village_assistant' } }))).not.toContain(
    'villageSettings',
  )
  expect(labels(actor({ businessRoles: { b1: 'owner' } }))).not.toContain('villageSettings')
})

test('Ulasan: village moderators, business members and the super admin', () => {
  const labels = (a: Parameters<typeof navFor>[0]) => navFor(a, (k) => k).map((i) => i.label)
  expect(labels(actor({ villageRoles: { v1: 'village_assistant' } }))).toContain('reviews')
  expect(labels(actor({ villageRoles: { v1: 'village_admin' } }))).toContain('reviews')
  expect(labels(actor({ businessRoles: { b1: 'owner' } }))).toContain('reviews')
  expect(labels(actor({ globalRole: 'super_admin' }))).toContain('reviews')
  expect(labels(actor({}))).not.toContain('reviews')
})
