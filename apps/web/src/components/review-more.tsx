'use client'

import { Button } from '@heroui/react'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'
import { ReviewItem, type ReviewItemData } from './review-item'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.desanara.app'

/**
 * "Show more reviews": fetches the next pages straight from the public API (cached at the edge for a
 * few minutes) and appends them under the server-rendered first page.
 */
export function ReviewMore({
  slug,
  total,
  pageSize,
  businessName,
}: {
  slug: string
  total: number
  pageSize: number
  businessName: string
}) {
  const t = useTranslations('reviews')
  const locale = useLocale()
  const [items, setItems] = useState<ReviewItemData[]>([])
  const [page, setPage] = useState(1)
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle')
  const shown = pageSize + items.length

  async function loadMore() {
    setState('loading')
    try {
      const res = await fetch(
        `${API}/v1/products/${encodeURIComponent(slug)}/reviews?page=${page + 1}&pageSize=${pageSize}`,
      )
      if (!res.ok) throw new Error(String(res.status))
      const body = (await res.json()) as { data: ReviewItemData[] }
      setItems((current) => [...current, ...body.data])
      setPage((current) => current + 1)
      setState('idle')
    } catch {
      setState('error')
    }
  }

  return (
    <>
      {items.length ? (
        <ul className="divide-line border-line mt-5 divide-y border-t pt-5">
          {items.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              locale={locale}
              starsLabel={t('starsLabel', { rating: review.rating })}
              replyLabel={t('sellerReply', { business: businessName })}
            />
          ))}
        </ul>
      ) : null}
      {shown < total ? (
        <div className="mt-6">
          <Button
            variant="secondary"
            onPress={loadMore}
            isPending={state === 'loading'}
            className="border-line-strong bg-surface hover:bg-wash min-h-11 w-full rounded-full border font-semibold sm:w-auto sm:px-6"
          >
            {state === 'loading' ? t('loading') : t('more')}
          </Button>
          {state === 'error' ? (
            <p role="alert" className="text-danger mt-2 text-sm">
              {t('loadFailed')}
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  )
}
