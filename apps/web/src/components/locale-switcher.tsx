'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'

export function LocaleSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const t = useTranslations('nav')
  const next = locale === 'id' ? 'en' : 'id'
  return (
    <Link
      href={pathname}
      locale={next}
      className="border-border rounded-full border px-3 py-1 text-xs font-medium"
      aria-label={t('switchLanguage')}
    >
      {next.toUpperCase()}
    </Link>
  )
}
