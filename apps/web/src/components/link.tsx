import type { ReactNode } from 'react'
import { Link } from '@/i18n/navigation'

/** Locale-aware link usable where a component takes a link renderer (e.g. NotaRow). */
export function LocaleLink({
  href,
  className,
  children,
}: {
  href: string
  className?: string
  children: ReactNode
}) {
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}
