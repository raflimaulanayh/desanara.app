self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  if (!event.data) return
  const { title, body, url } = event.data.json()
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/brand/pwa-192.png',
      tag: 'desanara-push-test',
      data: { url },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const destination = new URL(event.notification.data?.url ?? '/', self.location.origin)
  if (destination.origin !== self.location.origin) return

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clients) => {
      const matching = clients.find((client) => client.url === destination.href)
      if (matching) return matching.focus()
      const current = clients[0]
      const moved = current && (await current.navigate(destination.href))
      if (moved) return moved.focus()
      return self.clients.openWindow(destination.href)
    }),
  )
})
