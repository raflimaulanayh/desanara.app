'use client'

import { Button, Card } from '@heroui/react'
import { can } from '@repo/auth/permissions'
import { villageSettingsSchema } from '@repo/validators'
import { Container } from '@repo/ui/components/container'
import { Check, RotateCcw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { QueryFeedback, QueryProblem } from '@/components/query-feedback'
import { VillageSettingsSkeleton } from '@/components/dashboard-skeletons'
import { describeApiError, readableData } from '@/lib/api-errors'
import { fieldMessages } from '@/lib/business-form'
import type { LatLng } from '@/lib/map'
import { useSession } from '@/lib/session'
import { type VillageSettings, useUpdateVillageSettings, useVillageSettings } from '@/lib/villages'
import { Field } from '../field'
import { InvitePanel } from '../invite/invite-panel'
import { MapPicker } from '../map/map-picker'

const PROFILE_FIELDS = ['description', 'contactPhone', 'contactEmail', 'address'] as const
type ProfileField = (typeof PROFILE_FIELDS)[number]

const samePoint = (a: LatLng | null, b: LatLng | null) => a?.lat === b?.lat && a?.lng === b?.lng

type Message = { kind: 'ok' | 'error'; text: string } | null

function Feedback({ message }: { message: Message }) {
  if (!message) return null
  return (
    <p
      role={message.kind === 'error' ? 'alert' : 'status'}
      className={`text-sm font-medium ${message.kind === 'error' ? 'text-danger' : 'text-success'}`}
    >
      {message.text}
    </p>
  )
}

/** Map centre: starts on the official region point; the admin drags it to the village office. */
function CenterCard({ v }: { v: VillageSettings }) {
  const t = useTranslations()
  const router = useRouter()
  const update = useUpdateVillageSettings(v.id)
  const [point, setPoint] = useState<LatLng | null>(v.mapCenter)
  const [message, setMessage] = useState<Message>(null)
  const regionPoint = v.region?.point ?? null

  async function save(center: LatLng | null) {
    setMessage(null)
    try {
      const fresh = await update.mutateAsync({
        centerLat: center?.lat ?? null,
        centerLng: center?.lng ?? null,
      })
      setPoint(fresh.mapCenter)
      setMessage({ kind: 'ok', text: t('villageSettings.centerSaved') })
    } catch (e) {
      const d = describeApiError(e, t)
      if (d.sessionExpired) return router.replace('/login')
      setMessage({
        kind: 'error',
        text: d.fields.centerLat || d.fields.centerLng || d.message,
      })
    }
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title className="font-bold">{t('villageSettings.centerTitle')}</Card.Title>
        <Card.Description>
          {v.center ? t('villageSettings.centerCustom') : t('villageSettings.centerFromRegion')}
        </Card.Description>
      </Card.Header>
      <Card.Content className="flex flex-col gap-3">
        <MapPicker
          value={point}
          onChange={(p) => {
            setPoint(p)
            setMessage(null)
          }}
          fallbackCenter={regionPoint}
          allowClear={false}
          hint={t('villageSettings.centerHint')}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            isDisabled={!point || samePoint(point, v.mapCenter)}
            isPending={update.isPending}
            onPress={() => save(point)}
          >
            <Check className="size-4" aria-hidden />
            {t('villageSettings.saveCenter')}
          </Button>
          {v.center && regionPoint ? (
            <Button variant="ghost" isPending={update.isPending} onPress={() => save(null)}>
              <RotateCcw className="size-4" aria-hidden />
              {t('villageSettings.resetCenter')}
            </Button>
          ) : null}
        </div>
        <Feedback message={message} />
      </Card.Content>
    </Card>
  )
}

/** Public contact details of the village office and its short story. */
function ProfileCard({ v }: { v: VillageSettings }) {
  const t = useTranslations()
  const router = useRouter()
  const update = useUpdateVillageSettings(v.id)
  const initial = Object.fromEntries(PROFILE_FIELDS.map((f) => [f, v[f] ?? ''])) as Record<
    ProfileField,
    string
  >
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<Message>(null)

  async function save() {
    const patch = Object.fromEntries(
      PROFILE_FIELDS.filter((f) => values[f].trim() !== (v[f] ?? '')).map((f) => [
        f,
        values[f].trim(),
      ]),
    )
    if (Object.keys(patch).length === 0) return
    const parsed = villageSettingsSchema.safeParse(patch)
    if (!parsed.success) return setErrors(fieldMessages(parsed.error.issues as never, t))
    setMessage(null)
    try {
      await update.mutateAsync(parsed.data)
      setMessage({ kind: 'ok', text: t('villageSettings.profileSaved') })
    } catch (e) {
      const d = describeApiError(e, t)
      if (d.sessionExpired) return router.replace('/login')
      setErrors(d.fields)
      setMessage({ kind: 'error', text: d.message })
    }
  }

  const field = (name: ProfileField, extra: Partial<Parameters<typeof Field>[0]> = {}) => (
    <Field
      name={name}
      label={t(`villageSettings.fields.${name}`)}
      value={values[name]}
      onChange={(value) => {
        setValues((s) => ({ ...s, [name]: value }))
        setErrors((e) => ({ ...e, [name]: '' }))
        setMessage(null)
      }}
      error={errors[name]}
      {...extra}
    />
  )

  return (
    <Card>
      <Card.Header>
        <Card.Title className="font-bold">{t('villageSettings.profileTitle')}</Card.Title>
        <Card.Description>{t('villageSettings.profileHint')}</Card.Description>
      </Card.Header>
      <Card.Content className="flex flex-col gap-5">
        {field('description', { multiline: true })}
        {field('contactPhone', { type: 'tel', inputMode: 'tel' })}
        {field('contactEmail', { type: 'email', inputMode: 'email' })}
        {field('address', { multiline: true })}
        <Button className="h-12" isPending={update.isPending} onPress={save}>
          <Check className="size-4" aria-hidden />
          {t('villageSettings.saveProfile')}
        </Button>
        <Feedback message={message} />
      </Card.Content>
    </Card>
  )
}

/** Village staff invitations: village admins invite pendamping; the super admin also invites admins. */
function TeamCard({ v }: { v: VillageSettings }) {
  const t = useTranslations()
  const { actor } = useSession()
  const village = { type: 'village', villageId: v.id } as const
  const roles = [
    ...(can(actor, 'user.manage', { type: 'platform' })
      ? [{ role: 'village_admin' as const, label: t('roles.village_admin') }]
      : []),
    ...(can(actor, 'village.invite_members', village)
      ? [{ role: 'village_assistant' as const, label: t('roles.village_assistant') }]
      : []),
  ]
  if (roles.length === 0) return null
  return (
    <InvitePanel
      scope={{ villageId: v.id }}
      title={t('invitePanel.villageTitle')}
      hint={t('invitePanel.villageHint')}
      roles={roles}
    />
  )
}

export function VillageSettingsPage({ id }: { id: string }) {
  const t = useTranslations()
  const q = useVillageSettings(id)
  const village = readableData(q)

  return (
    <Container className="flex max-w-3xl flex-col gap-5 py-6 sm:py-10">
      <Link href="/villages" className="text-muted text-sm font-semibold hover:underline">
        ← {t('nav.villageSettings')}
      </Link>
      <QueryFeedback
        query={q}
        loading={<VillageSettingsSkeleton />}
        backHref="/villages"
        backLabel={t('nav.villageSettings')}
      />
      {village?.permissions.update ? (
        <>
          <header>
            <h1 className="text-2xl font-extrabold sm:text-3xl">{village.name}</h1>
            <p className="text-muted mt-1 text-sm">
              {village.region?.fullName ?? t('villageSettings.noRegion')}
            </p>
          </header>
          <CenterCard v={village} />
          <ProfileCard v={village} />
          <TeamCard v={village} />
        </>
      ) : village ? (
        <QueryProblem title={t('states.forbiddenTitle')} description={t('errors.forbidden')} />
      ) : null}
    </Container>
  )
}
