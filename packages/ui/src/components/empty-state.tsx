import type { ReactNode } from 'react'
import { cn } from '../cn'

/** Neutral empty/placeholder block used by every app. Copy is passed in (i18n stays in apps). */
export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'border-border flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-12 text-center',
        className,
      )}
    >
      <p className="text-foreground text-base font-semibold">{title}</p>
      {description ? <p className="text-muted max-w-md text-sm">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}
