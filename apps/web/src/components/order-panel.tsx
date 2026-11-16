'use client'

import { formatRupiah } from '@repo/i18n'
import { Minus, Plus } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useId, useState } from 'react'
import { track } from '@/lib/track'
import { buildOrderMessage, orderLink } from '@/lib/whatsapp'
import { WhatsAppIcon } from './whatsapp-icon'

/**
 * Quantity + optional note, then one clear action: open WhatsApp with the order written out.
 * On phones the price and button stick to the bottom so the action is always one tap away.
 */
export function OrderPanel({
  product,
  businessName,
  businessSlug,
  villageName,
  whatsappNumber,
  productUrl,
  available,
}: {
  product: {
    slug: string
    name: string
    price: number
    compareAtPrice: number | null
  }
  businessName: string
  businessSlug: string
  villageName: string
  whatsappNumber: string | null
  productUrl: string
  available: boolean
}) {
  const t = useTranslations('order')
  const locale = useLocale()
  const tp = useTranslations('product')
  const fmt = (n: number) => (n === 0 ? tp('free') : formatRupiah(n, locale === 'en' ? 'en' : 'id'))
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState('')
  const ids = { qty: useId(), note: useId() }
  const total = product.price * quantity

  if (!whatsappNumber) {
    return <p className="bg-wash text-muted rounded-(--radius) p-4 text-sm">{t('noWhatsApp')}</p>
  }

  const message = buildOrderMessage({
    businessName,
    villageName,
    line: {
      name: product.name,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      quantity,
    },
    note: note.trim() || undefined,
    productUrl,
  })

  return (
    <div>
      {available ? (
        <div className="border-line rounded-(--radius) border p-4">
          <div className="flex items-center justify-between gap-4">
            <label htmlFor={ids.qty} className="text-sm font-semibold">
              {t('quantity')}
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label={t('decrease')}
                disabled={quantity <= 1}
                className="border-line-strong hover:bg-wash grid size-11 place-items-center rounded-full border transition-colors disabled:opacity-40"
              >
                <Minus className="size-4" aria-hidden />
              </button>
              <input
                id={ids.qty}
                inputMode="numeric"
                value={quantity}
                onChange={(e) => {
                  const n = Number.parseInt(e.target.value.replace(/\D/g, ''), 10)
                  setQuantity(Number.isFinite(n) ? Math.min(999, Math.max(1, n)) : 1)
                }}
                className="h-11 w-14 bg-transparent text-center text-lg font-bold tabular-nums"
              />
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(999, q + 1))}
                aria-label={t('increase')}
                className="border-line-strong hover:bg-wash grid size-11 place-items-center rounded-full border transition-colors"
              >
                <Plus className="size-4" aria-hidden />
              </button>
            </div>
          </div>
          <label htmlFor={ids.note} className="mt-4 block text-sm font-semibold">
            {t('note')}
          </label>
          <textarea
            id={ids.note}
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 300))}
            placeholder={t('noteHint')}
            rows={2}
            className="border-line-strong placeholder:text-muted/80 focus:border-accent mt-1.5 w-full resize-none rounded-lg border bg-transparent px-3 py-2 text-base focus:outline-none"
          />
          <p className="text-muted mt-3 text-xs">{t('sendHint')}</p>
        </div>
      ) : (
        <p role="status" className="bg-wash text-muted rounded-(--radius) p-4 text-sm font-medium">
          {t('unavailable')}
        </p>
      )}

      {/* Sticky on phones (reserve space with pb on the page), in flow on desktop */}
      <div className="border-line bg-surface/95 fixed inset-x-0 bottom-0 z-30 border-t px-4 py-3 backdrop-blur-sm lg:static lg:mt-4 lg:border-0 lg:bg-transparent lg:p-0">
        <div className="mx-auto flex max-w-6xl items-center gap-4 lg:max-w-none">
          <div className="lg:hidden">
            <p className="text-muted text-xs">{t('total')}</p>
            <p className="text-lg leading-tight font-extrabold tabular-nums" aria-live="polite">
              {fmt(total)}
            </p>
          </div>
          {available ? (
            <a
              href={orderLink(whatsappNumber, message)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                track({ type: 'whatsapp_click', productSlug: product.slug, businessSlug, locale })
              }
              className="bg-wa hover:bg-wa-hover flex h-13 flex-1 items-center justify-center gap-2 rounded-full px-6 text-base font-bold text-white transition-colors"
            >
              <WhatsAppIcon className="size-5" />
              {t('send')}
              <span className="hidden tabular-nums lg:inline">· {fmt(total)}</span>
            </a>
          ) : (
            <span className="bg-wash-strong text-muted flex h-13 flex-1 items-center justify-center rounded-full px-6 text-base font-bold">
              {t('unavailableButton')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
