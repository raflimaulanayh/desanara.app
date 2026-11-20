/**
 * Sends transactional email. Resend's HTTP API is called with fetch (no SDK, keeps the API bundle
 * small); without an API key the message is printed instead, so local development needs no account.
 * Swap providers by adding another branch here: callers only see `send()`.
 */
export interface EmailMessage {
  to: string
  subject: string
  html: string
  text: string
}

export interface Mailer {
  send(message: EmailMessage): Promise<{ id: string | null }>
}

export interface MailerOptions {
  /** Resend API key with "Sending access". Empty = log to the console. */
  apiKey?: string
  /** e.g. `Desanara <noreply@desanara.app>` */
  from: string
  replyTo?: string
  /** For tests. */
  fetch?: typeof fetch
  log?: (line: string) => void
}

export class EmailError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = 'EmailError'
  }
}

const RESEND_URL = 'https://api.resend.com/emails'

export function createMailer(options: MailerOptions): Mailer {
  const doFetch = options.fetch ?? fetch
  const log = options.log ?? ((line: string) => console.info(line))

  if (!options.apiKey) {
    return {
      async send(message) {
        log(`[email] to=${message.to} subject="${message.subject}"\n${message.text}`)
        return { id: null }
      },
    }
  }

  return {
    async send(message) {
      const res = await doFetch(RESEND_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${options.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: options.from,
          to: [message.to],
          subject: message.subject,
          html: message.html,
          text: message.text,
          ...(options.replyTo ? { reply_to: options.replyTo } : {}),
        }),
      })
      if (!res.ok) {
        // The body explains the failure (bad domain, quota); it never contains the key.
        throw new EmailError(
          `Resend ${res.status}: ${(await res.text()).slice(0, 300)}`,
          res.status,
        )
      }
      const body = (await res.json()) as { id?: string }
      return { id: body.id ?? null }
    },
  }
}
