'use client'

import { Button } from '@heroui/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'

interface SliderState {
  rail: RefObject<HTMLUListElement | null>
  position: { start: boolean; end: boolean }
  setPosition: (position: { start: boolean; end: boolean }) => void
}

const SliderContext = createContext<SliderState | null>(null)

function useSlider() {
  const slider = useContext(SliderContext)
  if (!slider) throw new Error('ExploreBusinessSlider parts must sit inside ExploreBusinessSlider')
  return slider
}

/**
 * Shares the business rail between its controls and the list, so the previous and next buttons can sit
 * in the sheet header next to the village name while the rail stays in the body.
 */
export function ExploreBusinessSlider({ children }: { children: ReactNode }) {
  const rail = useRef<HTMLUListElement>(null)
  const [position, setPosition] = useState({ start: true, end: true })
  return (
    <SliderContext.Provider value={{ rail, position, setPosition }}>
      {children}
    </SliderContext.Provider>
  )
}

export function ExploreBusinessSliderControls() {
  const t = useTranslations('explore.map')
  const { rail, position } = useSlider()

  function slide(direction: -1 | 1) {
    const list = rail.current
    if (!list) return
    const [first, next] = list.children
    if (!first || !next) return
    const step = next.getBoundingClientRect().left - first.getBoundingClientRect().left
    list.scrollBy({
      left: direction * step,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    })
  }

  const control = 'text-accent min-w-0 size-9 rounded-full bg-accent/8 p-0 disabled:opacity-40'
  return (
    <div className="flex shrink-0 gap-1">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        isIconOnly
        isDisabled={position.start}
        aria-label={t('previousBusiness')}
        onPress={() => slide(-1)}
        className={control}
      >
        <ChevronLeft className="size-4" aria-hidden />
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        isIconOnly
        isDisabled={position.end}
        aria-label={t('nextBusiness')}
        onPress={() => slide(1)}
        className={control}
      >
        <ChevronRight className="size-4" aria-hidden />
      </Button>
    </div>
  )
}

export function ExploreBusinessSliderRail({
  children,
  locationNote,
}: {
  children: ReactNode
  locationNote?: string
}) {
  const t = useTranslations('explore.map')
  const { rail, setPosition } = useSlider()

  useEffect(() => {
    const list = rail.current
    if (!list) return
    function update() {
      if (list)
        setPosition({
          start: list.scrollLeft < 1,
          end: list.scrollWidth - list.clientWidth - list.scrollLeft < 1,
        })
    }
    const resize = new ResizeObserver(update)
    resize.observe(list)
    list.addEventListener('scroll', update, { passive: true })
    update()
    return () => {
      resize.disconnect()
      list.removeEventListener('scroll', update)
    }
  }, [children, rail, setPosition])

  return (
    <div className="min-w-0 shrink-0">
      {locationNote ? <p className="text-muted mt-1 text-xs leading-snug">{locationNote}</p> : null}
      <ul
        ref={rail}
        aria-label={t('businessList')}
        className="mt-2 flex snap-x snap-mandatory scroll-px-0.5 gap-2 overflow-x-auto overscroll-x-contain p-0.5 [&>li]:shrink-0 [&>li]:basis-[47%] [&>li]:snap-start"
      >
        {children}
      </ul>
    </div>
  )
}
