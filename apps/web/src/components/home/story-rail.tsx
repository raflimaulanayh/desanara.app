'use client'

import { Button, Modal } from '@heroui/react'
import { Container } from '@repo/ui/components/container'
import { ArrowRight, Check, ChevronLeft, ChevronRight, Pause, Play, X } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useId, useRef, useState, useSyncExternalStore } from 'react'
import { Price } from '@/components/price'
import { Link } from '@/i18n/navigation'

export interface CatalogueStory {
  id: string
  image: string
  caption: string
  product?: {
    slug: string
    name: string
    price: number
    compareAtPrice: number | null
    image: string | null
  }
}

interface StoryAccount {
  id: string
  business: string
  village: string
  stories: CatalogueStory[]
}

function subscribeToVisibility(listener: () => void) {
  document.addEventListener('visibilitychange', listener)
  return () => document.removeEventListener('visibilitychange', listener)
}

export function StoryRail({ accounts }: { accounts: StoryAccount[] }) {
  const t = useTranslations('stories')
  const [open, setOpen] = useState(false)
  const titleId = useId()
  const businessId = useId()
  const [selection, setSelection] = useState<{ accountId: string; index: number }>()
  const [paused, setPaused] = useState(false)
  const [holding, setHolding] = useState(false)
  const [readyStoryId, setReadyStoryId] = useState<string>()
  const hidden = useSyncExternalStore(
    subscribeToVisibility,
    () => document.hidden,
    () => false,
  )
  const swipeStart = useRef<{ pointerId: number; x: number; y: number } | null>(null)
  const [viewed, setViewed] = useState<ReadonlySet<string>>(() => new Set())
  const activeAccounts = accounts.filter(({ stories }) => stories.length > 0)
  const accountIndex = activeAccounts.findIndex(({ id }) => id === selection?.accountId)
  const account = activeAccounts[accountIndex]
  const index = selection?.index ?? 0
  const story = account?.stories[index]
  const product = story?.product
  const hasPrevious = index > 0 || accountIndex > 0
  const hasNext = Boolean(account?.stories[index + 1] || activeAccounts[accountIndex + 1])

  function viewStory(target: StoryAccount, nextIndex: number) {
    const next = target.stories[nextIndex]
    if (!next) return
    setSelection({ accountId: target.id, index: nextIndex })
    setViewed((current) => (current.has(next.id) ? current : new Set(current).add(next.id)))
  }

  function step(direction: -1 | 1) {
    if (!account) return
    const nextIndex = index + direction
    if (account.stories[nextIndex]) {
      viewStory(account, nextIndex)
      return
    }
    const adjacent = activeAccounts[accountIndex + direction]
    if (adjacent) {
      viewStory(adjacent, direction === 1 ? 0 : adjacent.stories.length - 1)
    } else if (direction === 1) {
      setOpen(false)
    }
  }

  if (activeAccounts.length === 0) return null

  return (
    <section aria-labelledby={titleId} className="border-line/70 bg-surface border-b">
      <Container className="pt-2 pb-2 sm:pt-4 sm:pb-3">
        <h2 id={titleId} className="section-title">
          {t('title')}
        </h2>
        <ul className="-mx-4 mt-1.5 flex snap-x scroll-px-4 gap-2.5 overflow-x-auto px-4 pt-1.5 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6">
          {activeAccounts.map((item) => {
            const cover = item.stories[0]
            if (!cover) return null
            const nextUnread = item.stories.findIndex((status) => !viewed.has(status.id))
            const hasViewed = nextUnread === -1
            return (
              <li key={item.id} className="w-22 shrink-0 snap-start sm:w-26">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  aria-label={t(hasViewed ? 'reopen' : 'open', { business: item.business })}
                  aria-haspopup="dialog"
                  onPress={(event) => {
                    event.target.closest('button')?.focus()
                    swipeStart.current = null
                    setPaused(false)
                    setHolding(false)
                    viewStory(item, Math.max(0, nextUnread))
                    setOpen(true)
                  }}
                  className="group bg-foreground relative isolate block aspect-[3/5] h-auto w-full overflow-hidden rounded-(--radius) p-0 text-left text-xs leading-4 font-semibold whitespace-normal text-white shadow-sm"
                >
                  <Image
                    src={cover.image}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 232px, 196px"
                    className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105"
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/95 via-black/65 via-[3rem] to-transparent to-[5.75rem]"
                  />
                  <span
                    aria-hidden
                    className="bg-foreground/85 absolute top-2 right-2 grid size-5 place-items-center rounded-full text-white"
                  >
                    {hasViewed ? (
                      <Check className="size-3" />
                    ) : (
                      <span className="bg-sprout size-2 rounded-full" />
                    )}
                  </span>
                  <span className="absolute inset-x-2 bottom-2 line-clamp-2 wrap-anywhere">
                    {item.business}
                  </span>
                </Button>
              </li>
            )
          })}
        </ul>
      </Container>

      {account && story ? (
        <Modal.Backdrop isOpen={open} onOpenChange={setOpen} className="bg-black/80">
          <Modal.Container placement="center" size="full">
            <Modal.Dialog aria-labelledby={businessId} className="story-viewer">
              <Image
                key={story.id}
                src={story.image}
                alt=""
                fill
                quality={75}
                loading="eager"
                sizes="(min-width: 640px) 28rem, 100vw"
                onLoad={() => setReadyStoryId(story.id)}
                onError={() => setReadyStoryId(story.id)}
                className="object-cover"
              />
              <div className="story-viewer-scrim absolute inset-0" aria-hidden />
              <div
                onKeyDown={(event) => {
                  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
                  event.preventDefault()
                  step(event.key === 'ArrowLeft' ? -1 : 1)
                }}
                onPointerDown={(event) => {
                  if (
                    event.pointerType !== 'touch' ||
                    (event.target as Element).closest('button, a')
                  )
                    return
                  swipeStart.current = {
                    pointerId: event.pointerId,
                    x: event.clientX,
                    y: event.clientY,
                  }
                  setHolding(true)
                }}
                onPointerCancel={() => {
                  swipeStart.current = null
                  setHolding(false)
                }}
                onPointerUp={(event) => {
                  const start = swipeStart.current
                  if (!start || start.pointerId !== event.pointerId) return
                  swipeStart.current = null
                  setHolding(false)
                  const dx = event.clientX - start.x
                  const dy = event.clientY - start.y
                  if (Math.abs(dx) >= 44 && Math.abs(dx) > Math.abs(dy)) {
                    step(dx < 0 ? 1 : -1)
                  }
                }}
                className="relative flex flex-1 touch-pan-y flex-col justify-between gap-4 p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
              >
                <header>
                  <div aria-hidden className="mb-3 flex gap-1.5">
                    {account.stories.map((item, i) => (
                      <span
                        key={item.id}
                        className={`h-1 flex-1 overflow-hidden rounded-full ${i < index ? 'bg-white/70' : 'bg-white/35'}`}
                      >
                        {open && i === index ? (
                          <span
                            className="story-progress block h-full origin-left rounded-full bg-white"
                            style={{
                              animationPlayState:
                                paused || holding || hidden || readyStoryId !== story.id
                                  ? 'paused'
                                  : 'running',
                            }}
                            onAnimationEnd={() => step(1)}
                          />
                        ) : null}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="relative size-11 shrink-0 overflow-hidden rounded-full border-2 border-white">
                      <Image
                        src={account.stories[0]?.image ?? story.image}
                        alt=""
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3
                        id={businessId}
                        className="text-base leading-tight font-bold wrap-break-word"
                      >
                        {account.business}
                      </h3>
                      <p className="text-xs leading-snug font-semibold">{account.village}</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      aria-label={t(paused ? 'resume' : 'pause')}
                      onPress={() => setPaused(!paused)}
                      className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-black/45 text-white focus-visible:outline-white"
                    >
                      {paused ? (
                        <Play className="size-4" aria-hidden />
                      ) : (
                        <Pause className="size-4" aria-hidden />
                      )}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      autoFocus
                      aria-label={t('close')}
                      onPress={() => setOpen(false)}
                      className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-black/45 text-white focus-visible:outline-white"
                    >
                      <X className="size-6" aria-hidden />
                    </Button>
                  </div>
                </header>

                {hasPrevious || hasNext ? (
                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      aria-label={t('previous')}
                      onPress={() => step(-1)}
                      isDisabled={!hasPrevious}
                      className="group grid size-11 cursor-pointer place-items-center rounded-full bg-transparent p-0 text-white hover:bg-transparent focus-visible:outline-white disabled:invisible"
                    >
                      <span
                        aria-hidden
                        className="grid size-8 place-items-center rounded-full bg-black/65 group-hover:bg-black/90"
                      >
                        <ChevronLeft className="size-4" />
                      </span>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      aria-label={t('next')}
                      onPress={() => step(1)}
                      isDisabled={!hasNext}
                      className="group grid size-11 cursor-pointer place-items-center rounded-full bg-transparent p-0 text-white hover:bg-transparent focus-visible:outline-white disabled:invisible"
                    >
                      <span
                        aria-hidden
                        className="grid size-8 place-items-center rounded-full bg-black/65 group-hover:bg-black/90"
                      >
                        <ChevronRight className="size-4" />
                      </span>
                    </Button>
                  </div>
                ) : null}

                <div>
                  <p aria-live="polite" className="sr-only">
                    {t('position', { current: index + 1, total: account.stories.length })} ·{' '}
                    {account.business}
                  </p>
                  <p className="section-title mb-3 text-pretty">{story.caption}</p>
                  {product ? (
                    <div className="bg-surface text-foreground flex items-stretch gap-3 rounded-(--radius) p-2.5">
                      {product.image ? (
                        <div className="bg-wash relative w-[31%] shrink-0 overflow-hidden rounded-(--radius-compact)">
                          <Image
                            src={product.image}
                            alt=""
                            fill
                            sizes="128px"
                            className="object-cover"
                          />
                        </div>
                      ) : null}
                      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
                        <p className="line-clamp-2 text-base leading-snug font-bold">
                          {product.name}
                        </p>
                        <Price
                          price={product.price}
                          compareAtPrice={product.compareAtPrice}
                          className="text-accent text-base font-bold"
                        />
                        <Link
                          href={`/produk/${product.slug}`}
                          onClick={() => setOpen(false)}
                          className="bg-accent text-accent-foreground mt-1 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-2 text-center text-sm font-bold hover:bg-[var(--accent-hover)]"
                        >
                          {t('viewProduct')}
                          <ArrowRight className="size-4 shrink-0" aria-hidden />
                        </Link>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      ) : null}
    </section>
  )
}
