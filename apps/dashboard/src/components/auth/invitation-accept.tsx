'use client'

import { Button, Card, Input, Label, TextField } from '@heroui/react'
import { ApiError, unwrap } from '@repo/api-client'
import { passwordSchema } from '@repo/validators'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { api } from '@/lib/api'
import { describeApiError } from '@/lib/api-errors'
import { authClient } from '@/lib/auth-client'
import { isUnverified } from '@/lib/auth-errors'
import { useFinishSignIn } from '@/lib/use-finish-sign-in'
import { Field } from '../field'
import { CodeStep } from './code-step'
import { PasswordField } from './password-field'

const GONE = ['USED', 'REVOKED', 'EXPIRED'] as const
type Gone = (typeof GONE)[number] | 'NOT_FOUND'

function goneReason(error: unknown): Gone | null {
  if (!(error instanceof ApiError)) return null
  if (error.status === 404) return 'NOT_FOUND'
  const reason = (error.body?.error.details as { reason?: string } | undefined)?.reason
  return GONE.find((r) => r === reason) ?? null
}

/**
 * Accepting an invitation link (from WhatsApp or email). New people create their account here
 * (name, email, password, then the 6-digit code when the link did not come by email); people who
 * already have an account sign in first and join with one tap.
 */
export function InvitationAccept({ token }: { token: string }) {
  const t = useTranslations()
  const finish = useFinishSignIn()
  const router = useRouter()
  const emailProof = useSearchParams().get('e') ?? undefined
  const here = `/undangan/${token}${emailProof ? `?e=${encodeURIComponent(emailProof)}` : ''}`
  const session = authClient.useSession()
  const preview = useQuery({
    queryKey: ['invitation', token],
    retry: false,
    queryFn: async () =>
      (await unwrap(await api.v1.invitations[':token'].$get({ param: { token } }))).data,
  })

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fields, setFields] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [accountExists, setAccountExists] = useState(false)
  /** The account exists but its email still needs the code. */
  const [verifying, setVerifying] = useState<string | null>(null)

  const inv = preview.data
  const lockedEmail = inv?.inviteeEmail ?? null
  const nameValue = name || (inv?.inviteeName ?? '')
  const emailValue = lockedEmail ?? email

  async function accept(body: Record<string, string | undefined>) {
    return unwrap(await api.v1.invitations[':token'].accept.$post({ param: { token }, json: body }))
  }

  function showApiError(e: unknown) {
    const reason = (e instanceof ApiError &&
      (e.body?.error.details as { reason?: string } | undefined)?.reason) as string | undefined
    if (reason === 'ACCOUNT_EXISTS') return setAccountExists(true)
    const d = describeApiError(e, t)
    setFields(d.fields)
    setError(d.message)
  }

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const checked = passwordSchema.safeParse(password)
    if (!checked.success) return setFields({ password: checked.error.issues[0]!.message })
    setPending(true)
    setError(null)
    setFields({})
    try {
      const done = await accept({
        name: nameValue.trim(),
        email: emailValue.trim(),
        password,
        emailProof,
      })
      const signIn = await authClient.signIn.email({ email: done.data.email, password })
      if (isUnverified(signIn.error)) return setVerifying(done.data.email)
      if (signIn.error) {
        // The account exists and the invitation is used: signing in again is the way forward.
        return router.replace(`/login?created=1&email=${encodeURIComponent(done.data.email)}`)
      }
      finish('/')
    } catch (err) {
      showApiError(err)
    } finally {
      setPending(false)
    }
  }

  async function onJoin() {
    setPending(true)
    setError(null)
    try {
      await accept({})
      finish('/')
    } catch (err) {
      showApiError(err)
    } finally {
      setPending(false)
    }
  }

  if (preview.isPending || session.isPending) {
    return <p className="text-sm">{t('invite.loading')}</p>
  }

  const gone = preview.isError ? goneReason(preview.error) : null
  if (preview.isError) {
    return (
      <Card className="w-full max-w-sm">
        <Card.Content className="flex flex-col gap-4">
          <p role="alert">
            {gone ? t(`invite.gone.${gone}`) : describeApiError(preview.error, t).message}
          </p>
          <Link href="/login" className="font-semibold hover:underline">
            {t('invite.toLogin')}
          </Link>
        </Card.Content>
      </Card>
    )
  }

  if (!inv) return null
  const user = session.data?.user
  const header = (
    <Card.Header>
      <Card.Title>{t('invite.title', { inviter: inv.inviterName })}</Card.Title>
      <Card.Description>
        {t('invite.intro', { role: inv.roleLabel, target: inv.targetName })}
        {inv.villageName && inv.villageName !== inv.targetName
          ? ` ${t('invite.village', { village: inv.villageName })}.`
          : ''}
      </Card.Description>
    </Card.Header>
  )
  const errorLine = error ? (
    <p role="alert" className="text-danger text-sm">
      {error}
    </p>
  ) : null

  if (verifying) {
    return (
      <Card className="w-full max-w-sm">
        <Card.Content>
          <CodeStep
            title={t('invite.codeTitle')}
            intro={t('invite.codeIntro', { email: verifying })}
            verify={async (otp) => {
              const { error } = await authClient.emailOtp.verifyEmail({ email: verifying, otp })
              if (!error) finish('/')
              return error ?? null
            }}
            resend={async () =>
              (
                await authClient.emailOtp.sendVerificationOtp({
                  email: verifying,
                  type: 'email-verification',
                })
              ).error ?? null
            }
          />
        </Card.Content>
      </Card>
    )
  }

  if (user) {
    return (
      <Card className="w-full max-w-sm">
        {header}
        <Card.Content className="flex flex-col gap-4">
          <p className="text-sm">{t('invite.loggedInAs', { email: user.email })}</p>
          {errorLine}
          <Button className="h-12 w-full" isPending={pending} onPress={onJoin}>
            {t('invite.join', { role: inv.roleLabel })}
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onPress={async () => {
              await authClient.signOut()
              await session.refetch()
            }}
          >
            {t('invite.notYou')}
          </Button>
        </Card.Content>
      </Card>
    )
  }

  if (inv.accountExists || accountExists) {
    return (
      <Card className="w-full max-w-sm">
        {header}
        <Card.Content className="flex flex-col gap-4">
          <p className="text-sm">{t('invite.hasAccount')}</p>
          <Link
            href={`/login?next=${encodeURIComponent(here)}`}
            className="bg-accent text-accent-foreground flex h-12 items-center justify-center rounded-full font-semibold"
          >
            {t('invite.signInFirst')}
          </Link>
        </Card.Content>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-sm">
      {header}
      <Card.Content>
        <form onSubmit={onCreate} className="flex flex-col gap-4">
          <Field
            name="name"
            label={t('invite.name')}
            value={nameValue}
            onChange={(v) => {
              setName(v)
              setFields((f) => ({ ...f, name: '' }))
            }}
            autoComplete="name"
            error={fields.name}
            required
          />
          {lockedEmail ? (
            <TextField isReadOnly value={lockedEmail} className="flex flex-col gap-1.5">
              <Label>{t('invite.email')}</Label>
              <Input className="h-12 text-base" />
              <p className="text-muted text-xs">{t('invite.emailLocked')}</p>
            </TextField>
          ) : (
            <Field
              name="email"
              type="email"
              inputMode="email"
              label={t('invite.email')}
              hint={t('invite.emailHint')}
              value={email}
              onChange={(v) => {
                setEmail(v)
                setFields((f) => ({ ...f, email: '' }))
              }}
              autoComplete="email"
              error={fields.email}
              required
            />
          )}
          <PasswordField
            label={t('invite.password')}
            value={password}
            onChange={(v) => {
              setPassword(v)
              setFields((f) => ({ ...f, password: '' }))
            }}
            error={fields.password}
            hint={t('auth.passwordHint')}
          />
          {errorLine}
          <Button type="submit" className="h-12 w-full" isPending={pending}>
            {t('invite.create')}
          </Button>
          <p className="text-muted text-center text-xs">
            {t('invite.expiresOn', {
              date: new Date(inv.expiresAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }),
            })}
          </p>
        </form>
      </Card.Content>
    </Card>
  )
}
