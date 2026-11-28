import { Star } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export async function ProductRating({ isSeed, slug }: { isSeed: boolean; slug: string }) {
  const t = await getTranslations('product')
  if (!isSeed) return <span className="text-muted text-xs">{t('noRating')}</span>

  const value = 4.6 + (Array.from(slug).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 4) / 10
  const formatted = value.toFixed(1)
  return (
    <span
      className="text-foreground inline-flex items-center gap-1 text-xs font-semibold"
      aria-label={t('ratingLabel', { rating: formatted })}
    >
      <Star className="size-3.5 fill-amber-500 text-amber-500" aria-hidden />
      {formatted}
    </span>
  )
}
