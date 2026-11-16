import { formatRupiah } from '@repo/i18n'
import { discountPercent } from '@repo/validators'
import { useLocale, useTranslations } from 'next-intl'
import { asLocale } from '@/lib/localize'

/**
 * Selling price with the e-commerce conventions: "Gratis" when the price is 0, the normal price
 * struck through when there is one, and an optional "-20%" pill. Works in server and client
 * components (no async, no state).
 */
export function Price({
  price,
  compareAtPrice,
  className,
  strikeClassName = 'text-sm',
  showBadge = false,
}: {
  price: number
  compareAtPrice: number | null
  className?: string
  strikeClassName?: string
  showBadge?: boolean
}) {
  const t = useTranslations('product')
  const locale = asLocale(useLocale())
  const pct = discountPercent(price, compareAtPrice)
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className={className}>{price === 0 ? t('free') : formatRupiah(price, locale)}</span>
      {compareAtPrice ? (
        <s className={`text-muted font-normal tabular-nums ${strikeClassName}`}>
          <span className="sr-only">{t('normalPrice')} </span>
          {formatRupiah(compareAtPrice, locale)}
        </s>
      ) : null}
      {/* A free price already reads "Gratis"; the pill is only for a discount here. */}
      {showBadge && price !== 0 ? (
        <PromoBadge price={price} compareAtPrice={compareAtPrice} pct={pct} />
      ) : null}
    </span>
  )
}

/** "Gratis" / "-20%" pill in the `sun` highlight (dark text, 8.3:1). Nothing when there is no promo. */
export function PromoBadge({
  price,
  compareAtPrice,
  pct = discountPercent(price, compareAtPrice),
  className = '',
}: {
  price: number
  compareAtPrice: number | null
  pct?: number | null
  className?: string
}) {
  const t = useTranslations('product')
  if (price !== 0 && pct === null) return null
  return (
    <span
      className={`bg-sun text-foreground rounded-full px-2.5 py-1 text-xs leading-none font-bold ${className}`}
    >
      {price === 0 ? t('free') : t('off', { pct: pct ?? 0 })}
    </span>
  )
}
