import { Stars } from './stars'

export interface ReviewItemData {
  id: string
  reviewerName: string
  rating: number
  body: string
  createdAt: string
  reply: string | null
}

const AVATAR_TINTS = ['bg-sprout/35', 'bg-sun/35', 'bg-leaf/25', 'bg-clay/20', 'bg-accent-soft']

/** Relative date in the reader's language: "3 hari lalu", "2 months ago". */
export function relativeDate(iso: string, locale: string, now = Date.now()) {
  const time = new Date(iso).getTime()
  // A missing or malformed date shows nothing rather than "NaN" or a RangeError.
  if (!Number.isFinite(time)) return ''
  const days = Math.round((time - now) / 86_400_000)
  const lang = locale === 'en' ? 'en' : 'id'
  // "Kemarin" reads well; "bulan lalu" for one month does not, so only days use the auto wording.
  if (days > -7) return new Intl.RelativeTimeFormat(lang, { numeric: 'auto' }).format(days, 'day')
  const format = new Intl.RelativeTimeFormat(lang, { numeric: 'always' })
  if (days > -30) return format.format(Math.round(days / 7), 'week')
  if (days > -365) return format.format(Math.round(days / 30), 'month')
  return format.format(Math.round(days / 365), 'year')
}

/** One approved review: initial avatar, name, stars, date, text and the seller reply when there is one. */
export function ReviewItem({
  review,
  locale,
  starsLabel,
  replyLabel,
}: {
  review: ReviewItemData
  locale: string
  starsLabel: string
  replyLabel: string
}) {
  const initial = review.reviewerName.trim().charAt(0).toUpperCase()
  const tint =
    AVATAR_TINTS[Array.from(review.reviewerName).reduce((sum, c) => sum + c.charCodeAt(0), 0) % 5]
  return (
    <li className="py-5 first:pt-0 last:pb-0">
      <article className="flex gap-3">
        <span
          aria-hidden
          className={`${tint} text-foreground grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold`}
        >
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
            <h3 className="text-sm font-semibold wrap-break-word">{review.reviewerName}</h3>
            <time dateTime={review.createdAt} className="text-muted text-xs">
              {relativeDate(review.createdAt, locale)}
            </time>
          </div>
          <p className="mt-1 flex items-center text-sm">
            <Stars value={review.rating} className="text-[0.9rem]" />
            <span className="sr-only">{starsLabel}</span>
          </p>
          <p className="text-foreground/85 mt-2 text-sm leading-relaxed text-pretty wrap-break-word whitespace-pre-line">
            {review.body}
          </p>
          {review.reply ? (
            <div className="bg-wash/60 border-line mt-3 rounded-(--radius-compact) border px-3.5 py-3">
              <p className="text-xs font-semibold">{replyLabel}</p>
              <p className="text-foreground/80 mt-1 text-sm leading-relaxed text-pretty wrap-break-word whitespace-pre-line">
                {review.reply}
              </p>
            </div>
          ) : null}
        </div>
      </article>
    </li>
  )
}
