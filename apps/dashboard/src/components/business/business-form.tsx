'use client'

import { Button, Card, Checkbox, Label, ListBox, Select } from '@heroui/react'
import { can } from '@repo/auth/permissions'
import { unwrap } from '@repo/api-client'
import { businessCreateSchema, businessUpdateSchema } from '@repo/validators'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { api } from '@/lib/api'
import { describeApiError } from '@/lib/api-errors'
import {
  type BusinessFormValues,
  STEPS,
  type TextField,
  fieldMessages,
  stepOf,
  toCreateInput,
  toPatch,
  valuesFrom,
} from '@/lib/business-form'
import { type Business, useCreateBusiness, useUpdateBusiness } from '@/lib/businesses'
import { draftKey, useFormDraft } from '@/lib/form-draft'
import { useSession } from '@/lib/session'
import { Field } from '../field'

/** Villages where the user may create a business (super admin: every published village). */
function useCreatableVillages() {
  const { actor, memberships } = useSession()
  const all = useQuery({
    queryKey: ['villages', 'all'],
    enabled: actor.globalRole === 'super_admin',
    queryFn: async () =>
      (await unwrap(await api.v1.villages.$get({ query: { page: '1', pageSize: '50' } }))).data,
  })
  if (actor.globalRole === 'super_admin')
    return (all.data ?? []).map(({ id, name }) => ({ id, name }))
  return memberships.villages
    .filter((v) => can(actor, 'business.create', { type: 'village', villageId: v.id }))
    .map(({ id, name }) => ({ id, name }))
}

/**
 * Create/edit a business in three short steps (data usaha → kontak → persetujuan), built for a
 * pendamping on a phone: one step per screen, big inputs, draft kept on the device.
 */
