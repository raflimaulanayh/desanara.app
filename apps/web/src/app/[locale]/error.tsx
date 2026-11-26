'use client'

import { Container } from '@repo/ui/components/container'
import { EmptyState } from '@repo/ui/components/empty-state'
import { StatusMascot } from '@repo/ui/components/status-mascot'
import { useTranslations } from 'next-intl'
import { RetryPage } from '@/components/retry-page'
import { Link } from '@/i18n/navigation'

export default function ErrorPage({ retry }: { retry: () => void }) {
  const t = useTranslations('states')
  const notFound = useTranslations('notFound')

  return (
    <Container className="max-w-lg py-8 sm:py-14">
      <div role="alert">
        <EmptyState
          title={t('errorTitle')}
          description={t('errorBody')}
          illustration={<StatusMascot pose="unavailable" />}
          action={<RetryPage onRetry={retry} />}
        />
      </div>
      <Link
        href="/"
        className="text-accent mt-3 inline-flex min-h-11 items-center text-sm font-semibold hover:underline"
      >
        {notFound('back')}
      </Link>
    </Container>
  )
}
