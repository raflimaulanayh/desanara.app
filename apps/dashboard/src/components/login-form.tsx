'use client'

import { Button, Card, Input, Label, TextField } from '@heroui/react'
import { useTranslations } from 'next-intl'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { safeNext } from '@/lib/nav'

export function LoginForm() {
  const t = useTranslations('login')
  const router = useRouter()
  const queryClient = useQueryClient()
  const next = safeNext(useSearchParams().get('next'))
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setPending(true)
    setError(null)
    const { error } = await authClient.signIn.email({
      email: String(form.get('email')),
      password: String(form.get('password')),
    })
    setPending(false)
    if (error) return setError(t('failed'))
    // Drop the cached "not logged in" answer so the shell reads the new session.
    queryClient.removeQueries({ queryKey: ['me'] })
    router.replace(next)
  }

  return (
    <Card className="w-full max-w-sm">
      <Card.Header>
        <Card.Title>{t('title')}</Card.Title>
        <Card.Description>{t('subtitle')}</Card.Description>
      </Card.Header>
      <Card.Content>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <TextField name="email" type="email" isRequired>
            <Label>{t('email')}</Label>
            <Input autoComplete="email" />
          </TextField>
          <TextField name="password" type="password" isRequired>
            <Label>{t('password')}</Label>
            <Input autoComplete="current-password" />
          </TextField>
          {error ? (
            <p role="alert" className="text-danger text-sm">
              {error}
            </p>
          ) : null}
          <Button type="submit" isPending={pending} className="w-full">
            {t('submit')}
          </Button>
        </form>
      </Card.Content>
    </Card>
  )
}
