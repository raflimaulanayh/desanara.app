'use client'

import { Button, Card, Input, Label, TextField } from '@heroui/react'
import { passwordSchema } from '@repo/validators'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { authErrorKey } from '@/lib/auth-errors'
import { useFinishSignIn } from '@/lib/use-finish-sign-in'
import { PasswordField } from './password-field'

const CodeStep = dynamic(() => import('./code-step').then((m) => m.CodeStep), { ssr: false })

/**
 * Forgot password with a 6-digit code: email, then code + new password on one screen, then the
 * person is signed in. The answer never says whether the email has an account.
 */
export function ForgotPasswordForm() {
  const t = useTranslations()
  const finish = useFinishSignIn()
  const [email, setEmail] = useState(useSearchParams().get('email') ?? '')
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string>()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [sent, setSent] = useState(false)

  const request = async () =>
    (await authClient.emailOtp.requestPasswordReset({ email: email.trim() })).error ?? null

  async function onSend(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)
    const err = await request()
    setPending(false)
    if (err) return setError(t(authErrorKey(err)))
    setSent(true)
  }

  return (
    <Card className="w-full max-w-sm">
      <Card.Content>
        {sent ? (
          <CodeStep
            title={t('forgot.codeTitle')}
            intro={t('forgot.codeIntro', { email: email.trim() })}
            submitLabel={t('forgot.save')}
            resend={request}
            verify={async (otp) => {
              const checked = passwordSchema.safeParse(password)
              if (!checked.success) {
                setPasswordError(checked.error.issues[0]?.message)
                return { code: 'PASSWORD_TOO_SHORT' }
              }
              const reset = await authClient.emailOtp.resetPassword({
                email: email.trim(),
                otp,
                password,
              })
              if (reset.error) return reset.error
              const signIn = await authClient.signIn.email({ email: email.trim(), password })
              if (signIn.error) return signIn.error
              finish('/')
              return null
            }}
          >
            <PasswordField
              label={t('forgot.newPassword')}
              value={password}
              onChange={(v) => {
                setPassword(v)
                setPasswordError(undefined)
              }}
              error={passwordError}
              hint={t('auth.passwordHint')}
            />
          </CodeStep>
        ) : (
          <form onSubmit={onSend} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-lg font-bold">{t('forgot.title')}</h1>
              <p className="text-muted text-sm">{t('forgot.intro')}</p>
            </div>
            <TextField
              name="email"
              type="email"
              isRequired
              value={email}
              onChange={setEmail}
              className="flex flex-col gap-1.5"
            >
              <Label>{t('forgot.email')}</Label>
              <Input autoComplete="email" inputMode="email" className="h-12 text-base" />
            </TextField>
            {error ? (
              <p role="alert" className="text-danger text-sm">
                {error}
              </p>
            ) : null}
            <Button type="submit" isPending={pending} className="h-12 w-full">
              {t('forgot.send')}
            </Button>
          </form>
        )}
        <Link
          href="/login"
          className="mt-4 block text-center text-sm font-semibold hover:underline"
        >
          {t('forgot.backToLogin')}
        </Link>
      </Card.Content>
    </Card>
  )
}
