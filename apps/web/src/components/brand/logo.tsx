import { BRAND_NAME } from '@repo/i18n'
import { cn } from '@repo/ui/cn'
import Image from 'next/image'

/**
 * Desanara logo. Vector masters (text outlined, one path per letter and leaf, for motion) live in
 * docs/brand/desanara/; the files served here are copies. Spec: docs/brand/README.md.
 * SVGs are served as-is (`unoptimized`): they are static, tiny and scale without loss.
 */
const LOGO_RATIO = 406.14 / 134
const MARK_RATIO = 113.36 / 134
const VERTICAL_RATIO = 275.43 / 200.13

/** The leaf "d" mark. `size` is its height. */
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
      width={Math.round(size * MARK_RATIO)}
      height={size}
      alt={title ?? ''}
      aria-hidden={title ? undefined : true}
      unoptimized
      className={cn('shrink-0', className)}
    />
  )
}

/** Horizontal logo (mark + wordmark). `tone="white"` for dark or green backgrounds. */
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
  // The mark is tall, so the lockup needs more height than a text-only logo to keep the wordmark legible.
  const height = size === 'lg' ? 56 : size === 'md' ? 44 : 32
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

/** Vertical logo with tagline (mark above wordmark). `width` in px; for splash-style hero moments. */
export function LogoVertical({ width = 176, className }: { width?: number; className?: string }) {
  return (
    <Image
      src="/brand/desanara-logo-vertical.svg"
      width={width}
      height={Math.round(width / VERTICAL_RATIO)}
      alt={BRAND_NAME}
      unoptimized
      className={cn('shrink-0', className)}
    />
  )
}
