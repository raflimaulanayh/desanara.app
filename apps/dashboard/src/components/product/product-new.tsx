'use client'

import { can } from '@repo/auth/permissions'
import { Container } from '@repo/ui/components/container'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { QueryFeedback, QueryProblem } from '@/components/query-feedback'
import { ProductFormSkeleton } from '@/components/dashboard-skeletons'
import { readableData } from '@/lib/api-errors'
import { useBusiness } from '@/lib/businesses'
import { useSession } from '@/lib/session'
import { ProductForm } from './product-form'

/** "Tambah produk" for one business. The API checks `product.create` again on save. */
export function ProductNew({ businessId }: { businessId: string }) {
  const t = useTranslations()
  const { actor } = useSession()
  const q = useBusiness(businessId)
  const business = readableData(q)
  const allowed =
    business &&
    can(actor, 'product.create', {
      type: 'business',
      businessId,
      villageId: business.village.id,
    })

  return (
    <Container className="flex max-w-3xl flex-col gap-4 py-6 sm:py-10">
      <Link
        href={business ? `/businesses/${businessId}` : '/businesses'}
        className="text-muted text-sm font-semibold hover:underline"
      >
        ← {business?.name ?? t('businessDetail.backToList')}
      </Link>
      <h1 className="text-2xl font-extrabold sm:text-3xl">{t('productForm.newTitle')}</h1>
      <QueryFeedback
        query={q}
        loading={<ProductFormSkeleton />}
        backHref="/businesses"
        backLabel={t('businessDetail.backToList')}
      />
      {business ? (
        allowed ? (
          <ProductForm businessId={businessId} />
        ) : (
          <QueryProblem title={t('states.forbiddenTitle')} description={t('errors.forbidden')} />
        )
      ) : null}
    </Container>
  )
}
