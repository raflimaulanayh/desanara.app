import { cn } from '@repo/ui/cn'
import type { ReactNode } from 'react'

/**
 * "Kop nota": the printed letterhead at the top of a shop's order book. Business name in the
 * village's display face, owner and address on the line below, closed by a double rule.
 */
export function Kop({
  name,
  lines,
  stamps,
  actions,
  size = 'md',
  as: Heading = 'h2',
  className,
}: {
  name: ReactNode
  lines?: ReactNode[]
  stamps?: ReactNode
  actions?: ReactNode
  size?: 'md' | 'lg'
  as?: 'h1' | 'h2' | 'h3'
  className?: string
}) {
  return (
    <div className={cn('border-accent border-b-[5px] border-double pb-3', className)}>
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <Heading
            className={cn(
              'font-village text-accent leading-[0.95] font-bold tracking-[-0.01em] text-balance uppercase',
              size === 'lg'
                ? 'text-[clamp(2.4rem,8vw,4.75rem)]'
                : 'text-[clamp(1.6rem,5vw,2.25rem)]',
            )}
          >
            {name}
          </Heading>
          {lines?.length ? (
            <p className="text-muted mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-sm">
              {lines.map((line, i) => (
                <span key={i} className="inline-flex items-center gap-1.5">
                  {line}
                </span>
              ))}
            </p>
          ) : null}
        </div>
        {stamps ? <div className="flex flex-wrap items-center gap-3 pt-1">{stamps}</div> : null}
      </div>
      {actions ? <div className="mt-4 flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}
