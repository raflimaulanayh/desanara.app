import type { Business } from './businesses'

/**
 * Pure helpers for the business form (no React), so the rules are unit-tested:
 * the form edits strings; create sends only filled fields; edit sends only changed fields
 * ('' clears an optional field, matching the API's PATCH contract).
 */
export const TEXT_FIELDS = [
  'name',
  'ownerName',
  'description',
  'whatsappNumber',
  'address',
  'shopeeUrl',
  'tokopediaUrl',
  'tiktokShopUrl',
  'instagramUrl',
  'nib',
] as const
export type TextField = (typeof TEXT_FIELDS)[number]

export type BusinessFormValues = Record<TextField, string> & {
  villageId: string
  consentGiven: boolean
}

/** Steps of the form, one screen each on a phone. */
export const STEPS = [
  { id: 'about', fields: ['villageId', 'name', 'ownerName', 'description'] },
  {
    id: 'contact',
    fields: [
      'whatsappNumber',
      'address',
      'shopeeUrl',
      'tokopediaUrl',
      'tiktokShopUrl',
      'instagramUrl',
      'nib',
    ],
  },
  { id: 'consent', fields: ['consentGiven'] },
] as const

export function stepOf(field: string): number {
  const i = STEPS.findIndex((s) => (s.fields as readonly string[]).includes(field))
  return i === -1 ? 0 : i
}

export function valuesFrom(b: Business | null, villageId = ''): BusinessFormValues {
  const text = Object.fromEntries(TEXT_FIELDS.map((f) => [f, b?.[f] ?? ''])) as Record<
    TextField,
    string
  >
  return { ...text, villageId: b?.village.id ?? villageId, consentGiven: Boolean(b?.consentAt) }
}

/** Body for POST /v1/manage/businesses: trimmed, empty fields left out. */
export function toCreateInput(v: BusinessFormValues) {
  const out: Record<string, unknown> = { villageId: v.villageId, consentGiven: v.consentGiven }
  for (const f of TEXT_FIELDS) {
    const value = v[f].trim()
    if (value) out[f] = value
  }
  return out
}

/** Body for PATCH: only what changed. An emptied optional field is sent as '' (= clear it). */
export function toPatch(original: Business, v: BusinessFormValues) {
  const out: Record<string, unknown> = {}
  for (const f of TEXT_FIELDS) {
    const before = original[f] ?? ''
    const after = v[f].trim()
    if (after !== before) out[f] = after
  }
  if (v.consentGiven !== Boolean(original.consentAt)) out.consentGiven = v.consentGiven
  return out
}

interface Issue {
  code: string
  path: PropertyKey[]
  message: string
  minimum?: unknown
  maximum?: unknown
  format?: string
}

type T = (key: string, values?: Record<string, string | number>) => string

/**
 * One Indonesian message per field from a Zod error. Messages written in our schemas
 * ("Nomor WhatsApp tidak valid", regex rules) are kept; Zod's English defaults are replaced.
 */
export function fieldMessages(issues: Issue[], t: T): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of issues) {
    const field = String(issue.path[0] ?? '')
    if (!field || out[field]) continue
    if (issue.code === 'custom' || (issue.code === 'invalid_format' && issue.format === 'regex')) {
      out[field] = issue.message
    } else if (issue.code === 'too_small') {
      out[field] = t('form.tooShort', { min: Number(issue.minimum) })
    } else if (issue.code === 'too_big') {
      out[field] = t('form.tooLong', { max: Number(issue.maximum) })
    } else if (issue.code === 'invalid_format' && issue.format === 'url') {
      out[field] = t('form.invalidUrl')
    } else {
      out[field] = t('form.invalid')
    }
  }
  return out
}
