'use client'

import { Button, Modal } from '@heroui/react'
import { Container } from '@repo/ui/components/container'
import { SkeletonBlock } from '@repo/ui/components/loading-region'
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Store,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import {
  type RefObject,
  Suspense,
  use,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { Price } from '@/components/price'
import { Link } from '@/i18n/navigation'
import {
  type CatalogueStory,
  type StoryAccount,
  type StoryProduct,
  type StoryStatus,
  rankStoryAccounts,
} from '@/lib/story-order'

const viewedStorageKey = 'desanara:stories:viewed'
const storyTile = 'aspect-[3/5] w-full overflow-hidden rounded-(--radius)'
let viewedInMemory: string | undefined

function getViewedStories() {
  try {
    return viewedInMemory ?? localStorage.getItem(viewedStorageKey) ?? ''
  } catch {
    return viewedInMemory ?? ''
  }
}

function subscribeToViewedStories(listener: () => void) {
  window.addEventListener(viewedStorageKey, listener)
  window.addEventListener('storage', listener)
  return () => {
    window.removeEventListener(viewedStorageKey, listener)
    window.removeEventListener('storage', listener)
  }
}

function markStoryViewed(id: string) {
  const current = getViewedStories()
  if (current.split('\n').includes(id)) return
  const next = current ? `${current}\n${id}` : id
  try {
    localStorage.setItem(viewedStorageKey, next)
    viewedInMemory = undefined
  } catch {
    viewedInMemory = next
  }
  window.dispatchEvent(new Event(viewedStorageKey))
}

function subscribeToVisibility(listener: () => void) {
  document.addEventListener('visibilitychange', listener)
  return () => document.removeEventListener('visibilitychange', listener)
}

export function StoryRail({
  accounts,
  products,
}: {
  accounts: StoryAccount[]
  products?: Promise<Record<string, StoryProduct>>
}) {
  const t = useTranslations('stories')
  const [open, setOpen] = useState(false)
  const titleId = useId()
  const businessId = useId()
  const [selection, setSelection] = useState<{ accountId: string; index: number }>()
  const [playbackAccounts, setPlaybackAccounts] = useState<ReturnType<typeof rankStoryAccounts>>([])
  const [paused, setPaused] = useState(false)
  const [holding, setHolding] = useState(false)
  const [readyStoryId, setReadyStoryId] = useState<string>()
  const [videoProgress, setVideoProgress] = useState(0)
  const [videoFailed, setVideoFailed] = useState(false)
  const [muted, setMuted] = useState(true)
  const hidden = useSyncExternalStore(
    subscribeToVisibility,
    () => document.hidden,
    () => false,
  )
  const swipeStart = useRef<{ pointerId: number; x: number; y: number } | null>(null)
  const rail = useRef<HTMLUListElement>(null)
  const player = useRef<HTMLVideoElement>(null)
  const viewed = useSyncExternalStore<string | null>(
    subscribeToViewedStories,
    getViewedStories,
    () => null,
  )
  const ready = viewed !== null
  const rankedAccounts = rankStoryAccounts(accounts, new Set(viewed?.split('\n')))

  useLayoutEffect(() => {
    // Start fresh on reload without resetting scroll when the user views a story.
    if (ready) rail.current?.scrollTo({ left: 0, behavior: 'instant' })
  }, [ready])
  const accountIndex = playbackAccounts.findIndex(({ id }) => id === selection?.accountId)
  const account = playbackAccounts[accountIndex]
  const index = selection?.index ?? 0
  const story = account?.stories[index]
  const video = videoFailed ? undefined : story?.video
  const stopped = paused || holding || hidden
  const hasPrevious = index > 0 || accountIndex > 0
  const hasNext = Boolean(account?.stories[index + 1] || playbackAccounts[accountIndex + 1])

  function viewStory(target: StoryAccount, nextIndex: number) {
    const next = target.stories[nextIndex]
    if (!next) return
    setVideoProgress(0)
    setVideoFailed(false)
    setSelection({ accountId: target.id, index: nextIndex })
    markStoryViewed(next.id)
  }

  function step(direction: -1 | 1) {
    if (!account) return
    const nextIndex = index + direction
    if (account.stories[nextIndex]) {
      viewStory(account, nextIndex)
      return
    }
    const adjacent = playbackAccounts[accountIndex + direction]
    if (adjacent) {
      viewStory(
        adjacent,
        direction === 1 ? Math.max(0, adjacent.nextUnread) : adjacent.stories.length - 1,
      )
    } else if (direction === 1) {
      setOpen(false)
    }
  }

  if (rankedAccounts.length === 0) return null

  return (
    <section aria-labelledby={titleId} className="border-line/70 bg-surface border-b">
      <Container className="pt-2 pb-2 sm:pt-4 sm:pb-3">
        <h2 id={titleId} className="section-title">
          {t('title')}
        </h2>
        {!ready ? (
          <span role="status" className="sr-only">
            {t('loading')}
          </span>
        ) : null}
        <ul
          ref={rail}
          aria-hidden={!ready || undefined}
          className={`-mx-4 mt-1.5 flex scroll-px-4 gap-2.5 overflow-x-auto px-4 pt-1.5 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 ${ready && !open ? 'snap-x' : 'snap-none'}`}
        >
          {(open ? playbackAccounts : rankedAccounts).map((item) => (
            <li key={item.id} className="w-22 shrink-0 snap-start sm:w-26">
              {ready ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  aria-label={t(item.hasUnread ? 'open' : 'reopen', { business: item.business })}
                  aria-describedby={item.latestStory.status && `${titleId}-${item.id}-status`}
                  aria-haspopup="dialog"
                  onPress={(event) => {
                    event.target.closest('button')?.focus({ preventScroll: true })
                    swipeStart.current = null
                    setPaused(false)
                    setHolding(false)
                    setMuted(true)
                    setPlaybackAccounts(rankedAccounts)
                    viewStory(item, Math.max(0, item.nextUnread))
                    setOpen(true)
                  }}
                  className={`${storyTile} group bg-foreground relative isolate block h-auto p-0 text-left whitespace-normal text-white shadow-sm`}
                >
                  {item.latestStory.image ? (
                    <>
                      <Image
                        src={item.latestStory.image}
                        alt=""
                        fill
                        sizes="(min-width: 640px) 232px, 196px"
                        className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105"
                      />
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/95 via-black/65 via-[3rem] to-transparent to-[5.75rem]"
                      />
                    </>
                  ) : (
                    <span
                      aria-hidden
                      className="absolute inset-0 flex items-center bg-[var(--accent-hover)] px-2 pt-6 pb-12"
                    >
                      <span className="line-clamp-3 text-[0.625rem] leading-snug font-semibold wrap-anywhere text-white/90">
                        {item.latestStory.caption}
                      </span>
                    </span>
                  )}
                  <span
                    aria-hidden
                    className="bg-foreground/85 absolute top-2 right-2 grid size-5 place-items-center rounded-full text-white"
                  >
                    {item.hasUnread ? (
                      <span className="bg-sprout size-2 rounded-full" />
                    ) : (
                      <Check className="size-3" />
                    )}
                  </span>
                  <span className="absolute inset-x-2 bottom-2 flex flex-col items-start gap-1">
                    {item.latestStory.status ? (
                      <StatusBadge
                        id={`${titleId}-${item.id}-status`}
                        status={item.latestStory.status}
                      />
                    ) : null}
                    <span className="line-clamp-2 text-[0.6875rem] leading-tight font-semibold wrap-anywhere">
                      {item.business}
                    </span>
                  </span>
                </Button>
              ) : (
                <SkeletonBlock className={storyTile} />
              )}
            </li>
          ))}
        </ul>
      </Container>

      {account && story ? (
        <Modal.Backdrop isOpen={open} onOpenChange={setOpen} className="bg-black/80">
          <Modal.Container placement="center" size="full">
            <Modal.Dialog aria-labelledby={businessId} className="story-viewer">
              {open && video ? (
                <StoryVideo
                  key={story.id}
                  src={video}
                  poster={story.image}
                  player={player}
                  muted={muted}
                  paused={stopped}
                  onProgress={setVideoProgress}
                  onPlaybackBlocked={setPaused}
                  onEnded={() => step(1)}
                  onError={() => setVideoFailed(true)}
                />
              ) : story.image ? (
                <Image
                  key={story.id}
                  src={story.image}
                  alt=""
                  draggable={false}
                  fill
                  quality={75}
                  loading="eager"
                  sizes="(min-width: 640px) 28rem, 100vw"
                  onLoad={() => setReadyStoryId(story.id)}
                  onError={() => setReadyStoryId(story.id)}
                  className="object-cover"
                />
              ) : null}
              <div
                className={
                  story.image
                    ? 'story-viewer-scrim absolute inset-0'
                    : 'absolute inset-0 bg-[var(--accent-hover)]'
                }
                aria-hidden
              />
              <div
                onKeyDown={(event) => {
                  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
                  event.preventDefault()
                  step(event.key === 'ArrowLeft' ? -1 : 1)
                }}
                onPointerDown={(event) => {
                  if (
                    !event.isPrimary ||
                    event.button !== 0 ||
                    (event.target as Element).closest('button, a')
                  )
                    return
                  swipeStart.current = {
                    pointerId: event.pointerId,
                    x: event.clientX,
                    y: event.clientY,
                  }
                  event.currentTarget.setPointerCapture(event.pointerId)
                  setHolding(true)
                }}
                onLostPointerCapture={(event) => {
                  if (swipeStart.current?.pointerId !== event.pointerId) return
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
                className="relative flex flex-1 cursor-grab touch-pan-y flex-col justify-between gap-4 p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] select-none active:cursor-grabbing"
              >
                <header>
                  <div aria-hidden className="mb-3 flex gap-1.5">
                    {account.stories.map((item, i) => (
                      <span
                        key={item.id}
                        className={`h-1 flex-1 overflow-hidden rounded-full ${i < index ? 'bg-white/70' : 'bg-white/35'}`}
                      >
                        {open && i === index && video ? (
                          <span
                            className="block h-full origin-left rounded-full bg-white motion-safe:transition-transform"
                            style={{ transform: `scaleX(${videoProgress})` }}
                          />
                        ) : open && i === index ? (
                          <span
                            className="story-progress block h-full origin-left rounded-full bg-white"
                            style={{
                              animationPlayState:
                                stopped || (story.image && readyStoryId !== story.id)
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
                    <div className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-white bg-white/10">
                      {account.coverImage ? (
                        <Image
                          src={account.coverImage}
                          alt=""
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      ) : (
                        <Store className="size-4" aria-hidden />
                      )}
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
                  <div className="story-viewer-arrows pointer-events-none absolute inset-x-3 top-1/2 flex -translate-y-1/2 items-center justify-between motion-safe:transition-opacity">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      aria-label={t('previous')}
                      onPress={() => step(-1)}
                      isDisabled={!hasPrevious}
                      className="group pointer-events-auto grid size-11 cursor-pointer place-items-center rounded-full bg-transparent p-0 text-white hover:bg-transparent focus-visible:outline-white disabled:invisible"
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
                      className="group pointer-events-auto grid size-11 cursor-pointer place-items-center rounded-full bg-transparent p-0 text-white hover:bg-transparent focus-visible:outline-white disabled:invisible"
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

                <p aria-live="polite" className="sr-only">
                  {t('position', { current: index + 1, total: account.stories.length })} ·{' '}
                  {account.business}
                </p>
                {!story.image ? (
                  <div className="mx-auto flex min-h-0 max-w-[28ch] flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
                    {story.status ? <StatusBadge status={story.status} /> : null}
                    <p className="text-lg leading-snug font-bold text-pretty wrap-anywhere sm:text-xl">
                      {story.caption}
                    </p>
                  </div>
                ) : null}
                <div className="relative">
                  {story.image ? (
                    <>
                      {story.status ? <StatusBadge status={story.status} /> : null}
                      <div className="mb-3 flex items-end gap-3">
                        <p className="section-title min-w-0 flex-1 text-pretty">{story.caption}</p>
                        {video ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            aria-label={t(muted ? 'unmute' : 'mute')}
                            onPress={() => {
                              if (player.current) player.current.muted = !muted
                              setMuted(!muted)
                            }}
                            className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-black/65 text-white focus-visible:outline-white"
                          >
                            {muted ? (
                              <VolumeX className="size-4" aria-hidden />
                            ) : (
                              <Volume2 className="size-4" aria-hidden />
                            )}
                          </Button>
                        ) : null}
                      </div>
                    </>
                  ) : null}
                  <Suspense fallback={null}>
                    <StoryProductCard
                      story={story}
                      products={products}
                      onFollow={() => setOpen(false)}
                    />
                  </Suspense>
                </div>
              </div>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      ) : null}
    </section>
  )
}

function StatusBadge({ id, status }: { id?: string; status: StoryStatus }) {
  const t = useTranslations('stories.status')
  const color = status === 'preorder' ? 'bg-sun' : 'bg-sprout'
  return (
    <span
      id={id}
      className={`text-foreground inline-block max-w-full rounded-full px-1.5 py-0.5 text-[0.625rem] leading-tight font-bold ${color}`}
    >
      {t(status)}
    </span>
  )
}

function StoryVideo({
  src,
  poster,
  player,
  muted,
  paused,
  onProgress,
  onPlaybackBlocked,
  onEnded,
  onError,
}: {
  src: string
  poster?: string
  player: RefObject<HTMLVideoElement | null>
  muted: boolean
  paused: boolean
  onProgress: (progress: number) => void
  onPlaybackBlocked: (paused: boolean) => void
  onEnded: () => void
  onError: () => void
}) {
  useEffect(() => {
    const element = player.current
    if (!element) return
    if (paused) {
      element.pause()
      return
    }
    let active = true
    void element.play().catch((error: unknown) => {
      if (active && error instanceof DOMException && error.name === 'NotAllowedError') {
        onPlaybackBlocked(true)
      }
    })
    return () => {
      active = false
    }
  }, [paused, player, onPlaybackBlocked])

  return (
    <video
      ref={player}
      src={src}
      poster={poster}
      muted={muted}
      playsInline
      preload="metadata"
      aria-hidden
      onTimeUpdate={({ currentTarget: { duration, currentTime } }) => {
        if (Number.isFinite(duration) && duration > 0)
          onProgress(Math.min(currentTime / duration, 1))
      }}
      onEnded={onEnded}
      onError={onError}
      className="pointer-events-none absolute inset-0 size-full object-cover"
    />
  )
}

function StoryProductCard({
  story,
  products,
  onFollow,
}: {
  story: CatalogueStory
  products?: Promise<Record<string, StoryProduct>>
  onFollow: () => void
}) {
  const t = useTranslations('stories')
  const product =
    story.product ??
    (story.catalogueSlug && products ? use(products)[story.catalogueSlug] : undefined)
  if (!product) return null

  return (
    <div className="bg-surface text-foreground flex items-stretch gap-3 rounded-(--radius) p-2.5">
      {product.image ? (
        <div className="bg-wash relative w-[31%] shrink-0 overflow-hidden rounded-(--radius-compact)">
          <Image src={product.image} alt="" fill sizes="128px" className="object-cover" />
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <p className="line-clamp-2 text-base leading-snug font-bold">{product.name}</p>
        <Price
          price={product.price}
          compareAtPrice={product.compareAtPrice}
          className="text-accent text-base font-bold"
        />
        <Link
          href={`/produk/${product.slug}`}
          onClick={onFollow}
          className="bg-accent text-accent-foreground mt-1 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-2 text-center text-sm font-bold hover:bg-[var(--accent-hover)]"
        >
          {t('viewProduct')}
          <ArrowRight className="size-4 shrink-0" aria-hidden />
        </Link>
      </div>
    </div>
  )
}
