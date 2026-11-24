import { createHash } from 'node:crypto'
import { BRAND_NAME } from '@repo/i18n'
import { pushTestSchema } from '@repo/validators'
import { getTranslations } from 'next-intl/server'
import { sendNotification } from 'web-push'
import { localePath, SETTINGS_PATH } from '@/lib/paths'

export const runtime = 'nodejs'

function getVapidDetails() {
  const publicKey = process.env.WEB_PUSH_PUBLIC_KEY?.trim()
  const privateKey = process.env.WEB_PUSH_PRIVATE_KEY?.trim()
  const subject = process.env.WEB_PUSH_SUBJECT?.trim()
  if (!publicKey || !privateKey || !subject) return null
  return { publicKey, privateKey, subject }
}

export function GET() {
  return Response.json(
    { data: { publicKey: getVapidDetails()?.publicKey ?? null } },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}

const testWindowMs = 60_000
const testsPerInstance = 30
let nextWindow = 0
const testedEndpoints = new Set<string>()

function takeTestSlot(endpoint: string) {
  const now = Date.now()
  if (now >= nextWindow) {
    nextWindow = now + testWindowMs
    testedEndpoints.clear()
  }
  // Per-instance cap for the device self-test. Coordinated sends need a shared limiter.
  const key = createHash('sha256').update(endpoint).digest('base64url')
  if (testedEndpoints.size >= testsPerInstance || testedEndpoints.has(key)) return false
  testedEndpoints.add(key)
  return true
}

function fail(status: number, code: string, message: string) {
  return Response.json({ error: { code, message, requestId: crypto.randomUUID() } }, { status })
}

export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) {
    return fail(403, 'FORBIDDEN', 'The request must come from this site.')
  }
  const vapidDetails = getVapidDetails()
  if (!vapidDetails) return fail(503, 'PUSH_UNAVAILABLE', 'Web Push has not been configured.')

  const maxBodySize = 4096
  if (Number(request.headers.get('content-length')) > maxBodySize) {
    return fail(413, 'PAYLOAD_TOO_LARGE', 'The subscription is too large.')
  }

  let body: unknown
  try {
    const raw = await request.text()
    if (raw.length > maxBodySize) {
      return fail(413, 'PAYLOAD_TOO_LARGE', 'The subscription is too large.')
    }
    body = JSON.parse(raw)
  } catch {
    return fail(400, 'INVALID_JSON', 'Expected a JSON subscription.')
  }

  const parsed = pushTestSchema.safeParse(body)
  if (!parsed.success) return fail(422, 'INVALID_SUBSCRIPTION', 'Invalid browser subscription.')
  const { locale, subscription } = parsed.data
  if (!takeTestSlot(subscription.endpoint)) {
    return fail(429, 'RATE_LIMITED', 'Wait a minute before sending another test.')
  }

  const t = await getTranslations({ locale, namespace: 'pwa' })
  const payload = JSON.stringify({
    title: BRAND_NAME,
    body: t('testBody'),
    url: localePath(locale, SETTINGS_PATH),
  })
  try {
    await sendNotification(subscription, payload, {
      vapidDetails,
      timeout: 5000,
      TTL: 60,
      urgency: 'high',
      topic: 'desanara-push-test',
    })
    return Response.json({ data: { accepted: true } })
  } catch (error) {
    const status = (error as { statusCode?: number } | null)?.statusCode
    if (status === 404 || status === 410) {
      return fail(410, 'SUBSCRIPTION_EXPIRED', 'Enable notifications again on this device.')
    }
    if (status === 429) {
      return fail(429, 'RATE_LIMITED', 'Wait a minute before sending another test.')
    }
    console.error('Web Push test failed', {
      status,
      kind: error instanceof Error ? error.name : 'UnknownError',
    })
    return fail(502, 'PUSH_SEND_FAILED', 'The push service did not accept the test.')
  }
}
