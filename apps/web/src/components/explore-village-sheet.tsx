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
  actions,
}: {
  title: string
  label: string
  count: ReactNode
  closeHref: string
  children: ReactNode
  footer: ReactNode
  /** Sits at the end of the header row, level with the village name (the slider buttons). */
  actions?: ReactNode
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
            <Sheet.Header className="mx-auto flex w-full max-w-lg flex-row items-center gap-3 px-4 pt-0 pb-1">
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <Sheet.Heading className="truncate text-base leading-tight font-bold sm:text-lg">
                  {title}
                </Sheet.Heading>
                <p className="text-muted text-xs font-medium">{count}</p>
              </div>
              {actions}
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
