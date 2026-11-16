import { cn } from '@repo/ui/cn'
import Image from 'next/image'

/** Desanara wordmark and mark (copies of apps/web/public/brand; masters in docs/brand). */
export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/desanara-logo.svg"
      width={124}
      height={25}
      alt="Desanara"
      unoptimized
      priority
      className={cn('h-6 w-auto', className)}
    />
  )
}

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <Image
      src="/brand/desanara-mark.svg"
      width={size}
      height={size}
      alt=""
      aria-hidden
      unoptimized
    />
  )
}
