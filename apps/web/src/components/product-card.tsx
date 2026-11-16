import { MapPin } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { ProductSummary } from '@/lib/data'
import { pick } from '@/lib/localize'
import { mediaUrl } from '@/lib/media'
import { Price, PromoBadge } from './price'
import { ProductPhoto } from './product-photo'

/** Marketplace card: photo, name, price, and where it comes from (the village is the differentiator). */
export async function ProductCard({
  product: p,
  showVillage = true,
  priority,
}: {
  product: ProductSummary
  showVillage?: boolean
  priority?: boolean
}) {
  const [locale, t] = await Promise.all([getLocale(), getTranslations('product')])
  const name = pick(locale, p.name, p.nameEn)
  return (
    <Link
      href={`/produk/${p.slug}`}
      className="group border-line bg-surface flex h-full flex-col overflow-hidden rounded-(--radius) border transition-shadow hover:shadow-md"
    >
      <div className="relative">
        <ProductPhoto
          src={mediaUrl(p.imageKey)}
          alt={name}
          category={p.category?.slug}
          priority={priority}
          className="transition-transform duration-300 group-hover:scale-[1.03]"
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
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm leading-snug font-medium sm:text-base">{name}</h3>
        <p className="mt-auto pt-1">
          <Price
            price={p.price}
            compareAtPrice={p.compareAtPrice}
            className="text-base font-extrabold tabular-nums sm:text-lg"
            strikeClassName="text-xs"
          />
        </p>
        <p className="text-muted flex items-center gap-1 text-xs">
          <MapPin className="size-3.5 shrink-0" style={{ color: p.village.accent }} aria-hidden />
          <span className="truncate">
            {showVillage ? `${p.village.name} · ${p.business.name}` : p.business.name}
          </span>
        </p>
      </div>
    </Link>
  )
}

export async function ProductGrid({
  products,
  showVillage = true,
}: {
  products: ProductSummary[]
  showVillage?: boolean
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p, i) => (
        <li key={p.id}>
          <ProductCard product={p} showVillage={showVillage} priority={i < 4} />
        </li>
      ))}
    </ul>
  )
}
