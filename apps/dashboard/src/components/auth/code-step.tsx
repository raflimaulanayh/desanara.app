'use client'

import { Button, Description, InputOTP, Label, REGEXP_ONLY_DIGITS } from '@heroui/react'
import { useTranslations } from 'next-intl'
import { type FormEvent, useEffect, useState } from 'react'
import { type AuthClientError, authErrorKey } from '@/lib/auth-errors'

const RESEND_SECONDS = 60
const CODE_ERRORS = new Set(['INVALID_OTP', 'OTP_EXPIRED', 'TOO_MANY_ATTEMPTS'])

/**
 * The 6-digit code, typed on the same screen. `verify` returns null on success or the Better Auth
 * error; `resend` asks for a fresh code. The parent decides what happens next (sign in, new password).
 */
export function CodeStep({
  title,
  intro,
  submitLabel,
  verify,
  resend,
  children,
}: {
  title: string
  intro: string
  submitLabel?: string
  verify: (code: string) => Promise<AuthClientError | null>
  resend: () => Promise<AuthClientError | null>
  /** Extra fields shown under the code (the new password). */
  children?: React.ReactNode
}) {
  const t = useTranslations()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [wait, setWait] = useState(RESEND_SECONDS)

  useEffect(() => {
    if (wait <= 0) return
    const id = setTimeout(() => setWait((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [wait])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (code.length !== 6) return
    setPending(true)
    setError(null)
    setNotice(null)
    const err = await verify(code)
    setPending(false)
    if (err) {
      setError(t(authErrorKey(err)))
      // A wrong or expired code is retyped; other errors (a short password) keep it.
      if (err.code && CODE_ERRORS.has(err.code)) setCode('')
    }
  }

  async function onResend() {
    setError(null)
    setNotice(null)
    const err = await resend()
    if (err) return setError(t(authErrorKey(err)))
    setNotice(t('auth.resent'))
    setWait(RESEND_SECONDS)
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-muted text-sm">{intro}</p>
      </div>
      <div className="flex flex-col gap-2">
        <Label>{t('auth.code')}</Label>
        <InputOTP
          maxLength={6}
          pattern={REGEXP_ONLY_DIGITS}
          value={code}
          onChange={(v) => {
            setCode(v)
            setError(null)
          }}
          isInvalid={Boolean(error)}
          autoFocus
          name="code"
        >
          <InputOTP.Group>
            {[0, 1, 2].map((i) => (
              <InputOTP.Slot key={i} index={i} className="size-11 text-lg" />
            ))}
          </InputOTP.Group>
          <InputOTP.Separator />
          <InputOTP.Group>
            {[3, 4, 5].map((i) => (
              <InputOTP.Slot key={i} index={i} className="size-11 text-lg" />
            ))}
          </InputOTP.Group>
        </InputOTP>
        <Description>{t('auth.codeHint')}</Description>
      </div>
      {children}
      {error ? (
        <p role="alert" className="text-danger text-sm">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p role="status" className="text-success text-sm">
          {notice}
        </p>
      ) : null}
      <Button
        type="submit"
        className="h-12 w-full"
        isPending={pending}
        isDisabled={code.length !== 6}
      >
        {submitLabel ?? t('auth.verify')}
      </Button>
      <Button variant="ghost" className="w-full" isDisabled={wait > 0} onPress={onResend}>
        {wait > 0 ? t('auth.resendIn', { seconds: wait }) : t('auth.resend')}
      </Button>
    </form>
  )
}
