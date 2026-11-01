import { cn } from '@repo/ui/cn'
import type { ReactNode } from 'react'

/**
 * The order-book page: white paper, printed navy header, blue rules between lines.
 * Column heads are printed in condensed caps; numbers are tabular so prices line up.
 */
export function NotaSheet({
  title,
  aside,
  head,
  children,
  footer,
  className,
}: {
  title?: ReactNode
  aside?: ReactNode
  head?: [string, string, string]
  children: ReactNode
  /** Printed foot of the page (stamps, totals). */
  footer?: ReactNode
  className?: string
}) {
  return (
    <section className={cn('bg-surface border-nota-rule-strong border', className)}>
      {title ? (
        <header className="border-nota-ink flex items-end justify-between gap-4 border-b-[3px] border-double px-4 pt-4 pb-2 sm:px-6">
          <h2 className="font-print text-nota-ink text-2xl leading-none font-bold tracking-[0.02em] uppercase sm:text-3xl">
            {title}
          </h2>
          {aside ? <div className="text-muted shrink-0 text-sm">{aside}</div> : null}
        </header>
      ) : null}
      {head ? (
        <div
          aria-hidden
          className="font-print text-nota-ink border-nota-rule-strong grid grid-cols-[1fr_auto] gap-4 border-b px-4 py-1.5 text-xs font-semibold tracking-[0.16em] uppercase sm:grid-cols-[1fr_9rem_8rem] sm:px-6"
        >
          <span>{head[0]}</span>
          <span className="hidden sm:block">{head[1]}</span>
          <span className="text-right">{head[2]}</span>
        </div>
      ) : null}
      <ol className="divide-nota-rule divide-y">{children}</ol>
      {footer ? (
        <footer className="border-nota-ink border-t-[3px] border-double px-4 py-5 sm:px-6">
          {footer}
        </footer>
      ) : null}
    </section>
  )
}

export function NotaRow({
  href,
  name,
  meta,
  unit,
  price,
  marker,
  stamp,
  linkComponent: LinkComponent,
}: {
  href: string
  name: string
  meta?: ReactNode
  unit?: string | null
  price: string
  /** Village ink dot shown before the name on cross-village lists. */
  marker?: string
  stamp?: ReactNode
  linkComponent: (props: { href: string; className?: string; children: ReactNode }) => ReactNode
}) {
  return (
    <li>
      <LinkComponent
        href={href}
        className="group hover:bg-nota-blue focus-visible:bg-nota-blue grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-0.5 px-4 py-3 transition-colors duration-150 sm:grid-cols-[1fr_9rem_8rem] sm:px-6"
      >
        <span className="min-w-0">
          <span className="flex items-baseline gap-2">
            {marker ? (
              <span
                aria-hidden
                className="size-2.5 shrink-0 translate-y-[-0.05em] rounded-full"
                style={{ background: marker }}
              />
            ) : null}
            <span className="text-foreground text-base leading-snug font-semibold group-hover:underline">
              {name}
            </span>
            {stamp}
          </span>
          {meta ? <span className="text-muted mt-0.5 block text-sm">{meta}</span> : null}
          {unit ? <span className="text-muted block text-sm sm:hidden">{unit}</span> : null}
        </span>
        <span className="text-muted hidden text-sm sm:block">{unit}</span>
        <span className="font-print text-foreground text-right text-lg font-semibold tabular-nums">
          {price}
        </span>
      </LinkComponent>
    </li>
  )
}
