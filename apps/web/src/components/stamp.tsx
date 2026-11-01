import { cn } from '@repo/ui/cn'
import type { ReactNode } from 'react'

const TONES = {
  accent: 'text-accent',
  demo: 'text-stamp-demo',
  muted: 'text-muted',
  success: 'text-success',
} as const

/**
 * Rectangular rubber stamp. States and claims are *printed* on the nota (BUKA, TERVERIFIKASI,
 * DATA DEMO) instead of floating as chips — a stamp is how this world states a fact.
 */
export function Stamp({
  children,
  tone = 'accent',
  rotate = -3,
  size = 'md',
  className,
  title,
}: {
  children: ReactNode
  tone?: keyof typeof TONES
  rotate?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
  title?: string
}) {
  return (
    <span
      title={title}
      className={cn(
        'font-print inline-flex items-center gap-1.5 border-2 border-current whitespace-nowrap uppercase mix-blend-multiply select-none',
        'outline-1 outline-offset-2 outline-current',
        size === 'sm' && 'px-1.5 py-0 text-xs leading-5 font-semibold tracking-[0.12em]',
        size === 'md' && 'px-2 py-0.5 text-xs leading-5 font-bold tracking-[0.14em]',
        size === 'lg' && 'px-3 py-1 text-base leading-6 font-bold tracking-[0.16em]',
        TONES[tone],
        className,
      )}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </span>
  )
}
