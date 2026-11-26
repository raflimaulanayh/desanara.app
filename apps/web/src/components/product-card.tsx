import { cn } from '@repo/ui/cn'
import { SkeletonBlock } from '@repo/ui/components/loading-region'
import { ArrowRight, MapPin } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { ProductSummary } from '@/lib/data'
import { pick } from '@/lib/localize'
import { mediaUrl } from '@/lib/media'
import { Price, PromoBadge } from './price'
import { ProductPhoto } from './product-photo'

const cardFrame =
  'border-line bg-surface flex h-full flex-col overflow-hidden rounded-(--radius) border'
const rowFrame = 'max-sm:flex-row max-sm:gap-1 max-sm:p-1.5'
const photoFrame = 'relative overflow-hidden'
const rowPhotoFrame = 'max-sm:w-[36%] max-sm:shrink-0 max-sm:rounded-(--radius-compact)'
const photoShape = 'product-card-photo aspect-square'
const rowPhotoShape = 'max-sm:aspect-[4/3] max-sm:h-full max-sm:w-full'
const cardContent = 'flex min-w-0 flex-1 flex-col gap-1.5 px-3 py-2.5 sm:px-4 sm:py-3'

function productGridLayout(mobileList: boolean) {
  return cn(
    'grid gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4',
    mobileList ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2',
  )
}

/** Marketplace card: photo, name, price, and where it comes from (the village is the differentiator). */
export async function ProductCard({
  product: p,
  showVillage = true,
  showSeller = true,
  mobileList = false,
  preview = false,
  priority,
}: {
  product: ProductSummary
  showVillage?: boolean
  showSeller?: boolean
  mobileList?: boolean
  preview?: boolean
  priority?: boolean
}) {
  const [locale, t] = await Promise.all([getLocale(), getTranslations('product')])
  const name = pick(locale, p.name, p.nameEn)
  return (
    <Link
      href={`/produk/${p.slug}`}
      className={cn(
        'group hover:border-accent transition-colors',
        cardFrame,
        mobileList && rowFrame,
      )}
    >
      <div className={cn(photoFrame, mobileList && rowPhotoFrame)}>
        <ProductPhoto
          src={mediaUrl(p.imageKey, preview)}
          alt=""
          category={p.category?.slug}
          priority={priority}
          sizes={mobileList ? '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 36vw' : undefined}
          className={cn(
            photoShape,
            'motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.03]',
            mobileList && rowPhotoShape,
          )}
        />
        {!p.isAvailable ? (
          <span className="bg-foreground/80 absolute top-2 left-2 rounded-full px-2.5 py-1 text-xs font-semibold text-white">
            {t('unavailable')}
          </span>
        ) : null}
        <PromoBadge
          price={p.price}
          compareAtPrice={p.compareAtPrice}
          className="absolute top-2 right-2"
        />
      </div>
      <div className={cardContent}>
        <h3 className="line-clamp-2 text-base leading-snug font-bold tracking-tight wrap-break-word">
          {name}
        </h3>
        {showVillage ? (
          <p className="text-muted flex items-start gap-1 text-xs leading-snug font-semibold sm:text-sm">
            <MapPin className="text-accent mt-px size-3.5 shrink-0" aria-hidden />
            <span className="min-w-0 wrap-break-word">{p.village.name}</span>
          </p>
        ) : null}
        {showSeller ? (
          <p className="text-muted truncate text-xs leading-relaxed sm:text-sm">
            {p.business.name}
          </p>
        ) : null}
        <div className="mt-auto flex items-baseline justify-between gap-1 pt-0.5">
          <p className="min-w-0 wrap-break-word">
            <Price
              price={p.price}
              compareAtPrice={p.compareAtPrice}
              className="product-card-price text-base font-bold tabular-nums"
              strikeClassName="text-xs"
            />
          </p>
          <ArrowRight className="text-accent size-4 shrink-0 self-end sm:size-5" aria-hidden />
        </div>
      </div>
    </Link>
  )
}

export async function ProductGrid({
  products,
  showVillage = true,
  showSeller = true,
  mobileList = false,
  preview = false,
}: {
  products: ProductSummary[]
  showVillage?: boolean
  showSeller?: boolean
  mobileList?: boolean
  preview?: boolean
}) {
  return (
    <ul className={productGridLayout(mobileList)}>
      {products.map((p, i) => (
        <li key={p.id}>
          <ProductCard
            product={p}
            showVillage={showVillage}
            showSeller={showSeller}
            mobileList={mobileList}
            preview={preview}
            priority={i < 2}
          />
        </li>
      ))}
    </ul>
  )
}

export function ProductGridSkeleton({
  mobileList = false,
  showSeller = true,
  showVillage = true,
}: {
  mobileList?: boolean
  showSeller?: boolean
  showVillage?: boolean
}) {
  return (
    <ul className={productGridLayout(mobileList)}>
      {[0, 1, 2, 3].map((index) => (
        <li key={index} className={cn(cardFrame, mobileList && rowFrame)}>
          <div className={cn(photoFrame, mobileList && rowPhotoFrame)}>
            <SkeletonBlock
              className={cn(photoShape, 'rounded-none', mobileList && rowPhotoShape)}
            />
          </div>
          <div className={cardContent}>
            <SkeletonBlock className="h-[1.375rem] w-4/5" />
            {showVillage ? <SkeletonBlock className="h-4 w-3/5 sm:h-5" /> : null}
            {showSeller ? <SkeletonBlock className="h-[1.25rem] w-1/2 sm:h-[1.375rem]" /> : null}
            <div className="mt-auto pt-0.5">
              <SkeletonBlock className="h-6 w-2/5" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
