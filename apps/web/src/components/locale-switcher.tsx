'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'

export function LocaleSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const t = useTranslations('nav')
  return (
    <span
      className="bg-wash inline-flex items-center rounded-full p-0.5 text-xs font-bold"
      role="group"
      aria-label={t('switchLanguage')}
    >
      {(['id', 'en'] as const).map((l) =>
        l === locale ? (
          <span
            key={l}
            aria-current="true"
            className="bg-surface text-foreground inline-flex h-8 min-w-9 items-center justify-center rounded-full px-2 shadow-sm"
          >
            {l.toUpperCase()}
          </span>
        ) : (
          <Link
            key={l}
            href={pathname}
            locale={l}
            hrefLang={l}
            className="text-muted hover:text-foreground inline-flex h-8 min-w-9 items-center justify-center rounded-full px-2"
          >
            {l.toUpperCase()}
          </Link>
        ),
      )}
    </span>
  )
}
