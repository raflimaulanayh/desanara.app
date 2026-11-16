'use client'

import { Button, Card, Chip } from '@heroui/react'
import { Container } from '@repo/ui/components/container'
import { CircleCheck, CircleX, ExternalLink } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { describeApiError } from '@/lib/api-errors'
import { useBusiness } from '@/lib/businesses'
import {
  type Product,
  useDeleteProduct,
  useProduct,
  useProductAction,
  useRefreshProduct,
  useRemoveImage,
  useReorderImages,
} from '@/lib/products'
import { usePhotoUploads } from '@/lib/use-photo-uploads'
import { ConfirmPanel } from '../confirm-panel'
import { PhotoManager } from './photo-manager'
import { ProductForm } from './product-form'

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL?.replace(/\/$/, '')

/** What still blocks publishing, in the order the API checks it (mirrors service.publish). */
export function productChecklist(p: Pick<Product, 'category' | 'images'>) {
  return [
    { id: 'category', ok: Boolean(p.category) },
    { id: 'photo', ok: p.images.length > 0 },
  ] as const
}

export function ProductChips({ p }: { p: Pick<Product, 'status' | 'isAvailable'> }) {
  const t = useTranslations('productStatus')
  return (
    <span className="flex flex-wrap gap-1.5">
      <Chip size="sm" variant="soft" color={p.status === 'published' ? 'success' : 'default'}>
        {p.status === 'published' ? t('published') : t('draft')}
      </Chip>
      {!p.isAvailable ? (
        <Chip size="sm" variant="soft" color="warning">
          {t('soldOut')}
        </Chip>
      ) : null}
    </span>
  )
}

function PhotosCard({ p }: { p: Product }) {
  const t = useTranslations()
  const refresh = useRefreshProduct(p.id)
  const uploads = usePhotoUploads({
    productId: p.id,
    savedCount: p.images.length,
    onUploaded: refresh,
  })
  const reorder = useReorderImages(p.id)
  const remove = useRemoveImage(p.id)
  const [error, setError] = useState<string | null>(null)

  return (
    <Card>
      <Card.Header>
        <Card.Title className="text-xl font-extrabold">{t('productForm.photosTitle')}</Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-3">
        <PhotoManager
          saved={p.images}
          uploads={uploads}
          canEdit={p.permissions.update}
          busy={reorder.isPending || remove.isPending}
          onReorder={async (order) => {
            setError(null)
            try {
              await reorder.mutateAsync(order)
            } catch (e) {
              setError(describeApiError(e, t).message)
            }
          }}
          onRemove={async (photo) => {
            try {
              await remove.mutateAsync(photo.key)
            } catch (e) {
              throw new Error(describeApiError(e, t).message)
            }
          }}
        />
        {error ? (
          <p role="alert" className="text-danger text-sm font-medium">
            {error}
          </p>
        ) : null}
      </Card.Content>
    </Card>
  )
}

