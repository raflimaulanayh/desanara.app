'use client'

import { Button, Card } from '@heroui/react'
import { can } from '@repo/auth/permissions'
import { formatRupiah } from '@repo/i18n'
import { ImageOff, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import type { Business } from '@/lib/businesses'
import { mediaUrl } from '@/lib/media'
import { type Product, useProductList } from '@/lib/products'
import { useSession } from '@/lib/session'
import { ProductChips } from './product-page'

function PriceText({ p }: { p: Pick<Product, 'price' | 'compareAtPrice' | 'isFree'> }) {
  const t = useTranslations()
  return (
    <span className="text-sm font-bold tabular-nums">
      {p.isFree ? t('productForm.isFree') : formatRupiah(p.price)}
      {p.compareAtPrice ? (
        <s className="text-muted ml-1.5 text-xs font-normal">{formatRupiah(p.compareAtPrice)}</s>
      ) : null}
    </span>
  )
}

/** Products of one business, on its detail page: cover, name, price, status; tap to open. */
export function ProductSection({ business }: { business: Business }) {
  const t = useTranslations()
  const { actor } = useSession()
  const q = useProductList(business.id)
  const canCreate = can(actor, 'product.create', {
    type: 'business',
    businessId: business.id,
    villageId: business.village.id,
  })
  const products = q.data?.pages.flatMap((page) => page.data) ?? []

  return (
    <Card>
      <Card.Header className="flex flex-row items-center justify-between gap-3">
        <div>
          <Card.Title className="font-bold">{t('productList.title')}</Card.Title>
          <Card.Description>
            {t('businessList.products', { count: business.productCount })}
          </Card.Description>
        </div>
        {canCreate ? (
          <Link
            href={`/businesses/${business.id}/products/new`}
            className="bg-accent text-accent-foreground inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-bold"
          >
            <Plus className="size-4" aria-hidden />
            {t('productList.add')}
          </Link>
        ) : null}
      </Card.Header>
      <Card.Content className="flex flex-col gap-2">
        {q.isPending ? <p className="text-sm">{t('common.loading')}</p> : null}
        {q.isError ? <p role="alert">{t('errors.generic')}</p> : null}
        {q.isSuccess && products.length === 0 ? (
          <div className="bg-wash rounded-xl p-4 text-sm">
            <p className="font-semibold">{t('productList.empty')}</p>
            {canCreate ? <p className="text-muted mt-1">{t('productList.emptyHint')}</p> : null}
          </div>
        ) : null}
        <ul className="flex flex-col">
          {products.map((p) => {
            const cover = mediaUrl(p.images[0]?.key)
            return (
              <li key={p.id} className="border-line border-b last:border-0">
                <Link
                  href={`/products/${p.id}`}
                  className="hover:bg-wash -mx-2 flex items-center gap-3 rounded-xl p-2"
                >
                  <span className="bg-wash relative size-16 shrink-0 overflow-hidden rounded-lg">
                    {cover ? (
                      <Image
                        src={cover}
                        alt=""
                        fill
                        unoptimized
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <ImageOff className="text-muted absolute inset-0 m-auto size-5" aria-hidden />
                    )}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="truncate text-sm font-semibold">{p.name}</span>
                    <PriceText p={p} />
                    <ProductChips p={p} />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
        {q.hasNextPage ? (
          <Button
            variant="secondary"
            className="self-center"
            isPending={q.isFetchingNextPage}
            onPress={() => q.fetchNextPage()}
          >
            {t('productList.more')}
          </Button>
        ) : null}
      </Card.Content>
    </Card>
  )
}
