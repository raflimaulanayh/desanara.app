import type { ReactNode } from 'react'
import { cn } from '../cn'

/** Shared panel for empty and unavailable content. Apps supply their own localized copy. */
export function EmptyState({
  title,
  description,
  action,
  illustration,
  className,
}: {
  title: string
  description?: string
  action?: ReactNode
  illustration?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'border-line bg-surface flex flex-col items-center gap-2 rounded-(--radius) border px-4 py-7 text-center sm:py-10',
        className,
      )}
    >
      {illustration ? <span aria-hidden>{illustration}</span> : null}
      <p className="text-foreground text-base font-semibold">{title}</p>
      {description ? <p className="text-muted max-w-md text-sm">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}
