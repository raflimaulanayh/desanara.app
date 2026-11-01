import { cn } from '@repo/ui/cn'
import Image from 'next/image'
import { VillageSeal } from './seal'

/**
 * The product's picture. Most village products have no photo yet; instead of a big placeholder that
 * repeats the title (and pushes the order nota down on phones), we print a slim label strip:
 * village seal, "photo coming", and the product kind as a nota field.
 */
export function ProductPlate({
  imageUrl,
  alt,
  category,
  categoryLabel,
  village,
  pendingLabel,
  className,
}: {
  imageUrl: string | null
  alt: string
  category: string | null
  categoryLabel: string
  village: { name: string; region?: string | null; logoUrl: string | null }
  pendingLabel: string
  className?: string
}) {
  if (imageUrl) {
    return (
      <div className={cn('bg-nota-blue relative aspect-[4/3] overflow-hidden', className)}>
        <Image
          src={imageUrl}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
    )
  }
  return (
    <div
      className={cn(
        'bg-nota-yellow flex items-center gap-4 border border-[color-mix(in_oklab,var(--nota-yellow)_55%,var(--warning))] px-4 py-3',
        className,
      )}
    >
      <span className="text-accent">
        <VillageSeal
          name={village.name}
          region={village.region}
          logoUrl={village.logoUrl}
          size={72}
          rotate={-10}
        />
      </span>
      <div className="min-w-0 text-sm">
        <p className="font-print text-foreground text-base font-semibold tracking-[0.06em] uppercase">
          {pendingLabel}
        </p>
        {category ? (
          <p className="text-muted mt-0.5">
            {categoryLabel}: <span className="text-foreground">{category}</span>
          </p>
        ) : null}
      </div>
    </div>
  )
}