export function ProductPage({ id }: { id: string }) {
  const t = useTranslations()
  const router = useRouter()
  const q = useProduct(id)
  const business = useBusiness(q.data?.business.id ?? '')
  const action = useProductAction(id)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState<{ kind: 'error' | 'ok'; text: string } | null>(null)
  const remove = useDeleteProduct({
    id,
    business: q.data?.business ?? { id: '', slug: '', name: '' },
  })

  if (q.isPending) return <Container className="py-10 text-sm">{t('common.loading')}</Container>
  if (q.isError) {
    return (
      <Container className="flex flex-col items-start gap-3 py-10">
        <p role="alert">{describeApiError(q.error, t).message}</p>
        <Link href="/businesses" className="text-accent font-semibold">
          {t('businessDetail.backToList')}
        </Link>
      </Container>
    )
  }

  const p = q.data
  const checklist = productChecklist(p)
  const ready = checklist.every((c) => c.ok)
  const businessHidden = business.data && business.data.status !== 'published'

  async function run(type: 'publish' | 'unpublish', ok: string) {
    setMessage(null)
    try {
      await action.mutateAsync(type)
      setMessage({ kind: 'ok', text: ok })
    } catch (e) {
      const d = describeApiError(e, t)
      if (d.sessionExpired) return router.replace('/login')
      setMessage({ kind: 'error', text: d.message })
    }
  }

  return (
    <Container className="flex max-w-3xl flex-col gap-5 py-6 sm:py-10">
      <Link
        href={`/businesses/${p.business.id}`}
        className="text-muted text-sm font-semibold hover:underline"
      >
        ← {p.business.name}
      </Link>

      <header className="min-w-0">
        <h1 className="text-2xl font-extrabold break-words sm:text-3xl">{p.name}</h1>
        <div className="mt-3">
          <ProductChips p={p} />
        </div>
      </header>

      {message ? (
        <p
          role={message.kind === 'error' ? 'alert' : 'status'}
          className={`text-sm font-medium ${message.kind === 'error' ? 'text-danger' : 'text-success'}`}
        >
          {message.text}
        </p>
      ) : null}

      <Card>
        <Card.Header>
          <Card.Title className="font-bold">{t('productDetail.publishTitle')}</Card.Title>
          <Card.Description>
            {p.status === 'published'
              ? t('productDetail.isPublished')
              : t('productDetail.publishHint')}
          </Card.Description>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          <ul className="flex flex-col gap-2">
            {checklist.map((c) => (
              <li key={c.id} className="flex items-center gap-2 text-sm">
                {c.ok ? (
                  <CircleCheck className="text-success size-5 shrink-0" aria-hidden />
                ) : (
                  <CircleX className="text-danger size-5 shrink-0" aria-hidden />
                )}
                <span>
                  <span className="sr-only">
                    {c.ok ? t('businessDetail.done') : t('businessDetail.missing')}:{' '}
                  </span>
                  {t(`productDetail.check.${c.id}`)}
                </span>
              </li>
            ))}
          </ul>
          {businessHidden ? (
            <p className="bg-wash rounded-xl p-3 text-sm">{t('productDetail.businessHidden')}</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {p.permissions.publish && p.status !== 'published' ? (
              <Button
                isDisabled={!ready}
                isPending={action.isPending}
                onPress={() => run('publish', t('productDetail.published'))}
              >
                {t('productDetail.publish')}
              </Button>
            ) : null}
            {p.permissions.publish && p.status === 'published' ? (
              <Button
                variant="secondary"
                isPending={action.isPending}
                onPress={() => run('unpublish', t('productDetail.unpublished'))}
              >
                {t('productDetail.unpublish')}
              </Button>
            ) : null}
            {p.status === 'published' && !businessHidden && WEB_URL ? (
              <a
                href={`${WEB_URL}/produk/${p.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent inline-flex h-10 items-center gap-1 px-2 text-sm font-semibold hover:underline"
              >
                {t('productDetail.viewPublic')}
                <ExternalLink className="size-4" aria-hidden />
              </a>
            ) : null}
          </div>
        </Card.Content>
      </Card>

      <PhotosCard p={p} />

      {p.permissions.update ? (
        // keyed by id: the form keeps what is being typed while photos change the row
        <ProductForm key={p.id} businessId={p.business.id} product={p} />
      ) : null}

      {p.permissions.delete ? (
        <Card className="border-danger/30 border">
          <Card.Header>
            <Card.Title className="font-bold">{t('productDetail.dangerTitle')}</Card.Title>
          </Card.Header>
          <Card.Content>
            {deleting ? (
              <ConfirmPanel
                title={t('productDetail.deleteTitle', { name: p.name })}
                danger
                confirm={t('productDetail.delete')}
                pending={remove.isPending}
                onCancel={() => setDeleting(false)}
                onConfirm={async () => {
                  try {
                    await remove.mutateAsync()
                    router.replace(`/businesses/${p.business.id}`)
                  } catch (e) {
                    setMessage({ kind: 'error', text: describeApiError(e, t).message })
                  }
                }}
              />
            ) : (
              <Button variant="danger-soft" onPress={() => setDeleting(true)}>
                {t('productDetail.delete')}
              </Button>
            )}
          </Card.Content>
        </Card>
      ) : null}
    </Container>
  )
}
