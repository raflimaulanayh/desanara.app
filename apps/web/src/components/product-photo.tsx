import { cn } from '@repo/ui/cn'
import Image from 'next/image'
import { CategoryIcon } from '@/lib/category-icons'

/**
 * Product picture. Many products have no photo yet, so the fallback is a tinted tile in the
 * village's colour with the category icon: it reads as intentional, not as a broken image.
 */
export function ProductPhoto({
  src,
  alt,
  category,
  className,
  sizes = '(min-width: 1024px) 25vw, 50vw',
  priority,
}: {
  src: string | null
  alt: string
  category?: string | null
  className?: string
  sizes?: string
  priority?: boolean
}) {
  if (src) {
    return (
      <div className={cn('bg-wash relative aspect-square overflow-hidden', className)}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
    )
  }
  return (
    <div
      role={alt ? 'img' : undefined}
      aria-label={alt || undefined}
      className={cn(
        'bg-accent-soft text-accent-soft-foreground relative grid aspect-square place-items-center overflow-hidden',
        className,
      )}
    >
      <CategoryIcon slug={category} className="size-1/3 opacity-60" strokeWidth={1.5} aria-hidden />
    </div>
  )
}
