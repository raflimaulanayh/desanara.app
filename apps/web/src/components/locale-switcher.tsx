'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'

export function LocaleSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const t = useTranslations('nav')
  return (
    <span
      className="font-print inline-flex h-11 items-center text-sm"
      role="group"
      aria-label={t('switchLanguage')}
    >
      {(['id', 'en'] as const).map((l, i) => (
        <span key={l} className="inline-flex items-center">
          {i > 0 ? (
            <span aria-hidden className="text-nota-rule-strong px-1">
              /
            </span>
          ) : null}
          {l === locale ? (
            <span
              aria-current="true"
              className="text-foreground font-bold underline decoration-2 underline-offset-4"
            >
              {l.toUpperCase()}
            </span>
          ) : (
            <Link
              href={pathname}
              locale={l}
              className="text-muted hover:text-accent px-0.5 font-semibold"
              hrefLang={l}
            >
              {l.toUpperCase()}
            </Link>
          )}
        </span>
      ))}
    </span>
  )
}
