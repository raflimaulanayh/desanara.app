'use client'

import { Chip } from '@heroui/react'
import { useTranslations } from 'next-intl'
import type { Business } from '@/lib/businesses'

type Color = 'success' | 'warning' | 'danger' | 'default' | 'accent'

/** Publication + review state at a glance; colour is never the only signal (text always shown). */
export function StatusChips({
  b,
}: {
  b: Pick<Business, 'status' | 'verificationStatus' | 'takenDownAt'>
}) {
  const t = useTranslations('businessStatus')
  const chips: [string, Color][] = []
  if (b.takenDownAt) chips.push([t('takenDown'), 'danger'])
  chips.push(b.status === 'published' ? [t('published'), 'success'] : [t('draft'), 'default'])
  if (b.verificationStatus === 'pending') chips.push([t('pending'), 'warning'])
  if (b.verificationStatus === 'rejected') chips.push([t('rejected'), 'danger'])
  if (b.verificationStatus === 'verified') chips.push([t('verified'), 'accent'])
  return (
    <span className="flex flex-wrap gap-1.5">
      {chips.map(([label, color]) => (
        <Chip key={label} size="sm" color={color} variant="soft">
          {label}
        </Chip>
      ))}
    </span>
  )
}
