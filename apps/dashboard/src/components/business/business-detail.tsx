'use client'

import { Button, Card } from '@heroui/react'
import { Container } from '@repo/ui/components/container'
import { CircleCheck, CircleX, ExternalLink, Pencil } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type ReactNode, useState } from 'react'
import { describeApiError } from '@/lib/api-errors'
import {
  type Business,
  type BusinessAction,
  useBusiness,
  useBusinessAction,
  useDeleteBusiness,
} from '@/lib/businesses'
import { Field } from '../field'
import { StatusChips } from './status-chips'

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL?.replace(/\/$/, '')

/** What still blocks publishing, in the order the API checks it (mirrors service.publish). */
export function publishChecklist(b: Business) {
  return [
    { id: 'notTakenDown', ok: !b.takenDownAt },
    { id: 'verified', ok: b.verificationStatus === 'verified' },
    { id: 'consent', ok: Boolean(b.consentAt) },
    { id: 'whatsapp', ok: Boolean(b.whatsappNumber) },
  ] as const
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-line grid gap-1 border-b py-3 last:border-0 sm:grid-cols-[12rem_1fr]">
      <dt className="text-muted text-sm">{label}</dt>
      <dd className="text-sm font-medium break-words">{children}</dd>
    </div>
  )
}

/** A confirm step with a required text (reject note, takedown reason) or none (delete). */
function ConfirmPanel({
  title,
  label,
  min,
  danger,
  confirm,
  pending,
  onConfirm,
  onCancel,
}: {
  title: string
  label?: string
  min?: number
  danger?: boolean
  confirm: string
  pending: boolean
  onConfirm: (text: string) => void
  onCancel: () => void
}) {
  const t = useTranslations()
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  return (
    <div className="bg-wash flex flex-col gap-3 rounded-2xl p-4">
      <p className="font-bold">{title}</p>
      {label ? (
        <Field
          name="reason"
          multiline
          label={label}
          value={text}
          onChange={setText}
          error={error}
        />
      ) : null}
      <div className="flex gap-2">
        <Button
          variant={danger ? 'danger' : 'primary'}
          isPending={pending}
          onPress={() => {
            if (min && text.trim().length < min) return setError(t('form.tooShort', { min }))
            onConfirm(text.trim())
          }}
        >
          {confirm}
        </Button>
        <Button variant="ghost" onPress={onCancel}>
          {t('common.cancel')}
        </Button>
      </div>
    </div>
  )
}

