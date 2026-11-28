'use client'

import { Button, Description, Label, TextArea, TextField } from '@heroui/react'
import { can } from '@repo/auth/permissions'
import { cn } from '@repo/ui/cn'
import { Container } from '@repo/ui/components/container'
import { EmptyState } from '@repo/ui/components/empty-state'
import { StatusMascot } from '@repo/ui/components/status-mascot'
import { REVIEW_REPLY_MAX, reviewRejectionReasons } from '@repo/validators'
import { ExternalLink, Star } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { LoadMore, QueryFeedback } from '@/components/query-feedback'
import { readableData } from '@/lib/api-errors'
import { WEB_URL } from '@/lib/env'
import {
  type ManageReview,
  type ReviewScope,
  type ReviewStatus,
  scopeKey,
  useModerateReview,
  useReplyToReview,
  useReviewList,
} from '@/lib/reviews'
import { useSession } from '@/lib/session'

const STATUSES: ReviewStatus[] = ['pending', 'approved', 'rejected']
type Reason = (typeof reviewRejectionReasons)[number]

/** Scopes this person may open: every village they moderate, then businesses not already covered. */
function useScopes(): ReviewScope[] {
  const { actor, memberships } = useSession()
  return useMemo(() => {
    const scopes: ReviewScope[] = []
    if (actor.globalRole === 'super_admin') scopes.push({ kind: 'all', name: '' })
    const moderated = memberships.villages.filter((v) =>
      can(actor, 'review.moderate', { type: 'village', villageId: v.id }),
    )
    for (const v of moderated) scopes.push({ kind: 'village', id: v.id, name: v.name })
    const covered = new Set(moderated.map((v) => v.id))
    for (const b of memberships.businesses) {
      if (!covered.has(b.villageId)) scopes.push({ kind: 'business', id: b.id, name: b.name })
    }
    return scopes
  }, [actor, memberships])
}

/**
 * "Ulasan" (PLAN-product-reviews). Village admins and assistants approve or reject buyer reviews of their
 * village; business members read the reviews of their products and reply to approved ones. The API checks
 * every action again.
 */
