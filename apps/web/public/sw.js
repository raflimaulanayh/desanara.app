self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (
    event.request.mode !== 'navigate' ||
    event.request.method !== 'GET' ||
    url.origin !== self.location.origin
  )
    return

  event.respondWith(fetch(event.request).catch(() => offlinePage(url.pathname)))
})

function offlinePage(pathname) {
  const en = /^\/en(?:\/|$)/.test(pathname)
  const title = en ? "You're offline" : 'Koneksi internet terputus'
  const description = en
    ? 'Reconnect to the internet, then reload this page.'
    : 'Sambungkan internet, lalu muat ulang halaman ini.'
  const retry = en ? 'Try again' : 'Coba lagi'

  return new Response(
    `<!doctype html>
<html lang="${en ? 'en' : 'id'}">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${title} · Desanara</title>
<style>
body{margin:0;background:#fbfaf8;color:#1c1917;font:1rem/1.5 system-ui,sans-serif}
main{box-sizing:border-box;max-width:32rem;margin:auto;min-height:100dvh;display:grid;align-content:center;justify-items:center;padding:2rem 1.25rem;text-align:center}
h1{margin:0;font-size:1.35rem;line-height:1.3;text-wrap:balance}
p{margin:.75rem 0 1.25rem;color:#57534e}
a{display:inline-flex;align-items:center;min-height:2.75rem;padding:0 1.25rem;border-radius:2rem;background:#387b4c;color:#fff;font-weight:700;text-decoration:none}
a:focus-visible{outline:2px solid #387b4c;outline-offset:3px}
</style>
<main><h1>${title}</h1><p>${description}</p><a href="">${retry}</a></main>
</html>`,
    {
      status: 503,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'Content-Security-Policy':
          "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
      },
    },
  )
}

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
