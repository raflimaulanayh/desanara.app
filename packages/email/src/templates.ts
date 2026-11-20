import type { EmailMessage } from './mailer'

/**
 * Plain, table-free HTML that renders in Gmail on cheap Android phones, plus a text version.
 * Indonesian only for now (every recipient is a village user). Every value is escaped.
 */

const BRAND = 'Desanara'
const ACCENT = '#1f6f5c'

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

interface Layout {
  preview: string
  heading: string
  paragraphs: string[]
  code?: string
  button?: { label: string; url: string }
  footnote: string
}

function render({ preview, heading, paragraphs, code, button, footnote }: Layout) {
  const p = (t: string) =>
    `<p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:#1c1917">${escapeHtml(t)}</p>`
  const html = `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(heading)}</title></head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:Arial,Helvetica,sans-serif">
<div style="display:none;max-height:0;overflow:hidden">${escapeHtml(preview)}</div>
<div style="max-width:480px;margin:0 auto;padding:24px 16px">
<p style="margin:0 0 24px;font-size:20px;font-weight:bold;color:${ACCENT}">${BRAND}</p>
<div style="background:#ffffff;border-radius:16px;padding:24px">
<h1 style="margin:0 0 16px;font-size:20px;line-height:1.3;color:#1c1917">${escapeHtml(heading)}</h1>
${paragraphs.map(p).join('\n')}
${code ? `<p style="margin:8px 0 24px;font-size:32px;font-weight:bold;letter-spacing:8px;color:#1c1917">${escapeHtml(code)}</p>` : ''}
${button ? `<p style="margin:8px 0 24px"><a href="${escapeHtml(button.url)}" style="display:inline-block;background:${ACCENT};color:#ffffff;text-decoration:none;font-weight:bold;font-size:16px;padding:14px 24px;border-radius:999px">${escapeHtml(button.label)}</a></p><p style="margin:0 0 16px;font-size:13px;line-height:1.5;color:#57534e;word-break:break-all">Tombol tidak berfungsi? Salin tautan ini ke browser: ${escapeHtml(button.url)}</p>` : ''}
</div>
<p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:#78716c">${escapeHtml(footnote)}</p>
</div></body></html>`
  const text = [
    heading,
    '',
    ...paragraphs,
    ...(code ? ['', code] : []),
    ...(button ? ['', `${button.label}: ${button.url}`] : []),
    '',
    footnote,
    '',
    BRAND,
  ].join('\n')
  return { html, text }
}

const ignoreNote =
  'Jika Anda tidak meminta email ini, abaikan saja. Jangan bagikan kode atau tautan ini kepada siapa pun, termasuk yang mengaku dari tim Desanara.'

export type CodePurpose = 'email-verification' | 'forget-password' | 'sign-in' | 'change-email'

/** One-time code. The code is in the subject so the phone notification already shows it. */
export function codeEmail(input: {
  to: string
  code: string
  purpose: CodePurpose
  minutes: number
}): EmailMessage {
  const reset = input.purpose === 'forget-password'
  const heading = reset ? 'Kode untuk mengatur ulang kata sandi' : 'Kode verifikasi email'
  const { html, text } = render({
    preview: `Kode Anda: ${input.code}`,
    heading,
    paragraphs: [
      reset
        ? 'Masukkan kode ini di halaman lupa kata sandi Desanara untuk membuat kata sandi baru.'
        : 'Masukkan kode ini di halaman Desanara yang sedang Anda buka untuk memastikan email ini milik Anda.',
      `Kode berlaku ${input.minutes} menit.`,
    ],
    code: input.code,
    footnote: ignoreNote,
  })
  return { to: input.to, subject: `${input.code} adalah kode ${BRAND} Anda`, html, text }
}

/** Invitation to create an account (or join, for existing users) with a fixed role. */
export function invitationEmail(input: {
  to: string
  inviteeName: string | null
  inviterName: string
  roleLabel: string
  targetName: string
  url: string
  expiresOn: string
}): EmailMessage {
  const greeting = input.inviteeName ? `Halo ${input.inviteeName},` : 'Halo,'
  const { html, text } = render({
    preview: `${input.inviterName} mengundang Anda ke ${input.targetName}`,
    heading: `Undangan bergabung ke ${input.targetName}`,
    paragraphs: [
      greeting,
      `${input.inviterName} mengundang Anda sebagai ${input.roleLabel} untuk ${input.targetName} di ${BRAND}, katalog UMKM desa.`,
      `Tekan tombol di bawah untuk membuat akun. Undangan berlaku sampai ${input.expiresOn} dan hanya bisa dipakai sekali.`,
    ],
    button: { label: 'Buat akun', url: input.url },
    footnote:
      'Jika Anda tidak mengenal pengirim undangan ini, abaikan email ini. Tidak ada akun yang dibuat tanpa Anda menekan tombol di atas.',
  })
  return {
    to: input.to,
    subject: `Undangan bergabung ke ${input.targetName} di ${BRAND}`,
    html,
    text,
  }
}
