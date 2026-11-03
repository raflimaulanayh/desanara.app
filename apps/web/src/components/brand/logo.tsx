import { BRAND_NAME } from '@repo/i18n'
import { cn } from '@repo/ui/cn'

/**
 * Sudut Desa mark: the corner of a frame (heavy L + thin inner L) and one dot in the opposite
 * corner — a village found in its corner. Pure geometry, drawn in currentColor. Spec: docs/brand/README.md.
 */
export function LogoMark({
  size = 32,
  className,
  title,
}: {
  size?: number
  className?: string
  title?: string
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={cn('shrink-0', className)}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      fill="none"
    >
      <path d="M5 33V5h28" stroke="currentColor" strokeWidth="7" strokeLinecap="square" />
      <path d="M15.5 33V15.5H33" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" />
      <circle cx="35" cy="35" r="7" fill="currentColor" />
    </svg>
  )
}

/** Mark + wordmark. */
export function Logo({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const mark = size === 'lg' ? 40 : size === 'md' ? 28 : 22
  return (
    <span className={cn('text-accent inline-flex items-center gap-2', className)}>
      <LogoMark size={mark} />
      <span
        className={cn(
          'leading-none font-extrabold tracking-tight',
          size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-xl' : 'text-lg',
        )}
      >
        {BRAND_NAME}
      </span>
    </span>
  )
}
