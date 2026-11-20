import { expect, test } from 'bun:test'
import { loadEnv } from './env'

const base = { DATABASE_URL: 'postgres://x', BETTER_AUTH_SECRET: 'x'.repeat(32) }

test('the live site needs a Resend key; previews and local development do not', () => {
  const silence = console.error
  console.error = () => {}
  try {
    expect(() => loadEnv({ ...base, NODE_ENV: 'production', VERCEL_ENV: 'production' })).toThrow()
    expect(() => loadEnv({ ...base, NODE_ENV: 'production' })).toThrow()
    expect(
      loadEnv({ ...base, NODE_ENV: 'production', VERCEL_ENV: 'preview' }).RESEND_API_KEY,
    ).toBeUndefined()
    expect(loadEnv({ ...base }).NODE_ENV).toBe('development')
    expect(
      loadEnv({ ...base, NODE_ENV: 'production', VERCEL_ENV: 'production', RESEND_API_KEY: 're_x' })
        .RESEND_API_KEY,
    ).toBe('re_x')
  } finally {
    console.error = silence
  }
})
