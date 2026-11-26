'use client'

import { Button, Modal } from '@heroui/react'
import { cn } from '@repo/ui/cn'
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useCallback, useRef, useState } from 'react'
import { ProductPhoto } from './product-photo'
import { productDetailLayout } from './public-page-layout'

export interface GalleryPhoto {
  src: string | null
  alt: string
}

type ViewablePhoto = GalleryPhoto & { src: string }

const coverShape = productDetailLayout.cover
const darkControl =
  'border border-white/20 bg-black/65 text-white hover:bg-black/90 focus-visible:outline-white'

export function ProductGallery({
  photos,
  category,
}: {
  photos: GalleryPhoto[]
  category?: string | null
}) {
  const t = useTranslations('product')
  const [viewerStart, setViewerStart] = useState(0)
  const [viewerOpen, setViewerOpen] = useState(false)
  const items = photos.filter((photo): photo is ViewablePhoto => photo.src !== null)

  if (!items.length) {
    return (
      <ProductPhoto
        src={null}
        alt={photos[0]?.alt ?? ''}
        category={category}
        className={cn(coverShape, 'min-w-0 rounded-(--radius)')}
      />
    )
  }

  return (
    <>
      <PhotoCarousel
        photos={items}
        onExpand={(index) => {
          setViewerStart(index)
          setViewerOpen(true)
        }}
      />
      <Modal.Backdrop isOpen={viewerOpen} onOpenChange={setViewerOpen} className="bg-neutral-950">
        <Modal.Container placement="center" size="full">
          <Modal.Dialog
            aria-label={t('gallery')}
            className="h-full w-full max-w-none overflow-hidden rounded-none border-0 bg-neutral-950 p-0 text-white shadow-none"
          >
            <PhotoCarousel
              key={viewerStart}
              photos={items}
              initialIndex={viewerStart}
              onClose={() => setViewerOpen(false)}
            />
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  )
}

