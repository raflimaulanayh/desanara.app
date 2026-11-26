import { buttonVariants } from '@heroui/styles'
import { Container } from '@repo/ui/components/container'
import { EmptyState } from '@repo/ui/components/empty-state'
import { StatusMascot } from '@repo/ui/components/status-mascot'
import { connection } from 'next/server'
import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'
import { Link } from '@/i18n/navigation'
import { RetryPage } from './retry-page'

export function CatalogueState({
  title,
  description,
  action,
  href,
  actionLabel,
  kind = 'empty',
  compact = false,
}: {
  title: string
  description?: string
  action?: ReactNode
  href?: string
  actionLabel?: string
  kind?: 'empty' | 'unavailable'
  compact?: boolean
}) {
  return (
    <div role={kind === 'unavailable' ? 'alert' : undefined}>
      <EmptyState
        title={title}
        description={description}
        className={compact ? 'py-4 sm:py-4' : undefined}
        illustration={compact ? undefined : <StatusMascot pose={kind} />}
        action={
          action ??
          (href && actionLabel ? (
            <Link
              href={href}
              className={buttonVariants({
                variant: 'secondary',
                className: 'min-h-11 rounded-full',
              })}
            >
              {actionLabel}
            </Link>
          ) : undefined)
        }
      />
    </div>
  )
}

export async function CatalogueUnavailable({ fullPage = false }: { fullPage?: boolean }) {
  // Keep an upstream failure out of the prerender cache so a retry can load fresh data.
  await connection()
  const t = await getTranslations('states')
  const notice = (
    <CatalogueState
      title={t('unavailableTitle')}
      description={t('unavailableBody')}
      action={<RetryPage compact={!fullPage} />}
      kind="unavailable"
      compact={!fullPage}
    />
  )
  return fullPage ? <Container className="max-w-lg py-8 sm:py-14">{notice}</Container> : notice
}
