'use client'

type EventType =
  'product_view' | 'business_view' | 'village_view' | 'whatsapp_click' | 'marketplace_click'

/** Fire-and-forget impact event. Never blocks navigation, never throws. */
export function track(event: {
  type: EventType
  productSlug?: string
  businessSlug?: string
  villageSlug?: string
  locale?: string
}) {
  if (process.env.NODE_ENV === 'development') return

  try {
    const base = process.env.NEXT_PUBLIC_API_URL || 'https://api.desanara.app'
    void fetch(`${base}/v1/events`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(event),
      keepalive: true,
    }).catch(() => undefined)
  } catch {
    // analytics must never break the page
  }
}
