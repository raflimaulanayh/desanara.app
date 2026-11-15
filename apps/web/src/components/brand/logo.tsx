import { BRAND_NAME } from '@repo/i18n'
import { cn } from '@repo/ui/cn'
import Image from 'next/image'

/**
 * Desanara logo. Vector masters (one path per letter/element, for motion) live in
 * docs/brand/desanara/; the files served here are copies. Spec: docs/brand/README.md.
 * SVGs are served as-is (`unoptimized`): they are static, tiny and scale without loss.
 */
const LOGO_RATIO = 1153 / 231.8

/** The "d" mark: rice fields and a hill inside the d. */
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
    <Image
      src="/brand/desanara-mark.svg"
      width={size}
      height={size}
      alt={title ?? ''}
      aria-hidden={title ? undefined : true}
      unoptimized
      className={cn('shrink-0', className)}
    />
  )
}

/** Horizontal wordmark. `tone="white"` for dark or green backgrounds. */
export function Logo({
  size = 'md',
  tone = 'color',
  priority = false,
  className,
}: {
  size?: 'sm' | 'md' | 'lg'
  tone?: 'color' | 'white'
  priority?: boolean
  className?: string
}) {
  const height = size === 'lg' ? 40 : size === 'md' ? 30 : 22
  return (
    <Image
      src={tone === 'white' ? '/brand/desanara-logo-white.svg' : '/brand/desanara-logo.svg'}
      width={Math.round(height * LOGO_RATIO)}
      height={height}
      alt={BRAND_NAME}
      priority={priority}
      unoptimized
      className={cn('shrink-0', className)}
    />
  )
}
