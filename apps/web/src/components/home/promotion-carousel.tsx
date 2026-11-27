'use client'

import { Button } from '@heroui/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useId, useRef, useState, type ReactNode } from 'react'

const control = 'text-accent min-w-0 size-9 rounded-full bg-accent/8 p-0 disabled:opacity-40'

function slideWidth(list: HTMLUListElement) {
  const [first, second] = list.children
  return first instanceof HTMLElement && second instanceof HTMLElement
    ? second.offsetLeft - first.offsetLeft
    : list.clientWidth
}

export function PromotionCarousel({ children, count }: { children: ReactNode; count: number }) {
  const t = useTranslations('home.promotions')
  const titleId = useId()
  const listId = useId()
  const rail = useRef<HTMLUListElement>(null)
  const [active, setActive] = useState(0)

  function move(direction: -1 | 1) {
    const list = rail.current
    if (!list) return
    list.scrollTo({ left: (active + direction) * slideWidth(list) })
  }

  return (
    <div>
      <div className="mb-2 flex min-h-9 items-center justify-between gap-3">
        <h2 id={titleId} className="section-title">
          {t('title')}
        </h2>
        {count > 1 ? (
          <div className="flex shrink-0 gap-1">
            <Button
              size="sm"
              variant="ghost"
              isIconOnly
              isDisabled={active === 0}
              aria-label={t('previous')}
              aria-controls={listId}
              onPress={() => move(-1)}
              className={control}
            >
              <ChevronLeft className="size-4" aria-hidden />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              isIconOnly
              isDisabled={active === count - 1}
              aria-label={t('next')}
              aria-controls={listId}
              onPress={() => move(1)}
              className={control}
            >
              <ChevronRight className="size-4" aria-hidden />
            </Button>
          </div>
        ) : null}
      </div>
      <ul
        id={listId}
        ref={rail}
        aria-labelledby={titleId}
        onScroll={({ currentTarget }) => {
          const step = slideWidth(currentTarget)
          if (step) setActive(Math.round(currentTarget.scrollLeft / step))
        }}
        className="relative flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-smooth motion-reduce:scroll-auto [&>li]:w-full [&>li]:shrink-0 [&>li]:snap-start"
      >
        {children}
      </ul>
      {count > 1 ? (
        <p role="status" className="sr-only">
          {t('position', { current: active + 1, count })}
        </p>
      ) : null}
    </div>
  )
}
