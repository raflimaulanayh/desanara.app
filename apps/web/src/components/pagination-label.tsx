'use client'

import { useLinkStatus } from 'next/link'
import { useTranslations } from 'next-intl'

export function PaginationLabel({ label }: { label: string }) {
  const { pending } = useLinkStatus()
  const t = useTranslations('states')
  return <span aria-live="polite">{pending ? t('loading') : label}</span>
}
