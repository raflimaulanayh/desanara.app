import { formatRupiah } from '@repo/i18n'
import { cn } from '@repo/ui/cn'
import { BadgeCheck, MapPin, Search } from 'lucide-react'
import Image from 'next/image'
import { getLocale, getTranslations } from 'next-intl/server'
import { WhatsAppIcon } from '@/components/whatsapp-icon'
import { CategoryIcon } from '@/lib/category-icons'
import { mediaUrl } from '@/lib/media'

/** The product the problem story follows, from not found to found. */
export const STORY_PRODUCT = {
  name: 'Keripik Singkong Balado 250 gr',
  nameEn: 'Spicy Balado Cassava Chips 250 g',
  businessName: 'Keripik Bu Ani',
  village: 'Desa Baros',
  price: 17000,
  imageKey: 'seed/products/chips-b.webp',
} as const

/** Layers stack in one frame on desktop; on phones each copy shows one layer at its natural height. */
const stacked =
  'about-story-layer absolute inset-0 grid place-items-center p-6 transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]'
const single = 'grid place-items-center px-5 py-10'

/**
 * One product seen through the three problems, then through Desanara (PLAN-about-page §3.3, section 2).
 * `state` 0 to 2 are the problems, 3 is the answer. On desktop a single sticky copy switches state as the
 * steps scroll by (about-motion.tsx); on phones each step shows its own fixed copy. Decorative: the
 * same facts are in the step text.
 */
