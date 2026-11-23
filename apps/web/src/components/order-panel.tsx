'use client'

import { Button, Disclosure, Label, Link, NumberField, TextArea, TextField } from '@heroui/react'
import { formatRupiah } from '@repo/i18n'
import { useLocale, useTranslations } from 'next-intl'
import { useId, useState } from 'react'
import { track } from '@/lib/track'
import { buildOrderMessage, orderLink } from '@/lib/whatsapp'
import { WhatsAppIcon } from './whatsapp-icon'

/**
 * Quantity + optional note, then one clear action: open WhatsApp with the order written out.
 * The main action is visible before the optional quantity and note fields.
 */
export function OrderPanel({
  product,
  businessName,
  businessSlug,
  villageName,
  whatsappNumber,
  productUrl,
  available,
  preview = false,
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
  preview?: boolean
}) {
  const t = useTranslations('order')
  const locale = useLocale()
  const tp = useTranslations('product')
  const fmt = (n: number) => (n === 0 ? tp('free') : formatRupiah(n, locale === 'en' ? 'en' : 'id'))
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const messageId = useId()
  const total = product.price * quantity

  if (!whatsappNumber && !preview) {
    return <p className="bg-wash text-muted rounded-(--radius) p-4 text-sm">{t('noWhatsApp')}</p>
  }

  if (!available) {
    return (
      <p role="status" className="bg-wash text-muted rounded-(--radius) p-4 text-sm font-medium">
        {t('unavailable')}
      </p>
    )
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

  const actionClass =
    'bg-wa hover:bg-wa-hover inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-3 text-center text-sm font-bold text-white no-underline'
  const actionLabel = (
    <>
      <WhatsAppIcon className="size-5 shrink-0" />
      {t('send')}
    </>
  )

  return (
    <div>
      {preview ? (
        <Button
          type="button"
          variant="primary"
          size="sm"
          className={actionClass}
          aria-controls={messageId}
          aria-expanded={showPreview}
          onPress={() => setShowPreview((shown) => !shown)}
        >
          {actionLabel}
        </Button>
      ) : whatsappNumber ? (
        <Link
          href={orderLink(whatsappNumber, message)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            track({ type: 'whatsapp_click', productSlug: product.slug, businessSlug, locale })
          }
          className={actionClass}
        >
          {actionLabel}
        </Link>
      ) : null}

      <Disclosure className="mt-1">
        <Disclosure.Heading>
          <Disclosure.Trigger className="text-muted flex min-h-9 w-full items-center justify-between gap-2 text-sm font-semibold">
            {t('options')}
            <Disclosure.Indicator />
          </Disclosure.Trigger>
        </Disclosure.Heading>
        <Disclosure.Content>
          <div className="border-line flex flex-col gap-3 rounded-xl border p-3">
            <NumberField
              minValue={1}
              maxValue={999}
              formatOptions={{ maximumFractionDigits: 0 }}
              value={quantity}
              onChange={(value) =>
                setQuantity(Number.isFinite(value) ? Math.min(999, Math.max(1, value)) : 1)
              }
              className="flex-row items-center justify-between gap-3"
            >
              <Label>{t('quantity')}</Label>
              <NumberField.Group className="w-28 rounded-lg">
                <NumberField.DecrementButton aria-label={t('decrease')} />
                <NumberField.Input className="min-w-0 px-0 text-center text-base tabular-nums" />
                <NumberField.IncrementButton aria-label={t('increase')} />
              </NumberField.Group>
            </NumberField>
            <TextField value={note} onChange={setNote}>
              <Label>{t('note')}</Label>
              <TextArea
                placeholder={t('noteHint')}
                rows={2}
                maxLength={300}
                className="min-h-0 rounded-lg py-1.5 text-base"
              />
            </TextField>
            {preview ? null : <p className="text-muted text-xs">{t('sendHint')}</p>}
          </div>
        </Disclosure.Content>
      </Disclosure>
      <p className="text-accent mt-2 text-sm font-bold tabular-nums" aria-live="polite">
        {quantity > 1 ? `${t('total')} · ${fmt(total)}` : null}
      </p>
      {preview ? (
        <section
          id={messageId}
          hidden={!showPreview}
          className="bg-wash mt-2 rounded-xl p-4 text-sm"
        >
          <h2 className="font-bold">{t('previewTitle')}</h2>
          <p className="mt-2 wrap-break-word whitespace-pre-wrap">{message}</p>
        </section>
      ) : null}
    </div>
  )
}
