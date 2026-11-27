'use client'

import { cn } from '@repo/ui/cn'
import { MapPin, Pause, Play } from 'lucide-react'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { mediaUrl } from '@/lib/media'
import { HERO_PRODUCTS } from './about-facts'

/**
 * Photos alternate between square and slightly portrait. Each square sits lower by half the height
 * difference, so the pair stays centred on one line.
 */
const SHAPES = ['aspect-[4/5]', 'aspect-square']
const DROPS = ['mt-0', 'mt-5 sm:mt-6.5 lg:mt-7.5']

/**
 * The hero's row of village products (PLAN-about-page §3.3, section 1). It drifts slowly as one loop;
 * hover, focus or the pause button stops it, and with reduced motion it becomes a row you scroll. The
 * second copy only closes the loop and is hidden from assistive technology and the tab order.
 */
export function HeroStrip() {
  const t = useTranslations('about.hero')
  const ribbon = useTranslations('about.baros')
  const en = useLocale() === 'en'
  const [paused, setPaused] = useState(false)

  const row = (copy: boolean) => (
    <ul
      aria-hidden={copy || undefined}
      aria-label={copy ? undefined : t('mosaicLabel')}
      className="flex shrink-0 items-start gap-4 pr-4 sm:gap-6 sm:pr-6"
    >
      {HERO_PRODUCTS.map((product, i) => {
        const src = mediaUrl(product.imageKey)
        return (
          <li key={product.slug} className={cn('w-40 shrink-0 sm:w-52 lg:w-60', DROPS[i % 2])}>
            <Link
              href={`/produk/${product.slug}`}
              tabIndex={copy ? -1 : undefined}
              className="group block rounded-(--radius) focus-visible:outline-offset-4"
            >
              <span
                className={cn(
                  'bg-wash relative block overflow-hidden rounded-(--radius)',
                  SHAPES[i % 2],
                )}
              >
                {src ? (
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 15rem, (min-width: 640px) 13rem, 10rem"
                    loading={!copy && i < 5 ? 'eager' : 'lazy'}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  />
                ) : null}
              </span>
              <span className="mt-3 block text-sm leading-snug font-semibold text-balance group-hover:text-[var(--accent)]">
                {en ? product.nameEn : product.name}
              </span>
              <span className="text-foreground/65 mt-1 flex items-center gap-1 text-xs">
                <MapPin className="size-3.5 shrink-0" aria-hidden />
                {product.village}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )

  return (
    <div className="about-strip relative" data-paused={paused || undefined}>
      <div className="about-strip-viewport overflow-hidden pb-2">
        <div className="about-strip-track flex w-max">
          {row(false)}
          {row(true)}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPaused((value) => !value)}
        aria-label={paused ? ribbon('play') : ribbon('pause')}
        aria-pressed={paused}
        className="border-line bg-surface/90 hover:text-accent absolute right-4 -bottom-14 grid size-11 place-items-center rounded-full border backdrop-blur-sm motion-reduce:hidden sm:right-6"
      >
        {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
      </button>
    </div>
  )
}
