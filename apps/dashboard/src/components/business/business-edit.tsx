'use client'

import { Container } from '@repo/ui/components/container'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { describeApiError } from '@/lib/api-errors'
import { useBusiness } from '@/lib/businesses'
import { BusinessForm } from './business-form'

export function BusinessEdit({ id }: { id: string }) {
  const t = useTranslations()
  const q = useBusiness(id)
  return (
    <Container className="flex max-w-2xl flex-col gap-4 py-6 sm:py-10">
      <Link href={`/businesses/${id}`} className="text-muted text-sm font-semibold hover:underline">
        ← {q.data?.name ?? t('businessDetail.backToList')}
      </Link>
      <h1 className="text-2xl font-extrabold sm:text-3xl">{t('businessForm.editTitle')}</h1>
      {q.isPending ? (
        <p className="text-sm">{t('common.loading')}</p>
      ) : q.isError ? (
        <p role="alert">{describeApiError(q.error, t).message}</p>
      ) : !q.data.permissions.update ? (
        <p role="alert">{t('errors.forbidden')}</p>
      ) : (
        // keyed by the row's update time: a newer version from the server resets the form
        <BusinessForm key={q.data.updatedAt} business={q.data} />
      )}
    </Container>
  )
}
