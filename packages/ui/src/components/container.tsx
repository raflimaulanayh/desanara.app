import type { ReactNode } from 'react'
import { cn } from '../cn'

/** Page width + side gutters (16px on phones). */
export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-6xl px-4 sm:px-6', className)}>{children}</div>
}
