import { Skeleton } from '@heroui/react'
import type { ReactNode } from 'react'

export function SkeletonBlock({ className }: { className: string }) {
  return <Skeleton animationType="none" className={className} />
}

export function LoadingRegion({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div role="status" className={className}>
      <span className="sr-only">{label}</span>
      <div aria-hidden className="contents">
        {children}
      </div>
    </div>
  )
}
