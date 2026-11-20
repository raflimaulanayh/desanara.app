import type { EmailMessage, Mailer } from '@repo/email'

/** Collects sent messages instead of sending them. */
export function createTestMailer(): Mailer & {
  sent: EmailMessage[]
  last(to: string): EmailMessage | undefined
} {
  const sent: EmailMessage[] = []
  return {
    sent,
    async send(message) {
      sent.push(message)
      return { id: null }
    },
    last(to) {
      return sent.findLast((m) => m.to === to)
    },
  }
}

/** The 6-digit code from a code email. */
export function codeFrom(message: EmailMessage | undefined): string {
  const code = message?.subject.match(/^(\d{6}) /)?.[1]
  if (!code) throw new Error(`no code in email: ${message?.subject}`)
  return code
}
