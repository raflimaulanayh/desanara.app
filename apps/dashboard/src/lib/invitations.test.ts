import { expect, test } from 'bun:test'
import { invitationWhatsAppUrl } from './invitations'

test('the WhatsApp message carries the link and lets the sender pick the chat', () => {
  const url = invitationWhatsAppUrl({
    url: 'https://dashboard.desanara.app/undangan/abc',
    roleLabel: 'pemilik UMKM',
    targetName: 'Keripik Bu Ani',
    inviteeName: 'Bu Ani',
  })
  expect(url.startsWith('https://wa.me/?text=')).toBe(true)
  const text = decodeURIComponent(url.split('text=')[1]!)
  expect(text).toContain('Halo Bu Ani,')
  expect(text).toContain('https://dashboard.desanara.app/undangan/abc')
})
