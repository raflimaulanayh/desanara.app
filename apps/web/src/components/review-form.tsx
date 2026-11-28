'use client'

import {
  Button,
  Description,
  FieldError,
  Input,
  Label,
  Modal,
  TextArea,
  TextField,
} from '@heroui/react'
import { cn } from '@repo/ui/cn'
import {
  REVIEW_BODY_MAX,
  REVIEW_BODY_MIN,
  REVIEW_NAME_MAX,
  REVIEW_NAME_MIN,
} from '@repo/validators'
import { CheckCircle2, PenLine, Star } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useId, useState, type FormEvent } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.desanara.app'

type Status = 'idle' | 'sending' | 'sent'
type FieldErrors = Partial<Record<'rating' | 'name' | 'body' | 'form', string>>

/**
 * "Write a review" (PLAN-product-reviews): stars, a display name and the story, sent straight from the
 * browser so the API rate limit sees the buyer's own address. Nothing appears publicly until a village
 * assistant approves it, and the success state says so. `website` is a hidden honeypot.
 */
export function ReviewForm({
  slug,
  productName,
  variant = 'primary',
}: {
  slug: string
  productName: string
  variant?: 'primary' | 'quiet'
}) {
  const t = useTranslations('reviews.form')
  const tr = useTranslations('reviews')
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [name, setName] = useState('')
  const [body, setBody] = useState('')
  const [website, setWebsite] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const ratingId = useId()
  const names = t.raw('ratingNames') as string[]
  const shownRating = hover || rating

  function reset() {
    setStatus('idle')
    setRating(0)
    setHover(0)
    setName('')
    setBody('')
    setWebsite('')
    setErrors({})
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {}
    if (rating < 1) next.rating = t('errorRating')
    if (name.trim().length < REVIEW_NAME_MIN) next.name = t('errorName')
    if (body.trim().replace(/\s+/g, ' ').length < REVIEW_BODY_MIN) next.body = t('errorBody')
    return next
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length) return
    setStatus('sending')
    try {
      const res = await fetch(`${API}/v1/products/${encodeURIComponent(slug)}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewerName: name,
          rating,
          body,
          locale: locale === 'en' ? 'en' : 'id',
          website,
        }),
      })
      if (res.status === 429) {
        setErrors({ form: t('errorTooMany') })
        setStatus('idle')
        return
      }
      if (!res.ok) throw new Error(String(res.status))
      setStatus('sent')
    } catch {
      setErrors({ form: t('errorGeneric') })
      setStatus('idle')
    }
  }

  return (
    <>
      <Button
        variant={variant === 'primary' ? 'primary' : 'secondary'}
        onPress={() => setOpen(true)}
        className={cn(
          'min-h-11 rounded-full px-5 font-semibold',
          variant === 'quiet' && 'border-line-strong bg-surface hover:bg-wash border',
        )}
      >
        <PenLine className="size-4" aria-hidden />
        {tr('write')}
      </Button>

      <Modal.Backdrop
        isOpen={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next && status === 'sent') reset()
        }}
      >
        <Modal.Container placement="auto" scroll="inside">
          <Modal.Dialog className="rounded-(--radius) sm:max-w-lg">
            <Modal.CloseTrigger aria-label={t('close')} />
            {status === 'sent' ? (
              <>
                <Modal.Header className="items-center pt-4 text-center">
                  <span className="bg-accent-soft text-accent grid size-14 place-items-center rounded-full">
                    <CheckCircle2 className="size-7" aria-hidden />
                  </span>
                  <Modal.Heading className="mt-3 text-xl font-semibold">
                    {t('successTitle')}
                  </Modal.Heading>
                </Modal.Header>
                <Modal.Body className="text-center">
                  <p role="status" className="text-foreground/80 leading-relaxed text-pretty">
                    {t('successBody')}
                  </p>
                </Modal.Body>
                <Modal.Footer>
                  <Button slot="close" className="min-h-11 w-full rounded-full font-semibold">
                    {t('close')}
                  </Button>
                </Modal.Footer>
              </>
            ) : (
              <form noValidate onSubmit={submit} className="contents">
                <Modal.Header>
                  <Modal.Heading className="text-xl font-semibold">{t('title')}</Modal.Heading>
                  <p className="text-muted mt-0.5 line-clamp-2 text-sm">
                    {t('intro', { product: productName })}
                  </p>
                </Modal.Header>
                <Modal.Body className="flex flex-col gap-5">
                  <fieldset aria-describedby={errors.rating ? `${ratingId}-error` : undefined}>
                    <legend className="text-sm font-semibold">{t('rating')}</legend>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex" onMouseLeave={() => setHover(0)}>
                        {[1, 2, 3, 4, 5].map((value) => (
                          <label
                            key={value}
                            className="group relative grid size-11 cursor-pointer place-items-center rounded-full has-focus-visible:outline-2 has-focus-visible:outline-[var(--focus)]"
                            onMouseEnter={() => setHover(value)}
                          >
                            <input
                              type="radio"
                              name="rating"
                              value={value}
                              checked={rating === value}
                              onChange={() => {
                                setRating(value)
                                setErrors((current) => ({ ...current, rating: undefined }))
                              }}
                              className="sr-only"
                            />
                            <Star
                              aria-hidden
                              className={cn(
                                'size-8 transition-transform duration-150 group-active:scale-90 motion-reduce:transition-none',
                                value <= shownRating
                                  ? 'fill-amber-500 text-amber-500'
                                  : 'text-line-strong fill-transparent',
                              )}
                              strokeWidth={1.6}
                            />
                            <span className="sr-only">{names[value - 1]}</span>
                          </label>
                        ))}
                      </div>
                      <span aria-hidden className="text-muted text-sm font-medium">
                        {shownRating ? names[shownRating - 1] : null}
                      </span>
                    </div>
                    {errors.rating ? (
                      <p id={`${ratingId}-error`} className="text-danger mt-1 text-sm">
                        {errors.rating}
                      </p>
                    ) : null}
                  </fieldset>

                  <TextField
                    value={name}
                    onChange={(value) => {
                      setName(value)
                      setErrors((current) => ({ ...current, name: undefined }))
                    }}
                    isInvalid={Boolean(errors.name)}
                    maxLength={REVIEW_NAME_MAX}
                    autoComplete="nickname"
                  >
                    <Label>{t('name')}</Label>
                    <Input
                      variant="secondary"
                      className="h-11 rounded-(--radius-compact) px-3.5 text-base placeholder:text-sm"
                    />
                    {errors.name ? (
                      <FieldError>{errors.name}</FieldError>
                    ) : (
                      <Description>{t('nameHint')}</Description>
                    )}
                  </TextField>

                  <TextField
                    value={body}
                    onChange={(value) => {
                      setBody(value)
                      setErrors((current) => ({ ...current, body: undefined }))
                    }}
                    isInvalid={Boolean(errors.body)}
                    maxLength={REVIEW_BODY_MAX}
                  >
                    <Label>{t('body')}</Label>
                    <TextArea
                      variant="secondary"
                      rows={5}
                      placeholder={t('bodyHint')}
                      className="rounded-(--radius-compact) px-3.5 py-2.5 text-base placeholder:text-sm"
                    />
                    <div className="flex items-start justify-between gap-3">
                      {errors.body ? (
                        <FieldError>{errors.body}</FieldError>
                      ) : (
                        <Description>{t('privacy')}</Description>
                      )}
                      <span className="text-muted shrink-0 pt-1 text-xs tabular-nums">
                        {t('counter', { count: body.length, max: REVIEW_BODY_MAX })}
                      </span>
                    </div>
                  </TextField>

                  {/* Honeypot: hidden from people and assistive tech, bots fill it in. */}
                  <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
                    <label>
                      Website
                      <input
                        type="text"
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                        value={website}
                        onChange={(event) => setWebsite(event.target.value)}
                      />
                    </label>
                  </div>

                  {errors.form ? (
                    <p
                      role="alert"
                      className="bg-danger/8 text-danger rounded-(--radius-compact) px-3 py-2 text-sm"
                    >
                      {errors.form}
                    </p>
                  ) : null}
                </Modal.Body>
                <Modal.Footer className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button
                    slot="close"
                    variant="secondary"
                    className="min-h-11 w-full rounded-full font-semibold sm:w-auto"
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    type="submit"
                    isPending={status === 'sending'}
                    className="min-h-11 w-full rounded-full px-6 font-semibold sm:w-auto"
                  >
                    {status === 'sending' ? t('sending') : t('submit')}
                  </Button>
                </Modal.Footer>
              </form>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  )
}
