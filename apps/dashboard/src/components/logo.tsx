import { cn } from '@repo/ui/cn'
import Image from 'next/image'

/** Desanara logo and mark (copies of apps/web/public/brand; masters in docs/brand). */
export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/desanara-logo.svg"
      width={133}
      height={44}
      alt="Desanara"
      unoptimized
      priority
      className={cn('h-10 w-auto', className)}
    />
  )
}

/** The leaf "d" mark; `size` is its height. */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <Image
      src="/brand/desanara-mark.svg"
      width={Math.round((size * 113.36) / 134)}
      height={size}
      alt=""
      aria-hidden
      unoptimized
    />
  )
}
