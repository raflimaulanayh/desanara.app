'use client'

import { formatRupiah } from '@repo/i18n'
import { Minus, Plus, Send } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useId, useState } from 'react'
import { track } from '@/lib/track'
import { buildOrderMessage, orderLink } from '@/lib/whatsapp'
import { Stamp } from './stamp'

/**
 * The signature interaction: the buyer writes an order on a carbon-copy nota, then sends it to the
 * maker on WhatsApp. On send the nota is stamped TERKIRIM (one authored motion, skipped under
 * prefers-reduced-motion).
 */
export function OrderSlip({
  product,
  businessName,
  businessSlug,
  villageName,
  whatsappNumber,
  productUrl,
  available,
}: {
  product: { slug: string; name: string; unit: string | null; price: number }
  businessName: string
  businessSlug: string
  villageName: string
  whatsappNumber: string | null
  productUrl: string
  available: boolean
}) {
  const t = useTranslations('order')
  const locale = useLocale()
  const fmt = (n: number) => formatRupiah(n, locale === 'en' ? 'en' : 'id')
  const [quantity, setQuantity] = useState(1)
  const [buyerName, setBuyerName] = useState('')
  const [note, setNote] = useState('')
  const [sent, setSent] = useState(false)
  // Today's date for the nota; may differ from a cached server render, hence suppressHydrationWarning.
  const today = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
  const ids = { qty: useId(), name: useId(), note: useId() }
  const total = product.price * quantity

  if (!whatsappNumber) {
    return (
      <p className="border-nota-rule-strong text-muted border border-dashed p-4 text-sm">
        {t('noWhatsApp')}
      </p>
    )
  }

  const message = buildOrderMessage({
    businessName,
    villageName,
    line: { name: product.name, unit: product.unit, price: product.price, quantity },
    buyerName: buyerName.trim() || undefined,
    note: note.trim() || undefined,
    productUrl,
  })

  return (
    <div className="bg-nota-pink relative border border-t-0 border-[color-mix(in_oklab,var(--nota-pink)_60%,var(--stamp-demo))] p-4 shadow-[0_10px_24px_-14px_rgb(20_26_43/0.35)] sm:p-5">
      {/* Perforation: the slip is torn from the book */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 border-t-[3px] border-dotted border-[color-mix(in_oklab,var(--nota-pink)_40%,var(--foreground))]"
      />
      <div className="border-foreground/60 flex items-baseline justify-between border-b border-dashed pb-2">
        <h2 className="font-print text-foreground text-xl font-bold tracking-[0.06em] uppercase">
          {t('title')}
        </h2>
        <span className="text-muted font-print text-xs tracking-[0.14em] uppercase">
          {t('copy')}
        </span>
      </div>

      <p className="text-muted mt-2 flex flex-wrap justify-between gap-x-4 text-sm">
        <span>
          {t('to')} <strong className="text-foreground font-semibold">{businessName}</strong> ·{' '}
          {villageName}
        </span>
        <span className="tabular-nums" suppressHydrationWarning>
          {t('date', { date: today })}
        </span>
      </p>

      <div className="mt-4 grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3">
        <label
          htmlFor={ids.qty}
          className="font-print text-sm font-semibold tracking-[0.12em] uppercase"
        >
          {t('quantity')}
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label={t('decrease')}
            disabled={quantity <= 1}
            className="border-foreground/40 bg-surface hover:border-foreground grid size-11 place-items-center border transition-colors disabled:opacity-40"
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
            className="border-foreground/40 bg-surface font-print h-11 w-16 border text-center text-lg font-semibold tabular-nums"
          />
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(999, q + 1))}
            aria-label={t('increase')}
            className="border-foreground/40 bg-surface hover:border-foreground grid size-11 place-items-center border transition-colors"
          >
            <Plus className="size-4" aria-hidden />
          </button>
          {product.unit ? <span className="text-muted text-sm">× {product.unit}</span> : null}
        </div>

        <label
          htmlFor={ids.name}
          className="font-print text-sm font-semibold tracking-[0.12em] uppercase"
        >
          {t('name')}
        </label>
        <input
          id={ids.name}
          value={buyerName}
          onChange={(e) => setBuyerName(e.target.value.slice(0, 60))}
          placeholder={t('nameHint')}
          autoComplete="name"
          className="border-foreground/40 placeholder:text-muted/80 h-11 w-full border-b bg-transparent px-1 text-base focus:outline-none focus-visible:border-[var(--accent)]"
        />

        <label
          htmlFor={ids.note}
          className="font-print self-start pt-2 text-sm font-semibold tracking-[0.12em] uppercase"
        >
          {t('note')}
        </label>
        <textarea
          id={ids.note}
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 300))}
          placeholder={t('noteHint')}
          rows={2}
          className="border-foreground/40 placeholder:text-muted/80 w-full resize-none border-b bg-transparent px-1 py-2 text-base focus:outline-none focus-visible:border-[var(--accent)]"
        />
      </div>

      <div className="border-foreground/60 mt-4 flex items-baseline justify-between border-t border-dashed pt-3">
        <span className="font-print text-sm font-semibold tracking-[0.12em] uppercase">
          {t('total')}
        </span>
        <span className="font-print text-2xl font-bold tabular-nums" aria-live="polite">
          {fmt(total)}
        </span>
      </div>

      {available ? (
        <a
          href={orderLink(whatsappNumber, message)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            setSent(true)
            track({ type: 'whatsapp_click', productSlug: product.slug, businessSlug, locale })
          }}
          className="bg-accent text-accent-foreground font-print mt-4 flex h-13 w-full items-center justify-center gap-2 text-lg font-bold tracking-[0.08em] uppercase transition-colors hover:bg-[var(--accent-hover)]"
        >
          <Send className="size-5" aria-hidden />
          {t('send')}
        </a>
      ) : (
        <span
          role="status"
          className="border-foreground/40 text-muted font-print mt-4 flex h-13 w-full items-center justify-center border-2 border-dashed text-lg font-bold tracking-[0.08em] uppercase"
        >
          {t('unavailableButton')}
        </span>
      )}
      <p className="text-muted mt-2 text-center text-xs">
        {available ? t('sendHint') : t('unavailable')}
      </p>

      {sent ? (
        <div
          aria-live="polite"
          className="pointer-events-none absolute inset-x-0 top-16 flex justify-center"
        >
          <Stamp
            tone="accent"
            size="lg"
            rotate={-12}
            className="stamp-press bg-nota-pink/70 text-2xl"
          >
            {t('sent')}
          </Stamp>
        </div>
      ) : null}
    </div>
  )
}
