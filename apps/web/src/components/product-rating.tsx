import { cn } from '@repo/ui/cn'
import { Star } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'

/**
 * Compact rating for cards and the product header: one star, the average and the review count from
 * approved buyer reviews (PLAN-product-reviews). Renders nothing until a product has a review.
 */
export async function ProductRating({
  average,
  count,
  className,
  showCount = true,
}: {
  average: number | null
  count: number
  className?: string
  showCount?: boolean
}) {
  // Older API responses (or other endpoints) may omit the fields entirely.
  if (average == null || !Number.isFinite(average) || !count) return null
  const [t, locale] = await Promise.all([getTranslations('product'), getLocale()])
  const formatted = new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'id-ID', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(average)
  return (
    <span
      className={cn(
        'text-foreground inline-flex items-center gap-1 text-xs font-semibold',
        className,
      )}
      aria-label={t('ratingLabel', { rating: formatted, count })}
    >
      <Star className="size-3.5 shrink-0 fill-amber-500 text-amber-500" aria-hidden />
      <span aria-hidden>{formatted}</span>
      {showCount ? (
        <span aria-hidden className="text-muted font-medium">
          ({count})
        </span>
      ) : null}
    </span>
  )
}
