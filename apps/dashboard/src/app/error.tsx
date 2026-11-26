'use client'

import { Container } from '@repo/ui/components/container'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { QueryProblem } from '@/components/query-feedback'

export default function ErrorPage({ retry }: { retry: () => void }) {
  const t = useTranslations('states')
  return (
    <main>
      <Container className="max-w-lg py-8 sm:py-14">
        <QueryProblem
          title={t('errorTitle')}
          description={t('errorBody')}
          onRetry={retry}
          action={
            <Link
              href="/"
              className="text-accent inline-flex min-h-11 items-center px-2 font-semibold hover:underline"
            >
              {t('home')}
            </Link>
          }
        />
      </Container>
    </main>
  )
}
