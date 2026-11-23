'use client'

import { Button, Card, Description, Label, ListBox, Select, Switch } from '@heroui/react'
import { discountPercent, productCreateSchema, productUpdateSchema } from '@repo/validators'
import { Check, ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { describeApiError } from '@/lib/api-errors'
import { fieldMessages } from '@/lib/business-form'
import { draftKey, useFormDraft } from '@/lib/form-draft'
import {
  type ProductFormValues,
  compareAtOf,
  digitsOnly,
  formatDigits,
  priceErrors,
  priceOf,
  toCreateInput,
  toPatch,
  valuesFrom,
} from '@/lib/product-form'
import {
  type Product,
  useCategories,
  useCreateProduct,
  useRefreshProduct,
  useUpdateProduct,
} from '@/lib/products'
import { useSession } from '@/lib/session'
import { usePhotoUploads } from '@/lib/use-photo-uploads'
import { Field } from '../field'
import { PhotoManager } from './photo-manager'

function Toggle({
  label,
  hint,
  isSelected,
  onChange,
}: {
  label: string
  hint?: string
  isSelected: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <Switch isSelected={isSelected} onChange={onChange} className="items-start">
      <Switch.Content className="items-start gap-3">
        <Switch.Control className="mt-0.5 shrink-0">
          <Switch.Thumb />
        </Switch.Control>
        <span className="flex flex-col gap-0.5">
          <Label className="font-semibold">{label}</Label>
          {hint ? <Description>{hint}</Description> : null}
        </span>
      </Switch.Content>
    </Switch>
  )
}

/** "Rp" input that keeps digits only and shows thousand dots while typing. */
function PriceField({
  name,
  label,
  hint,
  value,
  onChange,
  error,
}: {
  name: string
  label: string
  hint?: string
  value: string
  onChange: (digits: string) => void
  error?: string
}) {
  return (
    <Field
      name={name}
      label={label}
      hint={hint}
      inputMode="numeric"
      autoComplete="off"
      placeholder="15.000"
      value={formatDigits(value)}
      onChange={(text) => onChange(digitsOnly(text))}
      error={error}
    />
  )
}

/**
 * Product data form. New product: photos are picked here too; after "Simpan produk" the product is
 * created as a draft and the photos upload one by one, then the product page opens. Edit: data only
 * (photos are managed on the product page). The text fields are kept as a draft on this device.
 */
export function ProductForm({ businessId, product }: { businessId: string; product?: Product }) {
  const t = useTranslations()
  const router = useRouter()
  const { user } = useSession()
  const categories = useCategories()
  const editing = Boolean(product)

  const initial = useMemo(() => valuesFrom(product ?? null), [product])
  const [values, setValues] = useState<ProductFormValues>(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [showEn, setShowEn] = useState(Boolean(initial.enName))
  const [createdId, setCreatedId] = useState<string | null>(null)

  const dirty = JSON.stringify(values) !== JSON.stringify(initial)
  const { draft, discard, dismiss } = useFormDraft(
    createdId
      ? null
      : draftKey(user.id, product ? `product:${product.id}` : `product:new:${businessId}`),
    values,
    dirty,
  )

  const create = useCreateProduct(businessId)
  const update = useUpdateProduct(product?.id ?? '')
  const refresh = useRefreshProduct()
  const uploads = usePhotoUploads({ productId: null, savedCount: 0, onUploaded: refresh })
  const pending = create.isPending || update.isPending

  // A new product: once every photo is up, open its page.
  const uploadsDone = createdId !== null && !uploads.busy && uploads.failed === 0
  useEffect(() => {
    if (uploadsDone) router.replace(`/products/${createdId}`)
  }, [uploadsDone, createdId, router])

  function set<K extends keyof ProductFormValues>(field: K, value: ProductFormValues[K]) {
    setValues((v) => ({ ...v, [field]: value }))
    setErrors((e) => ({ ...e, [field]: '' }))
    setSaved(false)
  }

  function validate(): Record<string, string> {
    const result = editing
      ? productUpdateSchema.safeParse(toPatch(product!, values))
      : productCreateSchema.safeParse(toCreateInput(values))
    const found = result.success ? {} : fieldMessages(result.error.issues as never, t)
    if (found.en) {
      found.enName = found.en
      delete found.en
    }
    if (!values.categoryId) found.categoryId = t('productForm.chooseCategory')
    // Our own price messages replace the schema's generic ones.
    delete found.price
    delete found.compareAtPrice
    return { ...found, ...priceErrors(values, t) }
  }

  async function submit() {
    const found = validate()
    if (Object.keys(found).length) {
      setErrors(found)
      return
    }
    setFormError(null)
    try {
      if (editing) {
        const patch = toPatch(product!, values)
        if (Object.keys(patch).length) await update.mutateAsync(patch as never)
        discard()
        setSaved(true)
      } else {
        const p = await create.mutateAsync(toCreateInput(values) as never)
        discard()
        setCreatedId(p.id)
        uploads.start(p.id)
      }
    } catch (e) {
      const d = describeApiError(e, t)
      if (d.sessionExpired) return router.replace('/login')
      setErrors(d.fields)
      setFormError(d.message)
    }
  }

  const price = priceOf(values)
  const percent = price ? discountPercent(price, compareAtOf(values)) : null

  return (
    <div className="flex flex-col gap-5">
      {draft && !createdId ? (
        <div
          role="status"
          className="bg-sun/25 flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center"
        >
          <p className="flex-1 text-sm">{t('businessForm.draftFound')}</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              onPress={() => {
                setValues({ ...initial, ...draft.value })
                setShowEn(Boolean(draft.value.enName))
                dismiss()
              }}
            >
              {t('businessForm.draftRestore')}
            </Button>
            <Button size="sm" variant="ghost" onPress={discard}>
              {t('businessForm.draftDiscard')}
            </Button>
          </div>
        </div>
      ) : null}

      {!editing ? (
        <Card>
          <Card.Header>
            <Card.Title className="text-xl font-extrabold">
              {t('productForm.photosTitle')}
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <PhotoManager saved={[]} uploads={uploads} canEdit={!createdId || uploads.failed > 0} />
          </Card.Content>
        </Card>
      ) : null}

      <fieldset disabled={Boolean(createdId)} className="flex flex-col gap-5">
        <Card>
          <Card.Header>
            <Card.Title className="text-xl font-extrabold">{t('productForm.dataTitle')}</Card.Title>
          </Card.Header>
          <Card.Content className="flex flex-col gap-5">
            <Field
              name="name"
              required
              label={t('productForm.fields.name')}
              hint={t('productForm.hints.name')}
              value={values.name}
              onChange={(v) => set('name', v)}
              error={errors.name}
            />

            <Select
              value={values.categoryId || null}
              onChange={(key) => set('categoryId', String(key ?? ''))}
              placeholder={t('productForm.chooseCategory')}
              isInvalid={Boolean(errors.categoryId)}
              isRequired
              className="flex flex-col gap-1.5"
            >
              <Label>{t('productForm.fields.categoryId')}</Label>
              <Select.Trigger className="h-12">
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {(categories.data ?? []).map((c) => (
                    <ListBox.Item key={c.id} id={c.id} textValue={c.name}>
                      {c.name}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
              {errors.categoryId ? (
                <p className="text-danger text-sm">{errors.categoryId}</p>
              ) : null}
            </Select>

            <div className="flex flex-col gap-4">
              <Toggle
                label={t('productForm.isFree')}
                hint={t('productForm.isFreeHint')}
                isSelected={values.isFree}
                onChange={(v) => {
                  set('isFree', v)
                  setErrors((e) => ({ ...e, price: '' }))
                }}
              />
              {!values.isFree ? (
                <PriceField
                  name="price"
                  label={t('productForm.fields.price')}
                  hint={t('productForm.hints.price')}
                  value={values.price}
                  onChange={(v) => set('price', v)}
                  error={errors.price}
                />
              ) : null}
              <Toggle
                label={t('productForm.onPromo')}
                hint={t('productForm.onPromoHint')}
                isSelected={values.onPromo}
                onChange={(v) => set('onPromo', v)}
              />
              {values.onPromo ? (
                <div className="flex flex-col gap-2">
                  <PriceField
                    name="compareAtPrice"
                    label={t('productForm.fields.compareAtPrice')}
                    hint={t('productForm.hints.compareAtPrice')}
                    value={values.compareAtPrice}
                    onChange={(v) => set('compareAtPrice', v)}
                    error={errors.compareAtPrice}
                  />
                  {percent ? (
                    <p className="text-sm font-semibold">
                      {t('productForm.discountPreview', { percent })}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <Field
              name="description"
              multiline
              label={t('productForm.fields.description')}
              hint={t('productForm.hints.description')}
              value={values.description}
              onChange={(v) => set('description', v)}
              error={errors.description}
            />

            <Toggle
              label={t('productForm.isAvailable')}
              hint={t('productForm.isAvailableHint')}
              isSelected={values.isAvailable}
              onChange={(v) => set('isAvailable', v)}
            />
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="flex flex-col gap-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-expanded={showEn}
              onPress={() => setShowEn((s) => !s)}
              className="h-auto w-full justify-between gap-3 rounded-lg px-2 py-1.5 text-left whitespace-normal"
            >
              <span>
                <span className="block font-bold">{t('productForm.english')}</span>
                <span className="text-muted block text-sm">{t('productForm.englishHint')}</span>
              </span>
              <ChevronDown
                className={`size-5 shrink-0 transition-transform ${showEn ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </Button>
            {showEn ? (
              <>
                <Field
                  name="enName"
                  label={t('productForm.fields.enName')}
                  value={values.enName}
                  onChange={(v) => set('enName', v)}
                  error={errors.enName}
                />
                <Field
                  name="enDescription"
                  multiline
                  label={t('productForm.fields.enDescription')}
                  value={values.enDescription}
                  onChange={(v) => set('enDescription', v)}
                  error={errors.enDescription}
                />
              </>
            ) : null}
          </Card.Content>
        </Card>
      </fieldset>

      {formError ? (
        <p role="alert" className="text-danger text-sm font-medium">
          {formError}
        </p>
      ) : null}
      {saved ? (
        <p role="status" className="text-success text-sm font-medium">
          {t('productForm.saved')}
        </p>
      ) : null}

      {createdId ? (
        <div role="status" className="bg-wash flex flex-col gap-3 rounded-2xl p-4">
          <p className="text-sm font-semibold">
            {uploads.failed
              ? t('productForm.someFailed', { count: uploads.failed })
              : t('productForm.uploading')}
          </p>
          {uploads.failed ? (
            <Button
              variant="secondary"
              className="self-start"
              onPress={() => router.replace(`/products/${createdId}`)}
            >
              {t('productForm.continue')}
            </Button>
          ) : null}
        </div>
      ) : (
        <Button className="h-12" isPending={pending} onPress={submit}>
          <Check className="size-4" aria-hidden />
          {editing ? t('productForm.save') : t('productForm.create')}
        </Button>
      )}
    </div>
  )
}