export function ReviewQueue() {
  const t = useTranslations('reviews')
  const scopes = useScopes()
  const [scopeId, setScopeId] = useState<string | null>(null)
  const scope = scopes.find((s) => scopeKey(s) === scopeId) ?? scopes[0] ?? null
  const [status, setStatus] = useState<ReviewStatus>('pending')
  const list = useReviewList(scope, status)
  const pages = readableData(list)?.pages
  const reviews = pages?.flatMap((p) => p.data) ?? []
  const counts = pages?.[0]?.meta.counts
  const moderator = scope?.kind !== 'business'
  const [notice, setNotice] = useState<string | null>(null)

  return (
    <Container className="flex max-w-3xl flex-col gap-5 py-6 sm:py-10">
      <div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">{t('title')}</h1>
        <p className="text-muted mt-2 max-w-[60ch] text-sm leading-relaxed">
          {moderator ? t('introModerator') : t('introBusiness')}
        </p>
      </div>

      {scopes.length > 1 ? (
        <label className="flex flex-col gap-1.5 text-sm font-semibold sm:max-w-sm">
          {t('scope')}
          <select
            value={scope ? scopeKey(scope) : ''}
            onChange={(event) => {
              setScopeId(event.target.value)
              setNotice(null)
            }}
            className="border-line-strong bg-surface h-11 rounded-(--radius-compact) border px-3 text-base font-normal"
          >
            {scopes.map((s) => (
              <option key={scopeKey(s)} value={scopeKey(s)}>
                {s.kind === 'all' ? t('scopeAll') : s.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <div role="group" aria-label={t('title')} className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={status === s}
            onClick={() => {
              setStatus(s)
              setNotice(null)
            }}
            className={cn(
              'inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors',
              status === s
                ? 'border-accent bg-accent text-accent-foreground'
                : 'border-line-strong bg-surface hover:bg-wash',
            )}
          >
            {t(`tabs.${s}`)}
            {counts ? (
              <span
                className={cn(
                  'min-w-6 rounded-full px-1.5 text-xs tabular-nums',
                  status === s ? 'bg-white/20' : 'bg-wash',
                )}
              >
                {counts[s]}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {notice ? (
        <p
          role="status"
          className="bg-accent-soft text-accent-soft-foreground rounded-xl px-4 py-3 text-sm"
        >
          {notice}
        </p>
      ) : null}

      <QueryFeedback query={list} />
      {list.isSuccess && reviews.length === 0 ? (
        <EmptyState title={t(`empty.${status}`)} illustration={<StatusMascot pose="empty" />} />
      ) : null}

      <ul className="flex flex-col gap-3">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} onDone={setNotice} />
        ))}
      </ul>
      <LoadMore query={list} label={t('more')} />
    </Container>
  )
}

function ReviewCard({ review, onDone }: { review: ManageReview; onDone: (m: string) => void }) {
  const t = useTranslations('reviews')
  const moderate = useModerateReview()
  const reply = useReplyToReview()
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState<Reason | null>(null)
  const [replying, setReplying] = useState(false)
  const [draft, setDraft] = useState(review.reply ?? '')
  const [failed, setFailed] = useState(false)
  const busy = moderate.isPending || reply.isPending
  const date = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(
    new Date(review.createdAt),
  )

  async function run(action: () => Promise<unknown>, message: string) {
    setFailed(false)
    try {
      await action()
      onDone(message)
    } catch {
      setFailed(true)
    }
  }

  const approve = () =>
    run(() => moderate.mutateAsync({ id: review.id, status: 'approved' }), t('done.approved'))
  const reject = () =>
    reason &&
    run(
      () => moderate.mutateAsync({ id: review.id, status: 'rejected', rejectionReason: reason }),
      t('done.rejected'),
    )

  return (
    <li className="border-line bg-surface rounded-2xl border p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <div className="min-w-0">
          <p className="font-semibold wrap-break-word">{review.reviewerName}</p>
          <p className="text-muted text-xs">
            {date} · {review.business.name}
          </p>
        </div>
        <span
          className="flex items-center gap-0.5"
          aria-label={t('stars', { rating: review.rating })}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              aria-hidden
              className={cn(
                'size-4',
                n <= review.rating ? 'fill-amber-500 text-amber-500' : 'text-line-strong',
              )}
            />
          ))}
        </span>
      </div>
      <a
        href={`${WEB_URL}/produk/${review.product.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent mt-2 inline-flex items-center gap-1 text-sm font-semibold hover:underline"
      >
        {review.product.name}
        <ExternalLink className="size-3.5" aria-hidden />
        <span className="sr-only">{t('openProduct')}</span>
      </a>
      <p className="mt-2 text-sm leading-relaxed wrap-break-word whitespace-pre-line">
        {review.body}
      </p>

      {review.status === 'rejected' && review.rejectionReason ? (
        <p className="text-muted mt-2 text-xs font-semibold">
          {t('rejectedFor', { reason: t(`reasons.${review.rejectionReason}`) })}
        </p>
      ) : null}

      {review.reply && !replying ? (
        <div className="bg-wash mt-3 rounded-xl px-3.5 py-3">
          <p className="text-xs font-semibold">{t('yourReply')}</p>
          <p className="mt-1 text-sm whitespace-pre-line">{review.reply}</p>
        </div>
      ) : null}

      {rejecting ? (
        <fieldset className="border-line mt-4 rounded-xl border p-3">
          <legend className="px-1 text-sm font-semibold">{t('rejectTitle')}</legend>
          <div className="flex flex-col">
            {reviewRejectionReasons.map((r) => (
              <label key={r} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
                <input
                  type="radio"
                  name={`reason-${review.id}`}
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="size-4 accent-[var(--accent)]"
                />
                {t(`reasons.${r}`)}
              </label>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              variant="danger"
              isDisabled={!reason}
              isPending={moderate.isPending}
              onPress={reject}
              className="min-h-11 rounded-full px-4 font-semibold"
            >
              {t('confirmReject')}
            </Button>
            <Button
              variant="secondary"
              onPress={() => setRejecting(false)}
              className="min-h-11 rounded-full px-4 font-semibold"
            >
              {t('cancel')}
            </Button>
          </div>
        </fieldset>
      ) : null}

      {replying ? (
        <div className="mt-4 flex flex-col gap-2">
          <TextField value={draft} onChange={setDraft} maxLength={REVIEW_REPLY_MAX}>
            <Label>{t('replyLabel', { name: review.reviewerName })}</Label>
            <TextArea rows={3} className="text-base" />
            <Description>{t('replyHint')}</Description>
          </TextField>
          <div className="flex flex-wrap gap-2">
            <Button
              isDisabled={draft.trim().length < 2}
              isPending={reply.isPending}
              onPress={() =>
                run(async () => {
                  await reply.mutateAsync({ id: review.id, reply: draft })
                  setReplying(false)
                }, t('done.replied'))
              }
              className="min-h-11 rounded-full px-4 font-semibold"
            >
              {t('saveReply')}
            </Button>
            <Button
              variant="secondary"
              onPress={() => {
                setReplying(false)
                setDraft(review.reply ?? '')
              }}
              className="min-h-11 rounded-full px-4 font-semibold"
            >
              {t('cancel')}
            </Button>
          </div>
        </div>
      ) : null}

      {!rejecting && !replying ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {review.canModerate && review.status !== 'approved' ? (
            <Button
              isPending={moderate.isPending}
              isDisabled={busy}
              onPress={approve}
              className="min-h-11 rounded-full px-4 font-semibold"
            >
              {review.status === 'rejected' ? t('restore') : t('approve')}
            </Button>
          ) : null}
          {review.canModerate && review.status !== 'rejected' ? (
            <Button
              variant="secondary"
              isDisabled={busy}
              onPress={() => setRejecting(true)}
              className="min-h-11 rounded-full px-4 font-semibold"
            >
              {review.status === 'approved' ? t('hide') : t('reject')}
            </Button>
          ) : null}
          {review.canReply ? (
            <Button
              variant="secondary"
              isDisabled={busy}
              onPress={() => setReplying(true)}
              className="min-h-11 rounded-full px-4 font-semibold"
            >
              {review.reply ? t('editReply') : t('reply')}
            </Button>
          ) : null}
          {review.canReply && review.reply ? (
            <Button
              variant="ghost"
              isDisabled={busy}
              onPress={() =>
                run(() => reply.mutateAsync({ id: review.id, reply: null }), t('done.replyRemoved'))
              }
              className="text-danger min-h-11 rounded-full px-4 font-semibold"
            >
              {t('removeReply')}
            </Button>
          ) : null}
        </div>
      ) : null}

      {failed ? (
        <p role="alert" className="text-danger mt-2 text-sm">
          {t('failed')}
        </p>
      ) : null}
    </li>
  )
}
