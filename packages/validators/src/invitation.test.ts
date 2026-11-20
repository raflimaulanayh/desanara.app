import { expect, test } from 'bun:test'
import { invitationAcceptSchema, invitationCreateSchema } from './invitation'

const V = '7d3e6c2a-1b2c-4d5e-8f90-1234567890ab'

test('village roles need a village, business roles a business', () => {
  expect(
    invitationCreateSchema.safeParse({ role: 'village_assistant', villageId: V }).success,
  ).toBe(true)
  expect(
    invitationCreateSchema.safeParse({ role: 'village_assistant', businessId: V }).success,
  ).toBe(false)
  expect(invitationCreateSchema.safeParse({ role: 'owner', businessId: V }).success).toBe(true)
  expect(invitationCreateSchema.safeParse({ role: 'owner' }).success).toBe(false)
})

test('emails are trimmed and lower-cased; passwords only need 8 characters', () => {
  const r = invitationCreateSchema.parse({
    role: 'owner',
    businessId: V,
    inviteeEmail: '  Bu.Ani@Gmail.com ',
  })
  expect(r.inviteeEmail).toBe('bu.ani@gmail.com')
  expect(invitationAcceptSchema.safeParse({ password: 'kopigayo' }).success).toBe(true)
  expect(invitationAcceptSchema.safeParse({ password: 'pendek' }).success).toBe(false)
})
