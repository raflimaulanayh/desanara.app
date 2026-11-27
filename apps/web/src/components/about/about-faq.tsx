'use client'

import { Accordion } from '@heroui/react'
import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'

const ITEMS = [
  'free',
  'commission',
  'payment',
  'account',
  'village',
  'privacy',
  'language',
] as const

/** Frequently asked questions (PLAN-about-page §3.3, section 9). */
export function AboutFaq() {
  const t = useTranslations('about.faq.items')
  return (
    <Accordion hideSeparator className="flex w-full flex-col gap-3" defaultExpandedKeys={['free']}>
      {ITEMS.map((key) => (
        <Accordion.Item
          key={key}
          id={key}
          className="bg-surface border-line hover:bg-wash/30 data-expanded:bg-wash/50 rounded-(--radius) border border-solid px-5 transition-colors sm:px-6"
        >
          <Accordion.Heading>
            <Accordion.Trigger className="min-h-16 gap-4 bg-transparent px-0 py-4 text-left text-[1.0625rem] font-semibold hover:bg-transparent data-hovered:bg-transparent data-pressed:bg-transparent">
              {t(`${key}.q`)}
              <Accordion.Indicator className="text-accent">
                <ChevronDown />
              </Accordion.Indicator>
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <Accordion.Body className="text-foreground/75 max-w-[62ch] px-0 pb-5 text-base leading-relaxed">
              {t(`${key}.a`)}
            </Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  )
}
