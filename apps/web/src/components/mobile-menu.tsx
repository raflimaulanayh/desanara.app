'use client'

import { Button, Drawer } from '@heroui/react'
import { Menu } from 'lucide-react'
import { type ReactNode, useState } from 'react'

export function MobileMenu({
  openLabel,
  closeLabel,
  children,
}: {
  openLabel: string
  closeLabel: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <Drawer isOpen={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="sm"
        isIconOnly
        aria-label={openLabel}
        className="-ml-1 size-10 rounded-full lg:hidden"
      >
        <Menu className="size-5" aria-hidden />
      </Button>
      <Drawer.Backdrop>
        <Drawer.Content placement="left">
          <Drawer.Dialog className="bg-surface w-[min(18rem,85vw)] p-0 pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)]">
            <Drawer.Header className="border-line flex-row items-center justify-between gap-2 border-b px-4 py-2.5">
              <Drawer.Heading className="text-base font-bold">{openLabel}</Drawer.Heading>
              <Drawer.CloseTrigger aria-label={closeLabel} className="relative inset-auto size-8" />
            </Drawer.Header>
            <Drawer.Body
              className="p-3"
              onClick={(event) => {
                if (event.target instanceof Element && event.target.closest('a')) setOpen(false)
              }}
            >
              {children}
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  )
}
