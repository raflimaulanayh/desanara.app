import { runInNewContext } from 'node:vm'
import { expect, mock, test } from 'bun:test'

test('the worker shows a system notification and opens its localized URL when tapped', async () => {
  const handlers = new Map<string, (event: unknown) => void>()
  const showNotification = mock(async () => {})
  const openWindow = mock(async () => {})
  const source = await Bun.file(new URL('../../public/sw.js', import.meta.url)).text()
  runInNewContext(source, {
    URL,
    self: {
      location: { origin: 'https://desanara.example' },
      registration: { showNotification },
      clients: { matchAll: async () => [], openWindow },
      addEventListener: (name: string, handler: (event: unknown) => void) =>
        handlers.set(name, handler),
    },
  })

  let pending: Promise<unknown> | undefined
  const waitUntil = (promise: Promise<unknown>) => (pending = promise)
  handlers.get('push')?.({
    data: { json: () => ({ title: 'Desanara', body: 'Test', url: '/en/pengaturan' }) },
    waitUntil,
  })
  await pending
  expect(showNotification).toHaveBeenCalledWith(
    'Desanara',
    expect.objectContaining({ body: 'Test', data: { url: '/en/pengaturan' } }),
  )

  const close = mock(() => {})
  handlers.get('notificationclick')?.({
    notification: { close, data: { url: '/en/pengaturan' } },
    waitUntil,
  })
  await pending
  expect(close).toHaveBeenCalled()
  expect(openWindow).toHaveBeenCalledWith('https://desanara.example/en/pengaturan')

  handlers.get('notificationclick')?.({
    notification: { close, data: { url: 'https://elsewhere.example/' } },
    waitUntil,
  })
  expect(openWindow).toHaveBeenCalledTimes(1)
})

test('the worker returns a localized offline page for document navigation only', async () => {
  const handlers = new Map<string, (event: unknown) => void>()
  const origin = 'https://desanara.example'
  const fetch = mock(async (_request: unknown): Promise<Response> => {
    throw new TypeError('Failed to fetch')
  })
  const source = await Bun.file(new URL('../../public/sw.js', import.meta.url)).text()
  runInNewContext(source, {
    URL,
    Response,
    fetch,
    self: {
      location: { origin },
      addEventListener: (name: string, handler: (event: unknown) => void) =>
        handlers.set(name, handler),
    },
  })
  const resend = (url: string, mode = 'navigate', method = 'GET') => {
    const respondWith = mock((_response: Promise<Response>) => {})
    handlers.get('fetch')?.({ request: { url, mode, method }, respondWith })
    return respondWith.mock.calls[0]?.[0]
  }

  const en = await resend(`${origin}/en/jelajah?q=kopi`)
  expect(en?.status).toBe(503)
  expect(en?.headers.get('cache-control')).toBe('no-store')
  expect(await en?.text()).toContain('lang="en"')
  const id = await resend(`${origin}/jelajah`)
  expect(await id?.text()).toContain('Koneksi internet terputus')
  expect(resend(`${origin}/api/search-suggestions`, 'cors')).toBeUndefined()
  expect(resend(`${origin}/jelajah`, 'navigate', 'POST')).toBeUndefined()
  expect(resend('https://example.test/')).toBeUndefined()
  const serviceError = new Response('Maintenance', { status: 503 })
  fetch.mockResolvedValueOnce(serviceError)
  expect(await resend(`${origin}/jelajah`)).toBe(serviceError)
})
