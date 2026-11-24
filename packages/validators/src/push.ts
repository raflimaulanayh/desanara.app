import { z } from 'zod'

function isBrowserPushService(url: URL) {
  const { protocol, port, username, password, hostname, pathname, hash } = url
  if (protocol !== 'https:' || port || username || password || hash || pathname === '/') {
    return false
  }
  if (hostname === 'fcm.googleapis.com') return pathname.startsWith('/fcm/send/')
  if (hostname === 'updates.push.services.mozilla.com') return pathname.startsWith('/wpush/')
  return hostname.endsWith('.push.apple.com') || hostname.endsWith('.notify.windows.com')
}

export const pushTestSchema = z.object({
  locale: z.enum(['id', 'en']),
  subscription: z.object({
    endpoint: z
      .string()
      .max(2048)
      .url()
      .transform((endpoint) => new URL(endpoint))
      .refine(isBrowserPushService)
      .transform((url) => url.href),
    keys: z.object({
      p256dh: z.string().regex(/^[\w-]{87}$/),
      auth: z.string().regex(/^[\w-]{22}$/),
    }),
  }),
})
