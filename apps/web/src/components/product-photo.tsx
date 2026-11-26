import { cn } from '@repo/ui/cn'
import Image from 'next/image'
import { CategoryIcon } from '@/lib/category-icons'

/** Product photos and their category placeholders share the same frame. */
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
  const frame = 'relative aspect-square overflow-hidden'
  if (src) {
    return (
      <div className={cn(frame, 'bg-wash', className)}>
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
        frame,
        'bg-accent/4 text-accent-soft-foreground grid place-items-center',
        className,
      )}
    >
      <span
        aria-hidden
        className="bg-accent/8 ring-accent/12 grid aspect-square w-[clamp(1.25rem,40%,3.25rem)] place-items-center rounded-(--radius-compact) ring-1 ring-inset"
      >
        <CategoryIcon slug={category} className="size-1/2" strokeWidth={1.75} />
      </span>
    </div>
  )
}
