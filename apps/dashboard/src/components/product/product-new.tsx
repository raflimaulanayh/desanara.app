'use client'

import { can } from '@repo/auth/permissions'
import { Container } from '@repo/ui/components/container'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { describeApiError } from '@/lib/api-errors'
import { useBusiness } from '@/lib/businesses'
import { useSession } from '@/lib/session'
import { ProductForm } from './product-form'

/** "Tambah produk" for one business. The API checks `product.create` again on save. */
export function ProductNew({ businessId }: { businessId: string }) {
  const t = useTranslations()
  const { actor } = useSession()
  const q = useBusiness(businessId)
  const allowed =
    q.data &&
    can(actor, 'product.create', {
      type: 'business',
      businessId,
      villageId: q.data.village.id,
    })

  return (
    <Container className="flex max-w-3xl flex-col gap-4 py-6 sm:py-10">
      <Link
        href={`/businesses/${businessId}`}
        className="text-muted text-sm font-semibold hover:underline"
      >
        ← {q.data?.name ?? t('businessDetail.backToList')}
      </Link>
      <h1 className="text-2xl font-extrabold sm:text-3xl">{t('productForm.newTitle')}</h1>
      {q.isPending ? (
        <p className="text-sm">{t('common.loading')}</p>
      ) : q.isError ? (
        <p role="alert">{describeApiError(q.error, t).message}</p>
      ) : !allowed ? (
        <p role="alert">{t('errors.forbidden')}</p>
      ) : (
        <ProductForm businessId={businessId} />
      )}
    </Container>
  )
}
