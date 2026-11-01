import { BRAND_NAME } from '@repo/i18n'
import { cn } from '@repo/ui/cn'

/**
 * Sudut Desa mark: the corner of a rubber-stamp frame (heavy L + thin inner L, the stamp's double
 * frame) and one dot in the opposite corner — a village found in its corner. Pure geometry so it
 * stays crisp from a 16px favicon to a banner. Drawn in currentColor. Spec: docs/brand/README.md.
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

/** Mark + wordmark, set in the printed face. */
export function Logo({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const mark = size === 'lg' ? 44 : size === 'md' ? 28 : 22
  return (
    <span
      className={cn(
        'text-accent inline-flex items-center gap-2',
        size === 'lg' && 'gap-3',
        className,
      )}
    >
      <LogoMark size={mark} />
      <span
        className={cn(
          'font-print leading-none font-bold tracking-[0.02em] uppercase',
          size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-2xl' : 'text-xl',
        )}
      >
        {BRAND_NAME}
      </span>
    </span>
  )
}

/** The brand pressed as a rubber stamp (footer, print, social). */
export function LogoStamp({ tagline, className }: { tagline: string; className?: string }) {
  return (
    <span
      className={cn(
        'text-accent inline-flex -rotate-3 items-center gap-3 border-[3px] border-current px-4 py-2.5 mix-blend-multiply outline-[1.5px] outline-offset-[3px] outline-current',
        className,
      )}
    >
      <LogoMark size={36} />
      <span className="font-print leading-none font-bold uppercase">
        <span className="block text-3xl tracking-[0.02em]">{BRAND_NAME}</span>
        <span className="mt-1 block text-xs tracking-[0.2em]">{tagline}</span>
      </span>
    </span>
  )
}