export async function ProblemVisual({
  state,
  sticky = false,
  className,
}: {
  state: 0 | 1 | 2 | 3
  sticky?: boolean
  className?: string
}) {
  const [t, order, badge, locale] = await Promise.all([
    getTranslations('about.problem.visual'),
    getTranslations('order'),
    getTranslations('badge'),
    getLocale(),
  ])
  const en = locale === 'en'
  const photo = mediaUrl(STORY_PRODUCT.imageKey)
  const name = en ? STORY_PRODUCT.nameEn : STORY_PRODUCT.name
  const layer = sticky ? stacked : single
  const only = (n: number) => (sticky ? undefined : state === n ? undefined : 'hidden')

  return (
    <div
      aria-hidden
      data-story-visual={sticky ? '' : undefined}
      data-state={state}
      className={cn(
        'about-story-visual bg-wash/50 border-line relative overflow-hidden rounded-(--radius) border',
        sticky && 'aspect-square max-h-[30rem]',
        className,
      )}
    >
      {/* 0. Hidden: known only inside a small circle around the village. */}
      <div data-layer="0" className={cn(layer, only(0))}>
        <div className="relative grid aspect-square w-[min(82%,24rem)] place-items-center rounded-full border-2 border-dashed border-[color-mix(in_oklab,var(--leaf)_45%,white)]">
          <div className="absolute inset-[22%] rounded-full bg-[color-mix(in_oklab,var(--leaf)_10%,white)]" />
          {[
            'top-[14%] left-[24%]',
            'top-[26%] right-[14%]',
            'bottom-[18%] left-[16%]',
            'bottom-[12%] right-[28%]',
          ].map((spot, i) => (
            <span
              key={spot}
              className={cn(
                'border-line absolute grid size-7 place-items-center rounded-full border bg-white text-[0.625rem] font-semibold text-[var(--muted)]',
                spot,
              )}
            >
              {['A', 'S', 'D', 'R'][i]}
            </span>
          ))}
          <div className="relative size-20 overflow-hidden rounded-full border-4 border-white opacity-80 grayscale-[55%] sm:size-28">
            {photo ? (
              <Image src={photo} alt="" fill sizes="112px" className="object-cover" />
            ) : null}
          </div>
          <span className="border-line absolute -bottom-4 left-1/2 inline-flex h-8 -translate-x-1/2 items-center gap-1.5 rounded-full border bg-white px-3 text-xs font-semibold whitespace-nowrap">
            <MapPin className="size-3.5 text-[var(--leaf)]" />
            {t('ring')}
          </span>
        </div>
      </div>

      {/* 1. Scattered: a buyer searches and finds nothing clear. */}
      <div data-layer="1" className={cn(layer, only(1))}>
        <div className="w-full max-w-96">
          <div className="border-line flex h-12 items-center gap-2 rounded-full border bg-white px-4 text-sm">
            <Search className="size-4 shrink-0 text-[var(--muted)]" />
            <span className="truncate">{t('query')}</span>
            <span className="ml-auto h-4 w-px animate-pulse bg-[var(--accent)] motion-reduce:animate-none" />
          </div>
          <div className="border-line mt-3 flex flex-col gap-2 rounded-(--radius) border bg-white p-3">
            {[78, 62, 70].map((width) => (
              <span key={width} className="flex items-center gap-3 rounded-(--radius-compact) p-2">
                <span className="size-9 shrink-0 rounded-(--radius-compact) bg-[var(--wash-strong)]" />
                <span className="flex flex-1 flex-col gap-1.5">
                  <span
                    className="h-2 rounded-full bg-[var(--wash-strong)]"
                    style={{ width: `${width}%` }}
                  />
                  <span className="h-2 w-1/3 rounded-full bg-[var(--wash)]" />
                </span>
              </span>
            ))}
            <p className="px-2 pt-1 pb-1 text-xs font-semibold text-[var(--muted)]">{t('empty')}</p>
          </div>
        </div>
      </div>

      {/* 2. Not ready: the listing exists but says too little. */}
      <div data-layer="2" className={cn(layer, only(2))}>
        <div className="w-full max-w-64 -rotate-2 rounded-(--radius) border-2 border-dashed border-[var(--line-strong)] bg-white p-3 sm:max-w-72">
          <div className="grid aspect-square place-items-center rounded-(--radius-compact) bg-[var(--wash)] text-[var(--line-strong)]">
            <CategoryIcon slug="makanan-camilan" className="size-12" strokeWidth={1.5} />
          </div>
          <p className="mt-3 text-sm font-semibold text-[var(--muted)]">{t('rawName')}</p>
          <p className="mt-1 text-sm text-[var(--muted)] italic">{t('rawPrice')}</p>
        </div>
      </div>

      {/* 3. Desanara: the full listing, findable, with its village and one tap to the maker. */}
      <div data-layer="3" className={cn(layer, only(3))}>
        <div className="flex w-full flex-col items-center gap-5">
          <div className="border-line w-full max-w-72 overflow-hidden rounded-(--radius) border bg-white sm:max-w-80">
            <div className="relative aspect-[4/3]">
              {photo ? (
                <Image src={photo} alt="" fill sizes="320px" className="object-cover" />
              ) : null}
              <span className="absolute top-2 left-2 inline-flex h-7 items-center gap-1 rounded-full bg-white/95 px-2.5 text-[0.6875rem] font-semibold text-[var(--accent)]">
                <BadgeCheck className="size-3.5" />
                {badge('verified')}
              </span>
            </div>
            <div className="p-3">
              <p className="text-sm leading-snug font-semibold">{name}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-[var(--muted)]">
                <MapPin className="size-3.5" />
                {STORY_PRODUCT.businessName}, {STORY_PRODUCT.village}
              </p>
              <p className="mt-1.5 font-semibold text-[var(--accent)] tabular-nums">
                {formatRupiah(STORY_PRODUCT.price, en ? 'en' : 'id')}
              </p>
              <span className="mt-3 flex min-h-10 items-center justify-center gap-2 rounded-full bg-[var(--wa)] text-sm font-semibold text-white">
                <WhatsAppIcon className="size-4" />
                {order('send')}
              </span>
            </div>
          </div>
          <span className="inline-flex h-8 items-center rounded-full bg-[var(--accent)] px-3.5 text-xs font-semibold whitespace-nowrap text-white">
            {t('found')}
          </span>
        </div>
      </div>
    </div>
  )
}