export function BusinessForm({ business }: { business?: Business }) {
  const t = useTranslations()
  const router = useRouter()
  const { user } = useSession()
  const villages = useCreatableVillages()
  const editing = Boolean(business)

  const initial = useMemo(
    () => valuesFrom(business ?? null, villages.length === 1 ? villages[0]!.id : ''),
    [business, villages],
  )
  const [values, setValues] = useState<BusinessFormValues>(initial)
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  const dirty = JSON.stringify(values) !== JSON.stringify(initial)
  const { draft, discard, dismiss } = useFormDraft(
    draftKey(user.id, business ? `business:${business.id}` : 'business:new'),
    values,
    dirty,
  )

  const create = useCreateBusiness()
  const update = useUpdateBusiness(business?.id ?? '')
  const pending = create.isPending || update.isPending

  const set = (field: TextField | 'villageId') => (value: string) => {
    setValues((v) => ({ ...v, [field]: value }))
    setErrors((e) => ({ ...e, [field]: '' }))
  }

  // Village is chosen automatically when there is only one; asked otherwise.
  const needsVillage = !editing && villages.length > 1

  function validate(): Record<string, string> {
    const result = editing
      ? businessUpdateSchema.safeParse(toPatch(business!, values))
      : businessCreateSchema.safeParse(toCreateInput(values))
    const found = result.success ? {} : fieldMessages(result.error.issues as never, t)
    if (!editing && !values.villageId) found.villageId = t('businessForm.chooseVillage')
    return found
  }

  function next() {
    const found = validate()
    const here = Object.keys(found).filter((f) => stepOf(f) === step)
    if (here.length) return setErrors(found)
    setErrors({})
    setStep((s) => s + 1)
  }

  async function submit() {
    const found = validate()
    if (Object.keys(found).length) {
      setErrors(found)
      setStep(Math.min(...Object.keys(found).map(stepOf)))
      return
    }
    setFormError(null)
    try {
      const saved = editing
        ? await update.mutateAsync(toPatch(business!, values) as never)
        : await create.mutateAsync(toCreateInput(values) as never)
      discard()
      router.replace(`/businesses/${saved.id}`)
    } catch (e) {
      const d = describeApiError(e, t)
      if (d.sessionExpired) return router.replace('/login')
      setErrors(d.fields)
      setFormError(d.message)
      const first = Object.keys(d.fields)[0]
      if (first) setStep(stepOf(first))
    }
  }

  const stepInfo = STEPS[step]!
  const last = step === STEPS.length - 1

  return (
    <div className="flex flex-col gap-5">
      {draft ? (
        <div
          role="status"
          className="bg-sun/25 flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center"
        >
          <p className="flex-1 text-sm">{t('businessForm.draftFound')}</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              onPress={() => {
                setValues(draft.value)
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

      <ol
        className="flex gap-2"
        aria-label={t('businessForm.progress', { step: step + 1, total: STEPS.length })}
      >
        {STEPS.map((s, i) => (
          <li
            key={s.id}
            aria-current={i === step ? 'step' : undefined}
            className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-accent' : 'bg-wash-strong'}`}
          />
        ))}
      </ol>

      <Card>
        <Card.Header>
          <p className="text-muted text-xs font-semibold">
            {t('businessForm.progress', { step: step + 1, total: STEPS.length })}
          </p>
          <Card.Title className="text-xl font-extrabold">
            {t(`businessForm.steps.${stepInfo.id}`)}
          </Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-5">
          {stepInfo.id === 'about' ? (
            <>
              {needsVillage ? (
                <Select
                  value={values.villageId || null}
                  onChange={(key) => set('villageId')(String(key ?? ''))}
                  placeholder={t('businessForm.chooseVillage')}
                  isInvalid={Boolean(errors.villageId)}
                  className="flex flex-col gap-1.5"
                >
                  <Label>{t('businessForm.fields.villageId')}</Label>
                  <Select.Trigger className="h-12">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {villages.map((v) => (
                        <ListBox.Item key={v.id} id={v.id} textValue={v.name}>
                          {v.name}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                  {errors.villageId ? (
                    <p className="text-danger text-sm">{errors.villageId}</p>
                  ) : null}
                </Select>
              ) : null}
              <Field
                name="name"
                required
                label={t('businessForm.fields.name')}
                hint={t('businessForm.hints.name')}
                value={values.name}
                onChange={set('name')}
                error={errors.name}
              />
              <Field
                name="ownerName"
                label={t('businessForm.fields.ownerName')}
                value={values.ownerName}
                onChange={set('ownerName')}
                error={errors.ownerName}
                autoComplete="off"
              />
              <Field
                name="description"
                multiline
                label={t('businessForm.fields.description')}
                hint={t('businessForm.hints.description')}
                value={values.description}
                onChange={set('description')}
                error={errors.description}
              />
            </>
          ) : null}

          {stepInfo.id === 'contact' ? (
            <>
              <Field
                name="whatsappNumber"
                type="tel"
                inputMode="tel"
                label={t('businessForm.fields.whatsappNumber')}
                hint={t('businessForm.hints.whatsappNumber')}
                placeholder="0812 3456 7890"
                value={values.whatsappNumber}
                onChange={set('whatsappNumber')}
                error={errors.whatsappNumber}
              />
              <Field
                name="address"
                multiline
                label={t('businessForm.fields.address')}
                hint={t('businessForm.hints.address')}
                value={values.address}
                onChange={set('address')}
                error={errors.address}
              />
              <fieldset className="flex flex-col gap-4">
                <legend className="mb-3 text-sm font-bold">{t('businessForm.onlineShops')}</legend>
                {(['shopeeUrl', 'tokopediaUrl', 'tiktokShopUrl', 'instagramUrl'] as const).map(
                  (f) => (
                    <Field
                      key={f}
                      name={f}
                      type="url"
                      inputMode="url"
                      placeholder="https://"
                      label={t(`businessForm.fields.${f}`)}
                      value={values[f]}
                      onChange={set(f)}
                      error={errors[f]}
                    />
                  ),
                )}
              </fieldset>
              <Field
                name="nib"
                inputMode="numeric"
                label={t('businessForm.fields.nib')}
                hint={t('businessForm.hints.nib')}
                value={values.nib}
                onChange={set('nib')}
                error={errors.nib}
              />
            </>
          ) : null}

          {stepInfo.id === 'consent' ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm leading-relaxed">{t('businessForm.consentExplain')}</p>
              <ul className="bg-wash list-disc rounded-xl py-3 pr-3 pl-8 text-sm leading-relaxed">
                <li>{t('businessForm.consentPublic')}</li>
                <li>{t('businessForm.consentPrivate')}</li>
                <li>{t('businessForm.consentWithdraw')}</li>
              </ul>
              <Checkbox
                isSelected={values.consentGiven}
                onChange={(consentGiven: boolean) => setValues((v) => ({ ...v, consentGiven }))}
              >
                <Checkbox.Content className="items-start">
                  <Checkbox.Control className="border-line-strong mt-0.5 size-6 border-2">
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <span className="text-sm font-semibold">{t('businessForm.consentCheck')}</span>
                </Checkbox.Content>
              </Checkbox>
              {editing && business?.consentAt && !values.consentGiven ? (
                <p role="alert" className="text-danger text-sm">
                  {t('businessForm.consentWithdrawWarning')}
                </p>
              ) : null}
            </div>
          ) : null}
        </Card.Content>
      </Card>

      {formError ? (
        <p role="alert" className="text-danger text-sm font-medium">
          {formError}
        </p>
      ) : null}

      <div className="flex gap-3">
        {step > 0 ? (
          <Button variant="secondary" className="h-12" onPress={() => setStep((s) => s - 1)}>
            <ArrowLeft className="size-4" aria-hidden />
            {t('businessForm.back')}
          </Button>
        ) : null}
        {last ? (
          <Button className="h-12 flex-1" isPending={pending} onPress={submit}>
            <Check className="size-4" aria-hidden />
            {editing ? t('businessForm.save') : t('businessForm.create')}
          </Button>
        ) : (
          <Button className="h-12 flex-1" onPress={next}>
            {t('businessForm.next')}
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        )}
      </div>
      {editing && !last ? (
        <Button variant="ghost" isPending={pending} onPress={submit} className="self-center">
          {t('businessForm.saveNow')}
        </Button>
      ) : null}
    </div>
  )
}
