'use client'

import { Sheet } from '@heroui/react'
import type { ReactNode } from 'react'
import { useRouter } from '@/i18n/navigation'

export function ExploreVillageSheet({
  title,
  label,
  count,
  closeHref,
  children,
  footer,
}: {
  title: string
  label: string
  count: string
  closeHref: string
  children: ReactNode
  footer: ReactNode
}) {
  const router = useRouter()

  return (
    <Sheet
      placement="bottom"
      defaultOpen
      onClose={() => router.replace(closeHref, { scroll: false })}
    >
      <Sheet.Backdrop variant="transparent">
        <Sheet.Content className="rounded-t-(--radius)">
          <Sheet.Dialog
            aria-label={label}
            className="explore-map-details border-line bg-surface max-h-[58dvh] rounded-t-(--radius) border-t"
          >
            <Sheet.Handle aria-hidden className="py-2.5" />
            <Sheet.Header className="mx-auto w-full max-w-lg gap-0.5 px-4 pt-0 pb-1">
              <Sheet.Heading className="text-base leading-tight font-bold sm:text-lg">
                {title}
              </Sheet.Heading>
              <p className="text-muted text-xs font-medium">{count}</p>
            </Sheet.Header>
            <Sheet.Body className="mx-auto w-full max-w-lg px-4 py-0">{children}</Sheet.Body>
            <Sheet.Footer className="mx-auto w-full max-w-lg px-4 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              {footer}
            </Sheet.Footer>
          </Sheet.Dialog>
        </Sheet.Content>
      </Sheet.Backdrop>
    </Sheet>
  )
}
