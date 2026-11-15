import { describe, expect, test } from 'bun:test'
import { createAuth } from '@repo/auth/server'
import { createDb } from '@repo/db'
import { createApp } from './app'

// No database needed: these routes never query it. postgres.js connects lazily.
const db = createDb('postgres://postgres:postgres@localhost:5999/never_used', { max: 1 })
const auth = createAuth({
  db,
  secret: 'test-secret-test-secret',
  baseURL: 'http://localhost:8787',
  trustedOrigins: [],
})
const app = createApp({ db, auth, trustedOrigins: [], logRequests: false })

describe('api', () => {
  test('GET /health', async () => {
    const res = await app.request('/health')
    expect(res.status).toBe(200)
    expect(((await res.json()) as { status: string }).status).toBe('ok')
  })

  test('GET /health/ready reports an unreachable database as 503', async () => {
    const res = await app.request('/health/ready')
    expect(res.status).toBe(503)
    expect(((await res.json()) as { database: boolean }).database).toBe(false)
  })

  test('unknown route uses the error envelope', async () => {
    const res = await app.request('/nope')
    expect(res.status).toBe(404)
    const body = (await res.json()) as { error: { code: string; requestId: string } }
    expect(body.error.code).toBe('NOT_FOUND')
    expect(body.error.requestId).toBeTruthy()
  })

  test('GET /v1/me without a session is 401', async () => {
    const res = await app.request('/v1/me')
    expect(res.status).toBe(401)
    expect(((await res.json()) as { error: { code: string } }).error.code).toBe('UNAUTHENTICATED')
  })

  test('invalid pagination is 422', async () => {
    const res = await app.request('/v1/villages?pageSize=999')
    expect(res.status).toBe(422)
  })

  test('OpenAPI document is served', async () => {
    const res = await app.request('/openapi.json')
    expect(res.status).toBe(200)
    const doc = (await res.json()) as { paths: Record<string, unknown> }
    expect(Object.keys(doc.paths)).toContain('/v1/villages')
  })
})

describe('API reference access', () => {
  const basic = createApp({
    db,
    auth,
    trustedOrigins: [],
    logRequests: false,
    docs: { mode: 'basic', username: 'desanara', password: 'correct-horse-battery' },
  })
  const off = createApp({ db, auth, trustedOrigins: [], logRequests: false, docs: { mode: 'off' } })
  const header = (u: string, p: string) => ({ Authorization: `Basic ${btoa(`${u}:${p}`)}` })

  test('protected docs require credentials', async () => {
    expect((await basic.request('/docs')).status).toBe(401)
    expect((await basic.request('/openapi.json')).status).toBe(401)
    expect((await basic.request('/docs', { headers: header('desanara', 'wrong') })).status).toBe(
      401,
    )
  })

  test('protected docs open with the right credentials', async () => {
    const ok = header('desanara', 'correct-horse-battery')
    expect((await basic.request('/docs', { headers: ok })).status).toBe(200)
    expect((await basic.request('/openapi.json', { headers: ok })).status).toBe(200)
  })

  test('protection does not touch the public API', async () => {
    expect((await basic.request('/health')).status).toBe(200)
  })

  test('docs can be switched off entirely', async () => {
    expect((await off.request('/docs')).status).toBe(404)
    expect((await off.request('/openapi.json')).status).toBe(404)
  })
})
