'use client'

import { Label, NumberField, TextArea, TextField } from '@heroui/react'
import { formatRupiah } from '@repo/i18n'
import { cn } from '@repo/ui/cn'
import { ArrowRight, CheckCheck, SendHorizontal } from 'lucide-react'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { useState, type ReactNode } from 'react'
import { buildOrderMessage } from '@/lib/whatsapp'

/** A small numbered label that ties a control to the step it stands for. */
function Step({
  n,
  children,
  tone = 'dark',
}: {
  n: number
  children: ReactNode
  tone?: 'dark' | 'light'
}) {
  return (
    <span
      className={cn(
        'flex items-center gap-2 text-xs font-semibold',
        tone === 'dark' ? 'text-[var(--muted)]' : 'text-white/75',
      )}
    >
      <span
        className={cn(
          'grid size-5 place-items-center rounded-full text-[0.6875rem] tabular-nums',
          tone === 'dark' ? 'bg-accent-soft text-accent' : 'bg-white/15 text-white',
        )}
      >
        {n}
      </span>
      {children}
    </span>
  )
}

/**
 * Try-it-yourself order (PLAN-about-page §3.3, section 3): the same message builder as the product
 * page, shown as a WhatsApp bubble that updates as the visitor types. Lines that change flash in sun
 * yellow so the effect of each control is obvious. It never opens WhatsApp.
 */
export function OrderSimulator({
  product,
  productUrl,
  imageUrl,
}: {
  product: {
    name: string
    displayName: string
    price: number
    businessName: string
    villageName: string
  }
  productUrl: string
  imageUrl: string | null
}) {
  const t = useTranslations('about.order')
  const locale = useLocale() === 'en' ? 'en' : 'id'
  const [quantity, setQuantity] = useState(2)
  const [note, setNote] = useState('')
  const message = buildOrderMessage({
    businessName: product.businessName,
    villageName: product.villageName,
    lines: [{ name: product.name, price: product.price, quantity }],
    note: note.trim() || undefined,
    productUrl,
  })

  return (
    <div className="grid items-center gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.1fr)] lg:gap-6">
      <div className="bg-surface text-foreground rounded-(--radius) p-5 sm:p-6">
        <div className="flex gap-4">
          <div className="bg-wash relative size-20 shrink-0 overflow-hidden rounded-(--radius-compact) sm:size-24">
            {imageUrl ? (
              <Image src={imageUrl} alt="" fill sizes="96px" className="object-cover" />
            ) : null}
          </div>
          <div className="min-w-0 self-center">
            <p className="leading-snug font-semibold">{product.displayName}</p>
            <p className="text-muted mt-0.5 text-sm">
              {product.businessName}, {product.villageName}
            </p>
            <p className="text-accent mt-1.5 font-semibold tabular-nums">
              {formatRupiah(product.price, locale)}
            </p>
          </div>
        </div>
        <div className="border-line mt-5 flex flex-col gap-4 border-t pt-5">
          <NumberField
            minValue={1}
            maxValue={99}
            formatOptions={{ maximumFractionDigits: 0 }}
            value={quantity}
            onChange={(value) =>
              setQuantity(Number.isFinite(value) ? Math.min(99, Math.max(1, value)) : 1)
            }
            className="flex-row items-center justify-between gap-3"
          >
            <Label>
              <Step n={1}>{t('step1')}</Step>
            </Label>
            <NumberField.Group className="w-32 rounded-(--radius-compact)">
              <NumberField.DecrementButton aria-label={t('decrease')} className="min-h-11" />
              <NumberField.Input className="min-w-0 px-0 text-center text-base tabular-nums" />
              <NumberField.IncrementButton aria-label={t('increase')} className="min-h-11" />
            </NumberField.Group>
          </NumberField>
          <TextField value={note} onChange={setNote}>
            <Label>
              <Step n={2}>{t('step2')}</Step>
            </Label>
            <TextArea
              placeholder={t('noteHint')}
              rows={2}
              maxLength={120}
              className="mt-1 min-h-0 rounded-(--radius-compact) py-1.5 text-base"
            />
          </TextField>
          <p className="bg-wash flex items-baseline justify-between rounded-(--radius-compact) px-4 py-3">
            <span className="text-muted text-sm font-semibold">{t('total')}</span>
            <span className="text-lg font-semibold tabular-nums" aria-live="polite">
              {formatRupiah(product.price * quantity, locale)}
            </span>
          </p>
        </div>
      </div>

      <span
        aria-hidden
        className="bg-sprout text-forest mx-auto grid size-11 rotate-90 place-items-center rounded-full lg:rotate-0"
      >
        <ArrowRight className="size-5" />
      </span>

      <div>
        <figure
          aria-label={t('chatLabel')}
          className="overflow-hidden rounded-(--radius) bg-[#efeae2] text-[#111b21]"
        >
          <div className="bg-wa flex items-center gap-3 px-4 py-3 text-white">
            <span
              aria-hidden
              className="text-wa grid size-10 shrink-0 place-items-center rounded-full bg-white/90 text-sm font-semibold"
            >
              {product.businessName.charAt(0)}
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold">{product.businessName}</p>
              <p className="truncate text-xs text-white/80">{product.villageName}</p>
            </div>
          </div>
          <div className="flex min-h-80 flex-col justify-end px-3 py-5 sm:px-5">
            <div className="relative ml-auto max-w-[92%] rounded-(--radius-compact) rounded-tr-sm bg-[#d9fdd3] px-3 pt-2 pb-5 text-[0.8125rem] leading-relaxed sm:max-w-[86%]">
              <p className="wrap-break-word whitespace-pre-wrap">
                {message.split('\n').map((line, i) => (
                  <span
                    // A changed line gets a new key, remounts and plays the flash once.
                    key={`${i}:${line}`}
                    className="about-flash block min-h-[1lh]"
                  >
                    {line}
                  </span>
                ))}
              </p>
              <span
                aria-hidden
                className="absolute right-2 bottom-1 flex items-center gap-1 text-[0.6875rem] text-[#667781]"
              >
                10.21
                <CheckCheck className="size-3.5 text-[#53bdeb]" />
              </span>
            </div>
          </div>
          <div aria-hidden className="flex items-center gap-2 bg-[#f0f2f5] px-3 py-2.5">
            <span className="flex-1 rounded-full bg-white px-4 py-2 text-sm text-[#667781]">
              {t('typing')}
            </span>
            <span className="bg-wa grid size-10 shrink-0 place-items-center rounded-full text-white">
              <SendHorizontal className="size-4" />
            </span>
          </div>
        </figure>
        <div className="mt-3 flex justify-center lg:justify-start">
          <Step n={3} tone="light">
            {t('step3')}
          </Step>
        </div>
      </div>
    </div>
  )
}
