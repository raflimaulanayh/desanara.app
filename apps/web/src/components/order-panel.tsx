'use client'

import {
  Button,
  Description,
  FieldError,
  Input,
  Label,
  Modal,
  NumberField,
  TextArea,
  TextField,
} from '@heroui/react'
import { formatRupiah } from '@repo/i18n'
import { cn } from '@repo/ui/cn'
import {
  Bike,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  ShieldCheck,
  Store,
  Truck,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useId, useRef, useState, type ReactNode } from 'react'
import { track } from '@/lib/track'
import {
  buildOrderMessage,
  type DeliveryMethod,
  orderLink,
  orderTotal,
  type OrderLine,
} from '@/lib/whatsapp'
import { ProductPhoto } from './product-photo'
import { WhatsAppIcon } from './whatsapp-icon'

export interface OrderProduct {
  slug: string
  name: string
  price: number
  compareAtPrice: number | null
  imageUrl?: string | null
  category?: string | null
}

const BUYER_KEY = 'desanara:buyer'
const DELIVERY: DeliveryMethod[] = ['pickup', 'delivery', 'courier']
const MAX_QUANTITY = 999
const DELIVERY_ICON = { pickup: Store, delivery: Bike, courier: Truck } as const
const sectionTitle = 'text-base font-semibold'
/** Same fill as the search field (HeroUI `secondary`), with the compact corners of the option tiles. */
// Typed text stays 16px (smaller makes iOS zoom in); placeholders are a size smaller.
const field = 'h-11 rounded-(--radius-compact) px-3.5 text-base placeholder:text-sm'
const areaField = 'min-h-20 rounded-(--radius-compact) px-3.5 py-2.5 text-base placeholder:text-sm'

type Saved = { name?: string; delivery?: DeliveryMethod; area?: string }
type Errors = Partial<Record<'name' | 'delivery' | 'area', string>>

function readSaved(): Saved {
  try {
    return JSON.parse(localStorage.getItem(BUYER_KEY) ?? '{}') as Saved
  } catch {
    return {}
  }
}

/**
 * Ordering on the product page (PLAN-product-reviews follow-up): the WhatsApp-green button opens one short
 * step with the items (this product plus others from the same shop), who is ordering and how they want to
 * receive it, and the message that will be sent. Only then WhatsApp opens with everything filled in, so
 * the seller does not have to ask. Name, method and district are remembered on this device only; nothing
 * is sent to Desanara.
 */
