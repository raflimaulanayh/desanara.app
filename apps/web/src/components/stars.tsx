import { cn } from '@repo/ui/cn'
import { Star } from 'lucide-react'

/**
 * Five stars filled to `value` (halves and tenths shown as a partial fill). Decorative: callers give the
 * accessible text, for example "4 out of 5 stars".
 */
export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span aria-hidden className={cn('inline-flex items-center gap-0.5', className)}>
      {[0, 1, 2, 3, 4].map((index) => {
        const fill = Number.isFinite(value) ? Math.max(0, Math.min(1, value - index)) : 0
        return (
          <span key={index} className="relative inline-block size-[1em]">
            <Star className="text-line-strong absolute inset-0 size-full fill-current" />
            {fill > 0 ? (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star className="size-[1em] fill-amber-500 text-amber-500" />
              </span>
            ) : null}
          </span>
        )
      })}
    </span>
  )
}
