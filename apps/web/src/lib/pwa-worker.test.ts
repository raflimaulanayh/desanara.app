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
