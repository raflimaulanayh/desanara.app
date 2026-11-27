'use client'

import { cn } from '@repo/ui/cn'
import { Pause, Play } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { OTHER_VILLAGES, REGENCY_DOT } from './about-facts'

/**
 * The other partner villages drifting past as small linked cards, each with its regency. Hover, focus
 * or the button pauses it; with reduced motion it becomes a wrapped grid. The second copy only makes
 * the loop seamless and is hidden from assistive technology and the tab order.
 */
export function VillageRibbon() {
  const t = useTranslations('about.baros')
  const [paused, setPaused] = useState(false)

  const list = (copy: boolean) => (
    <ul
      aria-hidden={copy || undefined}
      aria-label={copy ? undefined : t('othersLabel')}
      className="flex shrink-0 gap-3 pr-3 motion-reduce:shrink motion-reduce:flex-wrap motion-reduce:pr-0"
    >
      {OTHER_VILLAGES.map(([slug, name, regency]) => (
        <li key={slug}>
          <Link
            href={`/desa/${slug}`}
            tabIndex={copy ? -1 : undefined}
            className="group bg-surface border-line hover:border-accent flex min-w-40 flex-col rounded-(--radius) border px-4 py-3 transition-[box-shadow,transform] hover:-translate-y-0.5"
          >
            <span className="group-hover:text-accent font-semibold whitespace-nowrap transition-colors">
              {name}
            </span>
            <span className="text-muted mt-0.5 flex items-center gap-1.5 text-xs whitespace-nowrap">
              <span aria-hidden className={cn('size-2 rounded-full', REGENCY_DOT[regency])} />
              {t(`regencies.${regency}`)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )

  return (
    <div className="about-ribbon flex items-center gap-3" data-paused={paused || undefined}>
      <div className="min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_5%,#000_95%,transparent)] py-2 motion-reduce:[mask-image:none]">
        <div className="about-ribbon-track flex w-max motion-reduce:w-auto">
          {list(false)}
          {list(true)}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPaused((value) => !value)}
        aria-label={paused ? t('play') : t('pause')}
        aria-pressed={paused}
        className="bg-surface hover:text-accent border-line grid size-11 shrink-0 place-items-center rounded-full border motion-reduce:hidden"
      >
        {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
      </button>
    </div>
  )
}