export function OrderPanel({
  product,
  otherProducts = [],
  businessName,
  businessSlug,
  villageName,
  whatsappNumber,
  productUrl,
  available,
  preview = false,
}: {
  product: OrderProduct
  /** Available products of the same business that can be added to the same message. */
  otherProducts?: OrderProduct[]
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
  const [open, setOpen] = useState(false)
  const [quantities, setQuantities] = useState<Record<string, number>>({ [product.slug]: 1 })
  const [name, setName] = useState('')
  const [delivery, setDelivery] = useState<DeliveryMethod | null>(null)
  const [area, setArea] = useState('')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [showMessage, setShowMessage] = useState(false)
  const [sent, setSent] = useState(false)
  const deliveryId = useId()
  const rail = useRef<HTMLUListElement>(null)
  const messageId = useId()

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

  const items = [product, ...otherProducts]
  const lines: OrderLine[] = items
    .filter((item) => (quantities[item.slug] ?? 0) > 0)
    .map((item) => ({
      name: item.name,
      price: item.price,
      compareAtPrice: item.compareAtPrice,
      quantity: quantities[item.slug]!,
    }))
  const total = orderTotal(lines)
  const needsArea = delivery === 'delivery' || delivery === 'courier'
  const message = buildOrderMessage({
    businessName,
    villageName,
    lines,
    buyer: name.trim() ? { name, delivery: delivery ?? undefined, area } : undefined,
    note,
    productUrl,
  })

  function setQuantity(slug: string, value: number, min: number) {
    const next = Number.isFinite(value) ? Math.min(MAX_QUANTITY, Math.max(min, value)) : min
    setQuantities((current) => ({ ...current, [slug]: next }))
  }

  function validate(): Errors {
    const next: Errors = {}
    if (name.trim().length < 2) next.name = t('errorName')
    if (!delivery) next.delivery = t('errorDelivery')
    if (needsArea && area.trim().length < 3) next.area = t('errorArea')
    return next
  }

  function send() {
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length) return
    try {
      localStorage.setItem(
        BUYER_KEY,
        JSON.stringify({
          name: name.trim(),
          delivery: delivery ?? undefined,
          area: area.trim(),
        } satisfies Saved),
      )
    } catch {
      // Storage blocked: the form simply starts empty next time.
    }
    if (preview || !whatsappNumber) {
      setShowMessage(true)
      return
    }
    track({ type: 'whatsapp_click', productSlug: product.slug, businessSlug, locale })
    window.open(orderLink(whatsappNumber, message), '_blank', 'noopener,noreferrer')
    setSent(true)
  }

  const waClass =
    'bg-wa hover:bg-wa-hover inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-3 text-center text-sm font-bold text-white'

  return (
    <div>
      <Button
        type="button"
        onPress={() => {
          // Prefill from the last order on this device (only empty fields).
          const saved = readSaved()
          setName((current) => current || saved.name || '')
          setDelivery((current) => current ?? saved.delivery ?? null)
          setArea((current) => current || saved.area || '')
          setSent(false)
          setOpen(true)
        }}
        className={waClass}
      >
        <WhatsAppIcon className="size-5 shrink-0" />
        {t('send')}
      </Button>
      <p className="text-muted mt-2 text-xs leading-relaxed">{t('sendHint')}</p>

      <Modal.Backdrop isOpen={open} onOpenChange={setOpen}>
        <Modal.Container placement="auto" scroll="inside">
          <Modal.Dialog className="rounded-(--radius) p-0 sm:max-w-lg">
            <Modal.CloseTrigger aria-label={t('close')} className="top-4 right-4" />
            <Modal.Header className="border-line border-b px-5 pt-5 pb-4 sm:px-6">
              <Modal.Heading className="pr-10 text-lg font-semibold">{t('title')}</Modal.Heading>
              <p className="text-muted mt-1 flex min-w-0 items-center gap-1.5 text-sm">
                <Store className="size-4 shrink-0" aria-hidden />
                <span className="truncate">
                  {businessName} · {villageName}
                </span>
              </p>
            </Modal.Header>

            <Modal.Body className="divide-line flex flex-col divide-y px-5 py-0 sm:px-6">
              <section aria-labelledby={`${messageId}-items`} className="py-5">
                <h3 id={`${messageId}-items`} className={sectionTitle}>
                  {t('items')}
                </h3>
                <ul className="mt-3 flex flex-col gap-3">
                  {items.map((item, index) => {
                    const quantity = quantities[item.slug] ?? 0
                    const main = index === 0
                    if (!main && quantity === 0) return null
                    return (
                      <ItemRow key={item.slug} item={item} fmt={fmt}>
                        <NumberField
                          minValue={main ? 1 : 0}
                          maxValue={MAX_QUANTITY}
                          formatOptions={{ maximumFractionDigits: 0 }}
                          value={quantity}
                          onChange={(value) => setQuantity(item.slug, value, main ? 1 : 0)}
                          aria-label={t('quantityOf', { name: item.name })}
                        >
                          <NumberField.Group className="border-line-strong h-9 w-[6.5rem] rounded-full border">
                            {/* Children fill the space inside the 1px border, so the value sits centred. */}
                            <NumberField.DecrementButton
                              aria-label={t('decrease')}
                              className="h-full"
                            />
                            <NumberField.Input className="h-full min-w-0 px-0 py-0 text-center text-sm font-semibold tabular-nums" />
                            <NumberField.IncrementButton
                              aria-label={t('increase')}
                              className="h-full"
                            />
                          </NumberField.Group>
                        </NumberField>
                      </ItemRow>
                    )
                  })}
                </ul>
                {otherProducts.some((item) => !quantities[item.slug]) ? (
                  <div className="mt-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-muted text-xs font-semibold">{t('addMore')}</p>
                      <div className="hidden gap-1 sm:flex">
                        {(
                          [
                            [-1, ChevronLeft, t('previousProducts')],
                            [1, ChevronRight, t('nextProducts')],
                          ] as const
                        ).map(([direction, Icon, label]) => (
                          <Button
                            key={direction}
                            size="sm"
                            variant="ghost"
                            isIconOnly
                            aria-label={label}
                            onPress={() =>
                              rail.current?.scrollBy({
                                left: direction * 300,
                                behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
                                  ? 'instant'
                                  : 'smooth',
                              })
                            }
                            className="text-accent bg-accent/8 size-8 min-w-0 rounded-full p-0"
                          >
                            <Icon className="size-4" aria-hidden />
                          </Button>
                        ))}
                      </div>
                    </div>
                    {/* A swipeable rail: shops with many products stay one row tall. */}
                    <ul
                      ref={rail}
                      aria-label={t('addMore')}
                      className="-mx-5 mt-2 flex snap-x snap-mandatory scroll-px-5 gap-2.5 overflow-x-auto overscroll-x-contain px-5 pb-1 sm:-mx-6 sm:scroll-px-6 sm:px-6"
                    >
                      {otherProducts
                        .filter((item) => !quantities[item.slug])
                        .map((item) => (
                          <li
                            key={item.slug}
                            className="border-line bg-surface flex w-36 shrink-0 snap-start flex-col overflow-hidden rounded-(--radius-compact) border"
                          >
                            <ProductPhoto
                              src={item.imageUrl ?? null}
                              alt=""
                              category={item.category}
                              sizes="144px"
                              className="aspect-[4/3] w-full"
                            />
                            <div className="flex flex-1 flex-col gap-1 p-2">
                              <p className="line-clamp-2 text-xs leading-snug font-semibold">
                                {item.name}
                              </p>
                              <div className="mt-auto flex items-center justify-between gap-1">
                                <p className="text-sm font-bold tabular-nums">{fmt(item.price)}</p>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  isIconOnly
                                  onPress={() => setQuantity(item.slug, 1, 0)}
                                  aria-label={t('addItem', { name: item.name })}
                                  // 28px to the eye; the ::after keeps a 44px touch area on phones.
                                  className="border-accent text-accent bg-surface hover:bg-accent-soft relative size-7 min-w-0 shrink-0 rounded-full border p-0 after:absolute after:-inset-2 after:content-['']"
                                >
                                  <Plus className="size-3.5" strokeWidth={2.5} aria-hidden />
                                </Button>
                              </div>
                            </div>
                          </li>
                        ))}
                    </ul>
                  </div>
                ) : null}
              </section>

              <section aria-labelledby={`${messageId}-buyer`} className="flex flex-col gap-4 py-5">
                <h3 id={`${messageId}-buyer`} className={sectionTitle}>
                  {t('buyer')}
                </h3>
                <TextField
                  value={name}
                  onChange={(value) => {
                    setName(value)
                    setErrors((current) => ({ ...current, name: undefined }))
                  }}
                  isInvalid={Boolean(errors.name)}
                  maxLength={60}
                  autoComplete="name"
                >
                  <Label>{t('name')}</Label>
                  <Input variant="secondary" placeholder={t('namePlaceholder')} className={field} />
                  {errors.name ? <FieldError>{errors.name}</FieldError> : null}
                </TextField>

                <fieldset aria-describedby={errors.delivery ? `${deliveryId}-error` : undefined}>
                  <legend className="text-sm font-medium">{t('delivery')}</legend>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {DELIVERY.map((method) => {
                      const Icon = DELIVERY_ICON[method]
                      return (
                        <label
                          key={method}
                          className={cn(
                            'flex min-h-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-(--radius-compact) border px-1 py-2 text-center text-xs leading-tight font-semibold transition-colors has-focus-visible:outline-2 has-focus-visible:outline-[var(--focus)]',
                            delivery === method
                              ? 'border-accent bg-accent-soft text-accent-soft-foreground'
                              : 'bg-surface hover:bg-wash hover:border-line-strong border-(--field-outline)',
                          )}
                        >
                          <input
                            type="radio"
                            name={deliveryId}
                            value={method}
                            checked={delivery === method}
                            onChange={() => {
                              setDelivery(method)
                              setErrors((current) => ({
                                ...current,
                                delivery: undefined,
                                area: undefined,
                              }))
                            }}
                            className="sr-only"
                          />
                          <Icon className="size-5" aria-hidden />
                          {t(`methods.${method}`)}
                        </label>
                      )
                    })}
                  </div>
                  {errors.delivery ? (
                    <p id={`${deliveryId}-error`} className="text-danger mt-1.5 text-sm">
                      {errors.delivery}
                    </p>
                  ) : null}
                </fieldset>

                {needsArea ? (
                  <TextField
                    value={area}
                    onChange={(value) => {
                      setArea(value)
                      setErrors((current) => ({ ...current, area: undefined }))
                    }}
                    isInvalid={Boolean(errors.area)}
                    maxLength={80}
                    autoComplete="address-level2"
                  >
                    <Label>{t('area')}</Label>
                    <Input variant="secondary" placeholder={t('areaHint')} className={field} />
                    {errors.area ? (
                      <FieldError>{errors.area}</FieldError>
                    ) : (
                      <Description>{t('areaNote')}</Description>
                    )}
                  </TextField>
                ) : null}

                <TextField value={note} onChange={setNote} maxLength={300}>
                  <Label>
                    {t('note')} <span className="text-muted font-normal">{t('optional')}</span>
                  </Label>
                  <TextArea
                    variant="secondary"
                    placeholder={t('noteHint')}
                    rows={2}
                    className={areaField}
                  />
                </TextField>
              </section>

              <section className="py-4">
                <button
                  type="button"
                  aria-expanded={showMessage}
                  aria-controls={messageId}
                  onClick={() => setShowMessage((shown) => !shown)}
                  className="text-accent inline-flex min-h-9 items-center gap-1 text-sm font-semibold"
                >
                  {t('previewTitle')}
                  <ChevronDown
                    className={cn(
                      'size-4 transition-transform motion-reduce:transition-none',
                      showMessage && 'rotate-180',
                    )}
                    aria-hidden
                  />
                </button>
                <p
                  id={messageId}
                  hidden={!showMessage}
                  className="bg-wash/60 mt-2 rounded-(--radius-compact) p-3 text-sm leading-relaxed wrap-break-word whitespace-pre-wrap"
                >
                  {message}
                </p>
                <p className="bg-accent-soft text-accent-soft-foreground mt-3 flex items-start gap-2.5 rounded-(--radius-compact) px-3 py-2.5 text-xs leading-5 font-medium">
                  {/* h-5 matches the line height, so the icon sits on the first line. */}
                  <span aria-hidden className="grid h-5 shrink-0 place-items-center">
                    <ShieldCheck className="size-4" />
                  </span>
                  <span>{t('privacy')}</span>
                </p>
                {sent ? (
                  <p
                    role="status"
                    className="bg-accent-soft text-accent-soft-foreground mt-3 rounded-(--radius-compact) px-3 py-2 text-sm"
                  >
                    {t('sent')}
                  </p>
                ) : null}
              </section>
            </Modal.Body>

            <Modal.Footer className="border-line flex items-center gap-4 border-t px-5 py-3 sm:px-6">
              <div className="min-w-0 flex-1">
                <p className="text-muted text-xs">{t('total')}</p>
                <p className="text-lg leading-tight font-bold tabular-nums" aria-live="polite">
                  {fmt(total)}
                </p>
              </div>
              <Button type="button" onPress={send} className={cn(waClass, 'w-auto px-5')}>
                <WhatsAppIcon className="size-5 shrink-0" />
                {preview ? t('previewSend') : t('sendNow')}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </div>
  )
}

function ItemRow({
  item,
  fmt,
  children,
}: {
  item: OrderProduct
  fmt: (n: number) => string
  children: ReactNode
}) {
  return (
    <li className="flex items-center gap-3">
      <ProductPhoto
        src={item.imageUrl ?? null}
        alt=""
        category={item.category}
        sizes="56px"
        className="size-14 shrink-0 rounded-(--radius-compact)"
      />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm leading-snug font-semibold">{item.name}</p>
        <p className="text-muted mt-0.5 text-sm tabular-nums">{fmt(item.price)}</p>
      </div>
      {children}
    </li>
  )
}
