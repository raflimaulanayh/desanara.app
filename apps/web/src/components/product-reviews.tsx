import { getLocale, getTranslations } from 'next-intl/server'
import { REVIEWS_PAGE_SIZE, type ProductReviewPage } from '@/lib/data'
import { ReviewForm } from './review-form'
import { ReviewItem } from './review-item'
import { ReviewMore } from './review-more'
import { Stars } from './stars'

/**
 * Buyer reviews on the product page (PLAN-product-reviews): the average with a five-to-one bar chart,
 * the newest approved reviews with seller replies, more on demand, and the write-a-review dialog.
 * `reviews` is null when the API could not answer; the section then says so instead of claiming "no reviews".
 */
export async function ProductReviews({
  slug,
  productName,
  businessName,
  reviews,
}: {
  slug: string
  productName: string
  businessName: string
  reviews: ProductReviewPage | null
}) {
  const [t, locale] = await Promise.all([getTranslations('reviews'), getLocale()])
  const summary = reviews?.meta?.summary
  const count = Number.isFinite(summary?.count) ? summary!.count : 0
  const average = Number.isFinite(summary?.average) ? summary!.average! : 0
  const number = (value: number) =>
    new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'id-ID', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value)

  return (
    <section id="ulasan" aria-labelledby="reviews-title" className="scroll-mt-28">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="max-w-[46ch]">
          <h2 id="reviews-title" className="section-title">
            {t('title')}
          </h2>
          <p className="text-muted mt-1 text-sm leading-relaxed text-pretty">{t('subtitle')}</p>
        </div>
        {count > 0 ? (
          <div className="hidden sm:block">
            <ReviewForm slug={slug} productName={productName} variant="quiet" />
          </div>
        ) : null}
      </div>

      {!reviews ? (
        <p className="bg-wash/60 text-muted mt-5 rounded-(--radius) p-5 text-sm">
          {t('unavailable')}
        </p>
      ) : count === 0 ? (
        <div className="border-line bg-wash/50 mt-5 flex flex-col items-start gap-4 rounded-(--radius) border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="font-semibold">{t('emptyTitle')}</p>
            <p className="text-muted mt-1 text-sm leading-relaxed text-pretty">{t('emptyBody')}</p>
          </div>
          <ReviewForm slug={slug} productName={productName} />
        </div>
      ) : (
        <div className="mt-5 grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-10">
          <div className="border-line bg-surface h-fit rounded-(--radius) border p-5 lg:sticky lg:top-28">
            <div className="flex items-center gap-4 lg:flex-col lg:items-start lg:gap-2">
              <p className="flex items-baseline gap-1.5">
                <span className="text-[2.75rem] leading-none font-semibold tracking-[-0.03em] tabular-nums">
                  {number(average)}
                </span>
                <span className="text-muted text-sm">{t('outOf')}</span>
              </p>
              <div>
                <Stars value={average} className="text-lg" />
                <p className="text-muted mt-1 text-sm">{t('basedOn', { count })}</p>
              </div>
            </div>
            <ul className="mt-5 flex flex-col gap-2">
              {(['5', '4', '3', '2', '1'] as const).map((star) => {
                const n = Number(summary?.distribution?.[star]) || 0
                return (
                  <li
                    key={star}
                    className="grid grid-cols-[1.25rem_minmax(0,1fr)_2rem] items-center gap-2 text-sm"
                    aria-label={t('starRow', { star, count: n })}
                  >
                    <span aria-hidden className="text-muted text-right font-medium tabular-nums">
                      {star}
                    </span>
                    <span aria-hidden className="bg-wash h-2 overflow-hidden rounded-full">
                      <span
                        className="block h-full rounded-full bg-amber-500"
                        style={{ width: `${(n / count) * 100}%` }}
                      />
                    </span>
                    <span aria-hidden className="text-muted text-right tabular-nums">
                      {n}
                    </span>
                  </li>
                )
              })}
            </ul>
            <div className="mt-5 sm:hidden">
              <ReviewForm slug={slug} productName={productName} variant="quiet" />
            </div>
          </div>

          <div className="min-w-0">
            <ul className="divide-line divide-y">
              {(reviews.data ?? []).map((review) => (
                <ReviewItem
                  key={review.id}
                  review={review}
                  locale={locale}
                  starsLabel={t('starsLabel', { rating: review.rating })}
                  replyLabel={t('sellerReply', { business: businessName })}
                />
              ))}
            </ul>
            <ReviewMore
              slug={slug}
              total={count}
              pageSize={REVIEWS_PAGE_SIZE}
              businessName={businessName}
            />
          </div>
        </div>
      )}
    </section>
  )
}
