import { expect, test } from 'bun:test'
import { EmailError, createMailer } from './mailer'
import { codeEmail, escapeHtml, invitationEmail } from './templates'

test('escapes every HTML special character', () => {
  expect(escapeHtml(`<a href="x">'&'</a>`)).toBe(
    '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;',
  )
})

test('code email puts the code in the subject and escapes user text', () => {
  const m = codeEmail({ to: 'a@b.id', code: '123456', purpose: 'email-verification', minutes: 10 })
  expect(m.subject).toBe('123456 adalah kode Desanara Anda')
  expect(m.text).toContain('123456')
  expect(m.text).toContain('10 menit')
  const reset = codeEmail({ to: 'a@b.id', code: '654321', purpose: 'forget-password', minutes: 10 })
  expect(reset.html).toContain('mengatur ulang kata sandi')
})

test('invitation email escapes names coming from users', () => {
  const m = invitationEmail({
    to: 'a@b.id',
    inviteeName: '<script>x</script>',
    inviterName: 'Bu Ani',
    roleLabel: 'pemilik UMKM',
    targetName: 'Keripik "Bu Ani"',
    url: 'https://dashboard.desanara.app/undangan/abc',
    expiresOn: '27 November 2026',
  })
  expect(m.html).not.toContain('<script>')
  expect(m.html).toContain('&lt;script&gt;')
  expect(m.html).toContain('Keripik &quot;Bu Ani&quot;')
  expect(m.text).toContain('https://dashboard.desanara.app/undangan/abc')
})

test('without an API key the mailer only logs', async () => {
  const lines: string[] = []
  const mailer = createMailer({
    from: 'Desanara <noreply@desanara.app>',
    log: (l) => lines.push(l),
  })
  const res = await mailer.send({ to: 'a@b.id', subject: 'S', html: '<p>h</p>', text: 't' })
  expect(res.id).toBeNull()
  expect(lines[0]).toContain('to=a@b.id')
})

test('with an API key it posts to Resend and surfaces failures', async () => {
  const calls: { url: string; init: RequestInit }[] = []
  const ok = createMailer({
    apiKey: 're_test',
    from: 'Desanara <noreply@desanara.app>',
    replyTo: 'himasif@example.org',
    fetch: (async (url: string, init: RequestInit) => {
      calls.push({ url, init })
      return new Response(JSON.stringify({ id: 'msg_1' }), { status: 200 })
    }) as unknown as typeof fetch,
  })
  expect((await ok.send({ to: 'a@b.id', subject: 'S', html: 'h', text: 't' })).id).toBe('msg_1')
  expect(calls[0]!.url).toBe('https://api.resend.com/emails')
  const body = JSON.parse(String(calls[0]!.init.body)) as Record<string, unknown>
  expect(body.to).toEqual(['a@b.id'])
  expect(body.reply_to).toBe('himasif@example.org')

  const failing = createMailer({
    apiKey: 're_test',
    from: 'x@y.z',
    fetch: (async () =>
      new Response('domain not verified', { status: 403 })) as unknown as typeof fetch,
  })
  const err = await failing
    .send({ to: 'a@b.id', subject: 'S', html: 'h', text: 't' })
    .catch((e) => e)
  expect(err).toBeInstanceOf(EmailError)
  expect((err as EmailError).status).toBe(403)
})
