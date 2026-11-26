'use client'

import { Card } from '@heroui/react'
import { can } from '@repo/auth/permissions'
import { formatRupiah } from '@repo/i18n'
import { EmptyState } from '@repo/ui/components/empty-state'
import { StatusMascot } from '@repo/ui/components/status-mascot'
import { ImageOff, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import { LoadMore, QueryFeedback } from '@/components/query-feedback'
import {
  DashboardProductRowsSkeleton,
  dashboardProductRowLayout,
} from '@/components/dashboard-skeletons'
import { readableData } from '@/lib/api-errors'
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
  const products = readableData(q)?.pages.flatMap((page) => page.data) ?? []

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
        <QueryFeedback query={q} loading={<DashboardProductRowsSkeleton />} />
        {q.isSuccess && products.length === 0 ? (
          <EmptyState
            title={t('productList.empty')}
            illustration={<StatusMascot pose="empty" />}
            description={canCreate ? t('productList.emptyHint') : undefined}
            className="py-6"
          />
        ) : null}
        <ul className="flex flex-col">
          {products.map((p) => {
            const cover = mediaUrl(p.images[0]?.key)
            return (
              <li key={p.id} className="border-line border-b last:border-0">
                <Link
                  href={`/products/${p.id}`}
                  className={`${dashboardProductRowLayout} hover:bg-wash`}
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
        <LoadMore query={q} label={t('productList.more')} />
      </Card.Content>
    </Card>
  )
}