function PhotoCarousel({
  photos,
  initialIndex = 0,
  onExpand,
  onClose,
}: {
  photos: ViewablePhoto[]
  initialIndex?: number
  onExpand?: (index: number) => void
  onClose?: () => void
}) {
  const t = useTranslations('product')
  const track = useRef<HTMLDivElement | null>(null)
  const [active, setActive] = useState(initialIndex)
  const expanded = !!onClose
  const many = photos.length > 1

  const attachTrack = useCallback(
    (element: HTMLDivElement | null) => {
      track.current = element
      if (element) {
        element.scrollTo({ left: initialIndex * element.clientWidth, behavior: 'instant' })
      }
    },
    [initialIndex],
  )

  function go(index: number) {
    const element = track.current
    if (!element || index < 0 || index >= photos.length) return
    element.scrollTo({ left: index * element.clientWidth, behavior: 'instant' })
  }

  const counter = (
    <span
      aria-hidden
      className="rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-white tabular-nums"
    >
      {active + 1} / {photos.length}
    </span>
  )

  return (
    <div
      className={cn('flex min-w-0 flex-col gap-2', expanded && 'h-full min-h-0 flex-1')}
      role={many ? 'region' : undefined}
      aria-label={many ? t('gallery') : undefined}
      onKeyDown={(event) => {
        if (!many || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return
        event.preventDefault()
        go(active + (event.key === 'ArrowRight' ? 1 : -1))
      }}
    >
      {onClose ? (
        <div className="flex items-center justify-between px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
          <div>{many ? counter : null}</div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            autoFocus
            aria-label={t('closeGallery')}
            onPress={onClose}
            className={cn(darkControl, 'size-11 min-w-0 rounded-full')}
          >
            <X className="size-5" aria-hidden />
          </Button>
        </div>
      ) : null}

      <div className={cn('relative min-w-0', expanded && 'min-h-0 flex-1')}>
        <div
          ref={attachTrack}
          tabIndex={many ? 0 : undefined}
          onScroll={(event) => {
            const { scrollLeft, clientWidth } = event.currentTarget
            const index = Math.round(scrollLeft / Math.max(1, clientWidth))
            setActive(Math.max(0, Math.min(photos.length - 1, index)))
          }}
          className={cn(
            'focus-visible:outline-accent flex w-full min-w-0 snap-x snap-mandatory overflow-x-auto overscroll-x-contain focus-visible:outline-2',
            expanded ? 'h-full' : 'rounded-(--radius)',
          )}
        >
          {photos.map((photo, index) => (
            <div
              key={`${photo.src}-${index}`}
              className="relative w-full shrink-0 snap-center"
              aria-hidden={expanded && index !== active ? true : undefined}
            >
              {onExpand ? (
                <Button
                  type="button"
                  variant="ghost"
                  aria-haspopup="dialog"
                  aria-label={t('openPhoto', { n: index + 1 })}
                  excludeFromTabOrder={index !== active}
                  onPress={(event) => {
                    event.target.closest('button')?.focus({ preventScroll: true })
                    onExpand(index)
                  }}
                  className="relative block h-auto w-full min-w-0 cursor-zoom-in overflow-hidden rounded-(--radius) p-0"
                >
                  <ProductPhoto
                    src={photo.src}
                    alt={photo.alt}
                    priority={index === 0}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className={coverShape}
                  />
                  <span
                    aria-hidden
                    className="absolute bottom-3 left-3 grid size-9 place-items-center rounded-full bg-black/70 text-white"
                  >
                    <Maximize2 className="size-4" />
                  </span>
                </Button>
              ) : (
                <div className="relative mx-auto h-full w-full sm:w-[calc(100%-8rem)]">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    loading={index === initialIndex ? 'eager' : 'lazy'}
                    sizes="(min-width: 640px) calc(100vw - 8rem), 100vw"
                    className="object-contain"
                    draggable={false}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {many ? (
          <>
            {!expanded ? (
              <div className="pointer-events-none absolute right-3 bottom-3">{counter}</div>
            ) : null}
            {(
              [
                [active - 1, ChevronLeft, 'left-2 sm:left-4', 'prevPhoto'],
                [active + 1, ChevronRight, 'right-2 sm:right-4', 'nextPhoto'],
              ] as const
            ).map(([index, Icon, side, label]) => (
              <Button
                key={label}
                type="button"
                variant="ghost"
                size="sm"
                onPress={() => go(index)}
                isDisabled={index < 0 || index >= photos.length}
                aria-label={t(label)}
                className={cn(
                  'group absolute top-1/2 grid size-11 min-w-0 -translate-y-1/2 place-items-center rounded-full bg-transparent p-0 text-white hover:bg-transparent focus-visible:outline-white disabled:invisible data-[pressed=true]:bg-transparent',
                  side,
                )}
              >
                <span
                  aria-hidden
                  className="grid size-8 place-items-center rounded-full border border-white/20 bg-black/65 group-hover:bg-black/90"
                >
                  <Icon className="size-4" />
                </span>
              </Button>
            ))}
          </>
        ) : null}
      </div>

      {expanded ? (
        <p className="mx-auto line-clamp-2 max-w-prose px-5 text-center text-sm text-white/85">
          {photos[active]?.alt}
        </p>
      ) : null}

      {many ? (
        <>
          <p className="sr-only" aria-live="polite">
            {t('photoOf', { n: active + 1, total: photos.length })}
          </p>
          <ul
            className={cn(
              'flex min-w-0 gap-2 overflow-x-auto',
              expanded
                ? 'mx-auto max-w-full px-4 pt-1 pb-[max(0.75rem,env(safe-area-inset-bottom))]'
                : 'hidden sm:flex',
            )}
          >
            {photos.map((photo, index) => (
              <li key={`${photo.src}-${index}`} className="shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onPress={() => go(index)}
                  aria-label={t('photoOf', { n: index + 1, total: photos.length })}
                  aria-current={index === active ? 'true' : undefined}
                  className={cn(
                    'block size-12 min-w-0 overflow-hidden rounded-(--radius-compact) border-2 p-0',
                    index === active
                      ? expanded
                        ? 'border-sprout'
                        : 'border-accent'
                      : expanded
                        ? 'border-transparent opacity-65 hover:opacity-100'
                        : 'hover:border-line-strong border-transparent',
                  )}
                >
                  <ProductPhoto src={photo.src} alt="" sizes="48px" />
                </Button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  )
}
