import { expect, test } from 'bun:test'
import { authErrorKey, isUnverified } from './auth-errors'

test('maps Better Auth codes to friendly messages', () => {
  expect(authErrorKey({ code: 'INVALID_OTP', status: 400 })).toBe('auth.error.INVALID_OTP')
  expect(authErrorKey({ code: 'SOMETHING_NEW', status: 400 })).toBe('auth.error.generic')
  expect(authErrorKey({ status: 429 })).toBe('auth.error.rateLimited')
  expect(authErrorKey(null)).toBe('auth.error.generic')
})

test('recognises an unverified email', () => {
  expect(isUnverified({ code: 'EMAIL_NOT_VERIFIED', status: 403 })).toBe(true)
  expect(isUnverified({ code: 'INVALID_EMAIL_OR_PASSWORD', status: 401 })).toBe(false)
})
