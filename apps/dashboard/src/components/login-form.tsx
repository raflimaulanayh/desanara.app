'use client'

import { Button, Card, Input, Label, TextField } from '@heroui/react'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { authErrorKey, isUnverified } from '@/lib/auth-errors'
import { safeNext } from '@/lib/nav'
import { useFinishSignIn } from '@/lib/use-finish-sign-in'
import { PasswordField } from './auth/password-field'

/** Only needed when the email is not verified yet: kept out of the login page's first load. */
const CodeStep = dynamic(() => import('./auth/code-step').then((m) => m.CodeStep), { ssr: false })

export function LoginForm() {
  const t = useTranslations()
  const finish = useFinishSignIn()
  const params = useSearchParams()
  const next = safeNext(params.get('next'))
  /** Set by the invitation page when the account exists but signing in right away failed. */
  const created = params.get('created') === '1'
  const [email, setEmail] = useState(params.get('email') ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  /** Set when the email is not verified yet: Better Auth has just sent a code. */
  const [verifying, setVerifying] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)
    const { error } = await authClient.signIn.email({ email: email.trim(), password })
    setPending(false)
    if (isUnverified(error)) return setVerifying(true)
    if (error) return setError(t(authErrorKey(error)))
    finish(next)
  }

  return (
    <Card className="w-full max-w-sm">
      {verifying ? (
        <Card.Content>
          <CodeStep
            title={t('login.verifyTitle')}
            intro={t('login.verifyHint', { email: email.trim() })}
            verify={async (otp) => {
              const { error } = await authClient.emailOtp.verifyEmail({ email: email.trim(), otp })
              if (!error) finish(next)
              return error ?? null
            }}
            resend={async () =>
              (
                await authClient.emailOtp.sendVerificationOtp({
                  email: email.trim(),
                  type: 'email-verification',
                })
              ).error ?? null
            }
          />
          <Button variant="ghost" className="mt-2 w-full" onPress={() => setVerifying(false)}>
            {t('auth.back')}
          </Button>
        </Card.Content>
      ) : (
        <>
          <Card.Header>
            <Card.Title>{t('login.title')}</Card.Title>
            <Card.Description>{t('login.subtitle')}</Card.Description>
          </Card.Header>
          <Card.Content>
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              {created ? (
                <p role="status" className="bg-wash rounded-xl p-3 text-sm">
                  {t('login.created')}
                </p>
              ) : null}
              <TextField
                name="email"
                type="email"
                isRequired
                value={email}
                onChange={setEmail}
                className="flex flex-col gap-1.5"
              >
                <Label>{t('login.email')}</Label>
                <Input autoComplete="email" inputMode="email" className="h-12 text-base" />
              </TextField>
              <PasswordField
                label={t('login.password')}
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
              />
              {error ? (
                <p role="alert" className="text-danger text-sm">
                  {error}
                </p>
              ) : null}
              <Button type="submit" isPending={pending} className="h-12 w-full">
                {t('login.submit')}
              </Button>
              <Link
                href={`/lupa-password${email.trim() ? `?email=${encodeURIComponent(email.trim())}` : ''}`}
                className="text-center text-sm font-semibold hover:underline"
              >
                {t('login.forgot')}
              </Link>
            </form>
          </Card.Content>
        </>
      )}
    </Card>
  )
}
