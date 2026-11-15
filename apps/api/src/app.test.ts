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
  const creds = { username: 'desanara', password: 'correct-horse-battery' }
  const locked = createApp({
    db,
    auth,
    trustedOrigins: [],
    logRequests: false,
    docs: { mode: 'password', ...creds },
  })
  const off = createApp({ db, auth, trustedOrigins: [], logRequests: false, docs: { mode: 'off' } })
  const form = (username: string, password: string) =>
    new URLSearchParams({ username, password }).toString()
  const login = (username: string, password: string) =>
    locked.request('/docs/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form(username, password),
    })
  const cookieOf = (res: Response) => (res.headers.get('Set-Cookie') ?? '').split(';')[0]!

  test('without a session, /docs sends the browser to the login page', async () => {
    const res = await locked.request('/docs')
    expect(res.status).toBe(302)
    expect(res.headers.get('Location')).toBe('/docs/login')
    expect((await locked.request('/openapi.json')).status).toBe(401)
  })

  test('the login page is a branded form', async () => {
    const html = await (await locked.request('/docs/login')).text()
    expect(html).toContain('Dokumentasi API')
    expect(html).toContain('autocomplete="current-password"')
  })

  test('wrong credentials stay on the form with an error', async () => {
    const res = await login('desanara', 'wrong-password')
    expect(res.status).toBe(401)
    expect(res.headers.get('Set-Cookie')).toBeNull()
    expect(await res.text()).toContain('role="alert"')
  })

  test('a correct login sets a strict, http-only session cookie and opens the docs', async () => {
    const res = await login(creds.username, creds.password)
    expect(res.status).toBe(303)
    const setCookie = res.headers.get('Set-Cookie') ?? ''
    expect(setCookie).toContain('HttpOnly')
    expect(setCookie).toContain('SameSite=Strict')
    const cookie = cookieOf(res)
    const docs = await locked.request('/docs', { headers: { Cookie: cookie } })
    expect(docs.status).toBe(200)
    // The document is embedded, so the page needs no second request.
    expect(await docs.text()).toContain('/v1/villages')
    expect((await locked.request('/openapi.json', { headers: { Cookie: cookie } })).status).toBe(
      200,
    )
  })

  test('a forged cookie is rejected', async () => {
    const forged = `desanara_docs=${Date.now() + 1e9}.AAAA`
    expect((await locked.request('/openapi.json', { headers: { Cookie: forged } })).status).toBe(
      401,
    )
  })

  test('protection does not touch the public API', async () => {
    expect((await locked.request('/health')).status).toBe(200)
  })

  test('docs can be switched off entirely', async () => {
    expect((await off.request('/docs')).status).toBe(404)
    expect((await off.request('/docs/login')).status).toBe(404)
    expect((await off.request('/openapi.json')).status).toBe(404)
  })
})
