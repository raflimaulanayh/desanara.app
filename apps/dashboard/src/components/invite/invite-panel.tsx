'use client'

import { Button, Card } from '@heroui/react'
import { type InvitationRole, invitationCreateSchema } from '@repo/validators'
import { Check, Copy, MessageCircle, UserPlus, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { fieldMessages } from '@/lib/business-form'
import { describeApiError } from '@/lib/api-errors'
import {
  type CreatedInvitation,
  type InvitationScope,
  invitationWhatsAppUrl,
  useCreateInvitation,
  usePendingInvitations,
  useRevokeInvitation,
} from '@/lib/invitations'
import { Field } from '../field'

export interface InviteRoleOption {
  role: InvitationRole
  label: string
}

/**
 * "Undang" for one village or business: a short form (name and email optional), then the link to
 * send through WhatsApp or copy, plus the pending invitations with a cancel button.
 */
export function InvitePanel({
  scope,
  title,
  hint,
  roles,
}: {
  scope: InvitationScope
  title: string
  hint: string
  roles: InviteRoleOption[]
}) {
  const t = useTranslations()
  const router = useRouter()
  const pending = usePendingInvitations(scope, roles.length > 0)
  const create = useCreateInvitation(scope)
  const revoke = useRevokeInvitation(scope)
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState<InvitationRole>(roles[0]!.role)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [created, setCreated] = useState<CreatedInvitation | null>(null)
  const [copied, setCopied] = useState(false)

  function reset() {
    setName('')
    setEmail('')
    setErrors({})
    setMessage(null)
  }

  async function submit() {
    const parsed = invitationCreateSchema.safeParse({
      role,
      ...scope,
      inviteeName: name.trim() || undefined,
      inviteeEmail: email.trim() || undefined,
    })
    if (!parsed.success) return setErrors(fieldMessages(parsed.error.issues as never, t))
    setMessage(null)
    try {
      setCreated(await create.mutateAsync(parsed.data))
      setOpen(false)
      reset()
    } catch (e) {
      const d = describeApiError(e, t)
      if (d.sessionExpired) return router.replace('/login')
      setErrors(d.fields)
      setMessage(d.message)
    }
  }

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title className="font-bold">{title}</Card.Title>
        <Card.Description>{hint}</Card.Description>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        {created ? (
          <div className="bg-wash flex flex-col gap-3 rounded-xl p-4">
            <p className="text-sm font-semibold">
              {t('invitePanel.created', { role: created.roleLabel })}
            </p>
            <p className="text-muted text-sm">
              {created.emailed ? t('invitePanel.emailed') : t('invitePanel.shareHint')}
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href={invitationWhatsAppUrl(created)}
                target="_blank"
                rel="noreferrer"
                className="bg-accent text-accent-foreground inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold"
              >
                <MessageCircle className="size-4" aria-hidden />
                {t('invitePanel.whatsapp')}
              </a>
              <Button variant="secondary" onPress={() => copy(created.url)}>
                {copied ? (
                  <Check className="size-4" aria-hidden />
                ) : (
                  <Copy className="size-4" aria-hidden />
                )}
                {copied ? t('invitePanel.copied') : t('invitePanel.copy')}
              </Button>
              <Button variant="ghost" onPress={() => setCreated(null)}>
                {t('invitePanel.done')}
              </Button>
            </div>
          </div>
        ) : null}

        {open ? (
          <div className="flex flex-col gap-4">
            {roles.length > 1 ? (
              <div role="group" aria-label={t('invitePanel.role')} className="flex flex-wrap gap-2">
                {roles.map((r) => (
                  <Button
                    key={r.role}
                    variant={role === r.role ? 'primary' : 'secondary'}
                    onPress={() => setRole(r.role)}
                  >
                    {r.label}
                  </Button>
                ))}
              </div>
            ) : null}
            <Field
              name="inviteeName"
              label={t('invitePanel.name')}
              hint={t('invitePanel.optional')}
              value={name}
              onChange={(v) => {
                setName(v)
                setErrors((e) => ({ ...e, inviteeName: '' }))
              }}
              error={errors.inviteeName}
            />
            <Field
              name="inviteeEmail"
              type="email"
              inputMode="email"
              label={t('invitePanel.email')}
              hint={t('invitePanel.emailHint')}
              value={email}
              onChange={(v) => {
                setEmail(v)
                setErrors((e) => ({ ...e, inviteeEmail: '' }))
              }}
              error={errors.inviteeEmail}
            />
            {message ? (
              <p role="alert" className="text-danger text-sm">
                {message}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button className="h-12" isPending={create.isPending} onPress={submit}>
                <UserPlus className="size-4" aria-hidden />
                {t('invitePanel.create')}
              </Button>
              <Button
                variant="ghost"
                className="h-12"
                onPress={() => {
                  setOpen(false)
                  reset()
                }}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="secondary" className="self-start" onPress={() => setOpen(true)}>
            <UserPlus className="size-4" aria-hidden />
            {roles.length === 1
              ? t('invitePanel.inviteAs', { role: roles[0]!.label })
              : t('invitePanel.invite')}
          </Button>
        )}

        {message && !open ? (
          <p role="alert" className="text-danger text-sm">
            {message}
          </p>
        ) : null}

        {pending.data && pending.data.length > 0 ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">{t('invitePanel.pending')}</p>
            <ul className="flex flex-col">
              {pending.data.map((inv) => (
                <li
                  key={inv.id}
                  className="border-line flex items-center gap-3 border-b py-2 last:border-0"
                >
                  <span className="min-w-0 flex-1 text-sm">
                    <span className="block font-semibold">
                      {inv.inviteeName ?? inv.inviteeEmail ?? t('invitePanel.noName')}
                    </span>
                    <span className="text-muted block text-xs">
                      {t('invitePanel.pendingLine', {
                        role: inv.roleLabel,
                        inviter: inv.inviterName,
                        date: new Date(inv.expiresAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                        }),
                      })}
                    </span>
                  </span>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    aria-label={t('invitePanel.revoke')}
                    isPending={revoke.isPending && revoke.variables === inv.id}
                    onPress={() =>
                      revoke.mutate(inv.id, {
                        onError: (e) => setMessage(describeApiError(e, t).message),
                      })
                    }
                  >
                    <X className="size-4" aria-hidden />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Card.Content>
    </Card>
  )
}
