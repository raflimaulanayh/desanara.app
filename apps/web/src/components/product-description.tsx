'use client'

import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Product details like a marketplace listing: a short fact table, then the seller's description in
 * paragraphs. Long descriptions start clamped on phones with "Read more"; wide screens show everything.
 */
export function ProductDescription({
  facts,
  description,
}: {
  facts: { label: string; value: ReactNode }[]
  description: string
}) {
  const t = useTranslations('product')
  const [expanded, setExpanded] = useState(false)
  const [clamped, setClamped] = useState(false)
  const body = useRef<HTMLDivElement>(null)
  const id = useId()
  const paragraphs = description.split(/\n{2,}/).filter(Boolean)

  useLayoutEffect(() => {
    const element = body.current
    if (!element) return
    const measure = () => setClamped(element.scrollHeight > element.clientHeight + 2)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [description])

  return (
    <section aria-labelledby={`${id}-title`} className="border-line rounded-(--radius) border">
      <h2 id={`${id}-title`} className="section-title px-4 pt-4 sm:px-5 sm:pt-5">
        {t('details')}
      </h2>
      <dl className="mt-3 grid grid-cols-[minmax(7rem,auto)_minmax(0,1fr)] gap-x-4 px-4 text-sm sm:px-5">
        {facts.map((fact) => (
          <div
            key={fact.label}
            className="border-line col-span-2 grid grid-cols-subgrid border-b py-2.5"
          >
            <dt className="text-muted">{fact.label}</dt>
            <dd className="min-w-0 font-medium wrap-break-word">{fact.value}</dd>
          </div>
        ))}
      </dl>
      {paragraphs.length ? (
        <div className="px-4 pt-4 pb-4 sm:px-5 sm:pb-5">
          <div
            id={`${id}-body`}
            ref={body}
            className={
              expanded
                ? 'space-y-3'
                : 'max-h-[9.5rem] space-y-3 overflow-hidden [mask-image:linear-gradient(to_bottom,black_60%,transparent)] lg:max-h-none lg:[mask-image:none]'
            }
          >
            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-foreground/80 max-w-[68ch] text-[0.9375rem] leading-relaxed text-pretty whitespace-pre-line"
              >
                {paragraph}
              </p>
            ))}
          </div>
          {clamped || expanded ? (
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls={`${id}-body`}
              onClick={() => setExpanded((open) => !open)}
              className="text-accent mt-2 inline-flex min-h-11 items-center gap-1 text-sm font-semibold lg:hidden"
            >
              {expanded ? t('readLess') : t('readMore')}
              <ChevronDown
                className={`size-4 transition-transform motion-reduce:transition-none ${expanded ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
