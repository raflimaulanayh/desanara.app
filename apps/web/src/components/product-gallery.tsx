'use client'

import { Button } from '@heroui/react'
import { cn } from '@repo/ui/cn'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'
import { ProductPhoto } from './product-photo'

export interface GalleryPhoto {
  src: string | null
  alt: string
}

/**
 * Marketplace-style photo slider (up to 10 photos): swipe on phones (CSS scroll-snap, no slider
 * library), arrows and thumbnails on larger screens, a "2/5" counter everywhere. Only the cover is
 * loaded eagerly; the others load as they come near.
 */
export function ProductGallery({
  photos,
  category,
}: {
  photos: GalleryPhoto[]
  category?: string | null
}) {
  const t = useTranslations('product')
  const track = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const many = photos.length > 1

  const go = (i: number) => {
    const el = track.current
    if (!el) return
    const next = Math.max(0, Math.min(photos.length - 1, i))
    el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="group relative">
        <div
          ref={track}
          role={many ? 'region' : undefined}
          aria-roledescription={many ? 'carousel' : undefined}
          aria-label={many ? t('gallery') : undefined}
          tabIndex={many ? 0 : undefined}
          onScroll={(e) => {
            const el = e.currentTarget
            setActive(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)))
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') go(active + 1)
            if (e.key === 'ArrowLeft') go(active - 1)
          }}
          className="no-scrollbar focus-visible:outline-accent flex snap-x snap-mandatory overflow-x-auto rounded-2xl focus-visible:outline-2 lg:rounded-(--radius)"
        >
          {photos.map((p, i) => (
            <div
              key={`${p.src ?? 'none'}-${i}`}
              role={many ? 'group' : undefined}
              aria-roledescription={many ? 'slide' : undefined}
              aria-label={many ? t('photoOf', { n: i + 1, total: photos.length }) : undefined}
              className="w-full shrink-0 snap-center"
            >
              <ProductPhoto
                src={p.src}
                alt={p.alt}
                category={category}
                priority={i === 0}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="aspect-[5/4] sm:aspect-[4/3] lg:aspect-square"
              />
            </div>
          ))}
        </div>

        {many ? (
          <>
            <span
              aria-hidden
              className="bg-foreground/75 absolute right-3 bottom-3 rounded-full px-2.5 py-1 text-xs font-semibold text-white tabular-nums"
            >
              {active + 1}/{photos.length}
            </span>
            {(
              [
                ['prev', active - 1, ChevronLeft, 'left-3'],
                ['next', active + 1, ChevronRight, 'right-3'],
              ] as const
            ).map(([dir, to, Icon, side]) => (
              <Button
                key={dir}
                type="button"
                variant="ghost"
                size="sm"
                onPress={() => go(to)}
                isDisabled={to < 0 || to >= photos.length}
                aria-label={t(dir === 'prev' ? 'prevPhoto' : 'nextPhoto')}
                className={cn(
                  'bg-surface/90 absolute top-1/2 hidden size-9 min-w-0 -translate-y-1/2 rounded-full shadow-md transition-opacity group-hover:opacity-100 disabled:hidden sm:flex sm:opacity-0 sm:data-[focus-visible=true]:opacity-100',
                  side,
                )}
              >
                <Icon className="size-5" aria-hidden />
              </Button>
            ))}
          </>
        ) : null}
      </div>

      {many ? (
        <ul className="no-scrollbar hidden gap-2 overflow-x-auto sm:flex">
          {photos.map((p, i) => (
            <li key={`${p.src ?? 'none'}-thumb-${i}`} className="shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onPress={() => go(i)}
                aria-label={t('photoOf', { n: i + 1, total: photos.length })}
                aria-current={i === active ? 'true' : undefined}
                className={cn(
                  'block size-12 min-w-0 overflow-hidden rounded-lg border-2 p-0',
                  i === active ? 'border-accent' : 'hover:border-line-strong border-transparent',
                )}
              >
                <ProductPhoto src={p.src} alt="" category={category} sizes="48px" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