export function BusinessDetail({ id }: { id: string }) {
  const t = useTranslations()
  const router = useRouter()
  const q = useBusiness(id)
  const action = useBusinessAction(id)
  const remove = useDeleteBusiness(id)
  const [panel, setPanel] = useState<'reject' | 'takedown' | 'delete' | null>(null)
  const [message, setMessage] = useState<{ kind: 'error' | 'ok'; text: string } | null>(null)

  if (q.isPending) return <Container className="py-10 text-sm">{t('common.loading')}</Container>
  if (q.isError) {
    return (
      <Container className="flex flex-col items-start gap-3 py-10">
        <p role="alert">{describeApiError(q.error, t).message}</p>
        <Link href="/businesses" className="text-accent font-semibold">
          {t('businessDetail.backToList')}
        </Link>
      </Container>
    )
  }

  const b = q.data
  const p = b.permissions
  const checklist = publishChecklist(b)
  const ready = checklist.every((c) => c.ok)

  async function run(a: BusinessAction, ok: string) {
    setMessage(null)
    try {
      await action.mutateAsync(a)
      setPanel(null)
      setMessage({ kind: 'ok', text: ok })
    } catch (e) {
      const d = describeApiError(e, t)
      if (d.sessionExpired) return router.replace('/login')
      setMessage({ kind: 'error', text: d.message })
    }
  }

  return (
    <Container className="flex flex-col gap-5 py-6 sm:py-10">
      <Link href="/businesses" className="text-muted text-sm font-semibold hover:underline">
        ← {t('businessDetail.backToList')}
      </Link>

      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold break-words sm:text-3xl">{b.name}</h1>
          <p className="text-muted mt-1 text-sm">{b.village.name}</p>
          <div className="mt-3">
            <StatusChips b={b} />
          </div>
        </div>
        {p.update ? (
          <Link
            href={`/businesses/${b.id}/edit`}
            className="border-line-strong hover:bg-wash inline-flex h-11 shrink-0 items-center gap-2 self-start rounded-full border px-4 text-sm font-bold"
          >
            <Pencil className="size-4" aria-hidden />
            {t('businessDetail.edit')}
          </Link>
        ) : null}
      </header>

      {message ? (
        <p
          role={message.kind === 'error' ? 'alert' : 'status'}
          className={
            message.kind === 'error'
              ? 'text-danger text-sm font-medium'
              : 'text-success text-sm font-medium'
          }
        >
          {message.text}
        </p>
      ) : null}

      {b.takenDownAt ? (
        <div className="bg-danger/10 rounded-2xl p-4 text-sm">
          <p className="font-bold">{t('businessDetail.takenDownTitle')}</p>
          <p className="mt-1">{b.takedownReason}</p>
        </div>
      ) : null}
      {b.verificationStatus === 'rejected' && b.verificationNote ? (
        <div className="bg-danger/10 rounded-2xl p-4 text-sm">
          <p className="font-bold">{t('businessDetail.rejectedTitle')}</p>
          <p className="mt-1">{b.verificationNote}</p>
          <p className="text-muted mt-2">{t('businessDetail.rejectedHint')}</p>
        </div>
      ) : null}

      <Card>
        <Card.Header>
          <Card.Title className="font-bold">{t('businessDetail.publishTitle')}</Card.Title>
          <Card.Description>
            {b.status === 'published'
              ? t('businessDetail.isPublished')
              : t('businessDetail.publishHint')}
          </Card.Description>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          <ul className="flex flex-col gap-2">
            {checklist.map((c) => (
              <li key={c.id} className="flex items-center gap-2 text-sm">
                {c.ok ? (
                  <CircleCheck className="text-success size-5 shrink-0" aria-hidden />
                ) : (
                  <CircleX className="text-danger size-5 shrink-0" aria-hidden />
                )}
                <span>
                  <span className="sr-only">
                    {c.ok ? t('businessDetail.done') : t('businessDetail.missing')}:{' '}
                  </span>
                  {t(`businessDetail.check.${c.id}`)}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            {p.publish && b.status !== 'published' ? (
              <Button
                isDisabled={!ready}
                isPending={action.isPending}
                onPress={() => run({ type: 'publish' }, t('businessDetail.published'))}
              >
                {t('businessDetail.publish')}
              </Button>
            ) : null}
            {p.publish && b.status === 'published' ? (
              <Button
                variant="secondary"
                isPending={action.isPending}
                onPress={() => run({ type: 'unpublish' }, t('businessDetail.unpublished'))}
              >
                {t('businessDetail.unpublish')}
              </Button>
            ) : null}
            {b.status === 'published' && WEB_URL ? (
              <a
                href={`${WEB_URL}/desa/${b.village.slug}/${b.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent inline-flex h-10 items-center gap-1 px-2 text-sm font-semibold hover:underline"
              >
                {t('businessDetail.viewPublic')}
                <ExternalLink className="size-4" aria-hidden />
              </a>
            ) : null}
          </div>
        </Card.Content>
      </Card>

      {p.verify && b.verificationStatus === 'pending' ? (
        <Card>
          <Card.Header>
            <Card.Title className="font-bold">{t('businessDetail.reviewTitle')}</Card.Title>
            <Card.Description>{t('businessDetail.reviewHint')}</Card.Description>
          </Card.Header>
          <Card.Content className="flex flex-col gap-3">
            {panel === 'reject' ? (
              <ConfirmPanel
                title={t('businessDetail.rejectTitle')}
                label={t('businessDetail.rejectNote')}
                min={5}
                danger
                confirm={t('businessDetail.reject')}
                pending={action.isPending}
                onCancel={() => setPanel(null)}
                onConfirm={(note) =>
                  run({ type: 'verify', decision: 'rejected', note }, t('businessDetail.rejected'))
                }
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button
                  isPending={action.isPending}
                  onPress={() =>
                    run({ type: 'verify', decision: 'verified' }, t('businessDetail.verified'))
                  }
                >
                  {t('businessDetail.verify')}
                </Button>
                <Button variant="danger-soft" onPress={() => setPanel('reject')}>
                  {t('businessDetail.reject')}
                </Button>
              </div>
            )}
          </Card.Content>
        </Card>
      ) : null}

      <Card>
        <Card.Header>
          <Card.Title className="font-bold">{t('businessDetail.dataTitle')}</Card.Title>
        </Card.Header>
        <Card.Content>
          <dl>
            <Row label={t('businessForm.fields.ownerName')}>{b.ownerName ?? '—'}</Row>
            <Row label={t('businessForm.fields.whatsappNumber')}>
              {b.whatsappNumber ? `+${b.whatsappNumber}` : '—'}
            </Row>
            <Row label={t('businessDetail.addressInternal')}>{b.address ?? '—'}</Row>
            <Row label={t('businessForm.fields.description')}>{b.description ?? '—'}</Row>
            <Row label={t('businessDetail.onlineShops')}>
              {[b.shopeeUrl, b.tokopediaUrl, b.tiktokShopUrl, b.instagramUrl].filter(Boolean).length
                ? [b.shopeeUrl, b.tokopediaUrl, b.tiktokShopUrl, b.instagramUrl]
                    .filter((u): u is string => Boolean(u))
                    .map((u) => (
                      <a
                        key={u}
                        href={u}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent block truncate hover:underline"
                      >
                        {u}
                      </a>
                    ))
                : '—'}
            </Row>
            <Row label={t('businessForm.fields.nib')}>{b.nib ?? '—'}</Row>
            <Row label={t('businessDetail.consent')}>
              {b.consentAt
                ? t('businessDetail.consentGiven', {
                    date: new Date(b.consentAt).toLocaleDateString('id-ID', {
                      dateStyle: 'medium',
                    }),
                  })
                : t('businessDetail.consentMissing')}
            </Row>
            <Row label={t('businessDetail.products')}>
              {t('businessList.products', { count: b.productCount })}
            </Row>
          </dl>
        </Card.Content>
      </Card>

      {p.takedown || p.delete ? (
        <Card className="border-danger/30 border">
          <Card.Header>
            <Card.Title className="font-bold">{t('businessDetail.dangerTitle')}</Card.Title>
          </Card.Header>
          <Card.Content className="flex flex-col gap-3">
            {panel === 'takedown' ? (
              <ConfirmPanel
                title={t('businessDetail.takedownTitle')}
                label={t('businessDetail.takedownReason')}
                min={5}
                danger
                confirm={t('businessDetail.takedown')}
                pending={action.isPending}
                onCancel={() => setPanel(null)}
                onConfirm={(reason) =>
                  run({ type: 'takedown', reason }, t('businessDetail.takenDown'))
                }
              />
            ) : panel === 'delete' ? (
              <ConfirmPanel
                title={t('businessDetail.deleteTitle', { name: b.name })}
                danger
                confirm={t('businessDetail.delete')}
                pending={remove.isPending}
                onCancel={() => setPanel(null)}
                onConfirm={async () => {
                  try {
                    await remove.mutateAsync()
                    router.replace('/businesses')
                  } catch (e) {
                    setMessage({ kind: 'error', text: describeApiError(e, t).message })
                  }
                }}
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {p.takedown && !b.takenDownAt ? (
                  <Button variant="danger-soft" onPress={() => setPanel('takedown')}>
                    {t('businessDetail.takedown')}
                  </Button>
                ) : null}
                {p.takedown && b.takenDownAt ? (
                  <Button
                    variant="secondary"
                    isPending={action.isPending}
                    onPress={() => run({ type: 'restore' }, t('businessDetail.restored'))}
                  >
                    {t('businessDetail.restore')}
                  </Button>
                ) : null}
                {p.delete ? (
                  <Button variant="danger-soft" onPress={() => setPanel('delete')}>
                    {t('businessDetail.delete')}
                  </Button>
                ) : null}
              </div>
            )}
          </Card.Content>
        </Card>
      ) : null}
    </Container>
  )
}
