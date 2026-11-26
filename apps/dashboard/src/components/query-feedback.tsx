'use client'

import { Button } from '@heroui/react'
import { ApiError } from '@repo/api-client'
import { LoadingRegion } from '@repo/ui/components/loading-region'
import { EmptyState } from '@repo/ui/components/empty-state'
import { useOnline } from '@repo/ui/components/offline-notice'
import { StatusMascot } from '@repo/ui/components/status-mascot'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { describeApiError, isReadRestricted } from '@/lib/api-errors'

type ReadQuery = {
  data?: unknown
  error: unknown
  isPending: boolean
  isError: boolean
  isFetching: boolean
  fetchStatus: 'fetching' | 'paused' | 'idle'
  isFetchNextPageError?: boolean
  isFetchingNextPage?: boolean
  refetch: () => Promise<unknown>
}

export function QueryProblem({
  title,
  description,
  onRetry,
  pending = false,
  action,
  compact = false,
}: {
  title?: string
  description?: string
  onRetry?: () => void
  pending?: boolean
  action?: ReactNode
  compact?: boolean
}) {
  const t = useTranslations()
  const online = useOnline()

  return (
    <div role="alert">
      <EmptyState
        title={title ?? t('states.unavailableTitle')}
        description={description}
        className={compact ? 'py-4 sm:py-4' : undefined}
        illustration={compact ? undefined : <StatusMascot pose="unavailable" />}
        action={
          onRetry || action ? (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {onRetry ? (
                <Button
                  variant={compact ? 'secondary' : 'primary'}
                  className="min-h-11 rounded-full px-4 font-semibold"
                  isDisabled={!online}
                  isPending={pending}
                  onPress={onRetry}
                >
                  {t('common.retry')}
                </Button>
              ) : null}
              {action}
            </div>
          ) : undefined
        }
      />
    </div>
  )
}

export function QueryFeedback({
  query,
  label,
  loading,
  backHref,
  backLabel,
  compact = false,
}: {
  query: ReadQuery
  label?: string
  loading?: ReactNode
  backHref?: string
  backLabel?: string
  compact?: boolean
}) {
  const t = useTranslations()
  const pathname = usePathname()
  if (query.fetchStatus === 'paused') {
    return (
      <p role="status" className="text-muted text-sm">
        {t('states.waitingForConnection')}
      </p>
    )
  }
  if (query.isPending) {
    const message = label ?? t('common.loading')
    if (loading === null)
      return (
        <span role="status" className="sr-only">
          {message}
        </span>
      )
    return loading ? (
      <LoadingRegion label={message}>{loading}</LoadingRegion>
    ) : (
      <p role="status" className="text-muted text-sm">
        {message}
      </p>
    )
  }
  const restricted = isReadRestricted(query.error)
  if (query.isError && (!query.isFetchNextPageError || restricted)) {
    const error = query.error
    const expired = error instanceof ApiError && error.status === 401
    const missing = error instanceof ApiError && error.status === 404
    const title = expired
      ? t('states.sessionTitle')
      : missing
        ? t('states.missingTitle')
        : restricted
          ? t('states.forbiddenTitle')
          : undefined
    const href = expired
      ? `/login?next=${encodeURIComponent(pathname)}`
      : restricted
        ? (backHref ?? '/')
        : undefined
    return (
      <QueryProblem
        title={title}
        description={describeApiError(error, t).message}
        onRetry={restricted ? undefined : () => void query.refetch()}
        pending={query.isFetching}
        compact={compact || (!restricted && query.data !== undefined)}
        action={
          href ? (
            <Link
              className="text-accent inline-flex min-h-11 items-center px-2 font-semibold hover:underline"
              href={href}
            >
              {expired ? t('login.submit') : (backLabel ?? t('states.home'))}
            </Link>
          ) : undefined
        }
      />
    )
  }
  if (query.isFetching && !query.isFetchingNextPage) {
    return (
      <p role="status" className="text-muted text-xs">
        {t('states.refreshing')}
      </p>
    )
  }
  return null
}

export function LoadMore({
  query,
  label,
}: {
  query: Pick<ReadQuery, 'isFetching' | 'isFetchingNextPage' | 'isFetchNextPageError' | 'error'> & {
    hasNextPage: boolean
    fetchNextPage: () => Promise<unknown>
  }
  label: string
}) {
  const t = useTranslations()
  const online = useOnline()
  if (!query.hasNextPage || isReadRestricted(query.error)) return null

  return (
    <div className="flex flex-col items-center gap-2">
      {query.isFetchNextPageError ? (
        <p role="alert" className="text-muted text-sm">
          {t('states.moreFailed')}
        </p>
      ) : null}
      <Button
        variant="secondary"
        className="min-h-11"
        isDisabled={!online || (query.isFetching && !query.isFetchingNextPage)}
        isPending={query.isFetchingNextPage}
        onPress={() => void query.fetchNextPage()}
      >
        {query.isFetchNextPageError ? t('common.retry') : label}
      </Button>
    </div>
  )
}
