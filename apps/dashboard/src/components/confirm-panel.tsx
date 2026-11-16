'use client'

import { Button } from '@heroui/react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Field } from './field'

/** A confirm step with a required text (reject note, takedown reason) or none (delete). */
export function ConfirmPanel({
  title,
  label,
  min,
  danger,
  confirm,
  pending,
  onConfirm,
  onCancel,
}: {
  title: string
  label?: string
  min?: number
  danger?: boolean
  confirm: string
  pending: boolean
  onConfirm: (text: string) => void
  onCancel: () => void
}) {
  const t = useTranslations()
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  return (
    <div className="bg-wash flex flex-col gap-3 rounded-2xl p-4">
      <p className="font-bold">{title}</p>
      {label ? (
        <Field
          name="reason"
          multiline
          label={label}
          value={text}
          onChange={setText}
          error={error}
        />
      ) : null}
      <div className="flex gap-2">
        <Button
          variant={danger ? 'danger' : 'primary'}
          isPending={pending}
          onPress={() => {
            if (min && text.trim().length < min) return setError(t('form.tooShort', { min }))
            onConfirm(text.trim())
          }}
        >
          {confirm}
        </Button>
        <Button variant="ghost" onPress={onCancel}>
          {t('common.cancel')}
        </Button>
      </div>
    </div>
  )
}
