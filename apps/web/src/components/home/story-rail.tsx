'use client'

import { Button, Modal } from '@heroui/react'
import { Container } from '@repo/ui/components/container'
import { ArrowRight, Check, ChevronLeft, ChevronRight, X } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useId, useState } from 'react'
import { Price } from '@/components/price'
import { Link } from '@/i18n/navigation'

export interface CatalogueStory {
  id: string
  business: string
  village: string
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

export function StoryRail({ stories }: { stories: CatalogueStory[] }) {
  const t = useTranslations('stories')
  const [open, setOpen] = useState(false)
  const titleId = useId()
  const businessId = useId()
  const [index, setIndex] = useState(0)
  const [viewed, setViewed] = useState<ReadonlySet<string>>(() => new Set())
  const story = stories[index] ?? stories[0]
  if (!story) return null
  const product = story.product

  function viewStory(nextIndex: number) {
    const next = stories[nextIndex]
    if (!next) return
    setIndex(nextIndex)
    setViewed((current) => (current.has(next.id) ? current : new Set(current).add(next.id)))
  }

  return (
    <section aria-labelledby={titleId} className="border-line/70 bg-surface border-b">
      <Container className="pt-2 pb-2 sm:pt-4 sm:pb-3">
        <h2 id={titleId} className="section-title">
          {t('title')}
        </h2>
        <ul className="-mx-4 mt-1.5 flex snap-x scroll-px-4 gap-2.5 overflow-x-auto px-4 pt-1.5 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6">
          {stories.map((item, i) => {
            const hasViewed = viewed.has(item.id)
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
                    viewStory(i)
                    setOpen(true)
                  }}
                  className="group bg-foreground relative isolate block aspect-[3/5] h-auto w-full overflow-hidden rounded-(--radius) p-0 text-left text-xs leading-4 font-semibold whitespace-normal text-white shadow-sm"
                >
                  <Image
                    src={item.image}
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
                    {hasViewed ? <Check /> : <span className="bg-sprout size-2 rounded-full" />}
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

      <Modal.Backdrop isOpen={open} onOpenChange={setOpen} className="bg-black/80">
        <Modal.Container placement="center" size="full">
          <Modal.Dialog aria-labelledby={businessId} className="story-viewer">
            <Image
              key={story.id}
              src={story.image}
              alt=""
              fill
              quality={60}
              sizes="(min-width: 640px) 28rem, 100vw"
              className="object-cover"
            />
            <div className="story-viewer-scrim absolute inset-0" aria-hidden />
            <div
              onKeyDown={(event) => {
                if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
                event.preventDefault()
                viewStory(index + (event.key === 'ArrowLeft' ? -1 : 1))
              }}
              className="relative flex flex-1 flex-col justify-between gap-4 p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
            >
              <header>
                <div aria-hidden className="mb-3 flex gap-1.5">
                  {stories.map((item, i) => (
                    <span
                      key={item.id}
                      className={`h-1 flex-1 rounded-full ${i <= index ? 'bg-white' : 'bg-white/45'}`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="relative size-11 shrink-0 overflow-hidden rounded-full border-2 border-white">
                    <Image src={story.image} alt="" fill sizes="44px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3
                      id={businessId}
                      className="text-base leading-tight font-bold wrap-break-word"
                    >
                      {story.business}
                    </h3>
                    <p className="text-xs leading-snug font-semibold">{story.village}</p>
                  </div>
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

              {stories.length > 1 ? (
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    aria-label={t('previous')}
                    onPress={() => viewStory(index - 1)}
                    isDisabled={index === 0}
                    className="grid size-11 cursor-pointer place-items-center rounded-full bg-black/55 text-white focus-visible:outline-white disabled:invisible"
                  >
                    <ChevronLeft className="size-6" aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    aria-label={t('next')}
                    onPress={() => viewStory(index + 1)}
                    isDisabled={index === stories.length - 1}
                    className="grid size-11 cursor-pointer place-items-center rounded-full bg-black/55 text-white focus-visible:outline-white disabled:invisible"
                  >
                    <ChevronRight className="size-6" aria-hidden />
                  </Button>
                </div>
              ) : null}

              <div>
                <p aria-live="polite" className="sr-only">
                  {t('position', { current: index + 1, total: stories.length })} · {story.business}
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
    </section>
  )
}
