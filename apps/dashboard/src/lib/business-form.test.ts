/// <reference types="bun" />
import { describe, expect, test } from 'bun:test'
import { businessCreateSchema, businessUpdateSchema } from '@repo/validators'
import type { Business } from './businesses'
import { fieldMessages, stepOf, toCreateInput, toPatch, valuesFrom } from './business-form'

const t = (key: string, v?: Record<string, string | number>) =>
  v ? `${key}:${Object.values(v).join(',')}` : key

const original = {
  village: { id: '0b7a2f4e-8a5e-4f7b-9a43-5b8f1c2d3e4f', slug: 'baros', name: 'Desa Baros' },
  name: 'Keripik Bu Ani',
  ownerName: 'Ani',
  description: 'Renyah',
  whatsappNumber: '6281234567890',
  address: null,
  shopeeUrl: null,
  tokopediaUrl: null,
  tiktokShopUrl: null,
  instagramUrl: null,
  nib: null,
  consentAt: '2026-11-01T00:00:00.000Z',
} as unknown as Business

describe('business form', () => {
  test('create leaves empty fields out and passes the shared schema', () => {
    const v = {
      ...valuesFrom(null, original.village.id),
      name: '  Kopi Gayo  ',
      whatsappNumber: '0812 3456 7890',
    }
    const input = toCreateInput(v)
    expect(input).toEqual({
      villageId: original.village.id,
      consentGiven: false,
      name: 'Kopi Gayo',
      whatsappNumber: '0812 3456 7890',
    })
    expect(businessCreateSchema.safeParse(input).success).toBe(true)
  })

  test('edit sends only changed fields; emptied fields are cleared with ""', () => {
    const v = {
      ...valuesFrom(original),
      description: '',
      instagramUrl: 'https://instagram.com/ani',
    }
    const patch = toPatch(original, v)
    expect(patch).toEqual({ description: '', instagramUrl: 'https://instagram.com/ani' })
    expect(businessUpdateSchema.parse(patch)).toMatchObject({ description: null })
  })

  test('unchanged form = empty patch; consent change is sent only when it changes', () => {
    expect(toPatch(original, valuesFrom(original))).toEqual({})
    expect(toPatch(original, { ...valuesFrom(original), consentGiven: false })).toEqual({
      consentGiven: false,
    })
  })

  test('errors jump to the right step and read in Indonesian', () => {
    const r = businessCreateSchema.safeParse({
      villageId: original.village.id,
      name: 'ab',
      whatsappNumber: '0221234',
      instagramUrl: 'not a url',
    })
    expect(r.success).toBe(false)
    const msgs = fieldMessages(r.error!.issues as never, t)
    expect(msgs.name).toBe('form.tooShort:3')
    expect(msgs.whatsappNumber).toBe('Nomor WhatsApp tidak valid')
    expect(msgs.instagramUrl).toBe('form.invalidUrl')
    expect(stepOf('name')).toBe(0)
    expect(stepOf('whatsappNumber')).toBe(1)
    expect(stepOf('consentGiven')).toBe(2)
  })
})
