'use client'

import { Container } from '@repo/ui/components/container'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { QueryFeedback, QueryProblem } from '@/components/query-feedback'
import { BusinessFormSkeleton } from '@/components/dashboard-skeletons'
import { readableData } from '@/lib/api-errors'
import { useBusiness } from '@/lib/businesses'
import { BusinessForm } from './business-form'

export function BusinessEdit({ id }: { id: string }) {
  const t = useTranslations()
  const q = useBusiness(id)
  const business = readableData(q)
  return (
    <Container className="flex max-w-2xl flex-col gap-4 py-6 sm:py-10">
      <Link
        href={business ? `/businesses/${id}` : '/businesses'}
        className="text-muted text-sm font-semibold hover:underline"
      >
        ← {business?.name ?? t('businessDetail.backToList')}
      </Link>
      <h1 className="text-2xl font-extrabold sm:text-3xl">{t('businessForm.editTitle')}</h1>
      <QueryFeedback
        query={q}
        loading={<BusinessFormSkeleton />}
        backHref="/businesses"
        backLabel={t('businessDetail.backToList')}
      />
      {business ? (
        business.permissions.update ? (
          // keyed by the row's update time: a newer version from the server resets the form
          <BusinessForm key={business.updatedAt} business={business} />
        ) : (
          <QueryProblem title={t('states.forbiddenTitle')} description={t('errors.forbidden')} />
        )
      ) : null}
    </Container>
  )
}
