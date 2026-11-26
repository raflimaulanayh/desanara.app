import { expect, test } from 'bun:test'
import { pushTestSchema } from './push'

function subscriptionAt(endpoint: string) {
  return {
    locale: 'id',
    subscription: {
      endpoint,
      keys: { p256dh: 'a'.repeat(87), auth: 'a'.repeat(22) },
    },
  }
}

test('allows only supported HTTPS push services for a device test', () => {
  for (const endpoint of [
    'https://web.push.apple.com/device',
    'https://fcm.googleapis.com/fcm/send/device',
    'https://updates.push.services.mozilla.com/wpush/v2/device',
    'https://wns2-am3p.notify.windows.com/w/?token=device',
  ]) {
    expect(pushTestSchema.safeParse(subscriptionAt(endpoint)).success).toBe(true)
  }

  for (const endpoint of [
    'http://web.push.apple.com/device',
    'https://127.0.0.1/device',
    'https://example.com@web.push.apple.com/device',
    'https://web.push.apple.com.example.com/device',
    'https://web.push.apple.com:444/device',
    'https://fcm.googleapis.com/redirect',
    'https://fcm.googleapis.com/fcm/send/device#different-id',
  ]) {
    expect(pushTestSchema.safeParse(subscriptionAt(endpoint)).success).toBe(false)
  }
})
