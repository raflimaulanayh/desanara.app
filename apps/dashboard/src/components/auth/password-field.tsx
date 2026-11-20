'use client'

import { Button, Description, FieldError, InputGroup, Label, TextField } from '@heroui/react'
import { Eye, EyeOff } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

/** Password with a show/hide toggle: typing on a phone keyboard is easier when you can see it. */
export function PasswordField({
  label,
  value,
  onChange,
  error,
  hint,
  autoComplete = 'new-password',
  name = 'password',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  hint?: string
  autoComplete?: 'new-password' | 'current-password'
  name?: string
}) {
  const t = useTranslations('auth')
  const [visible, setVisible] = useState(false)
  return (
    <TextField
      name={name}
      value={value}
      onChange={onChange}
      isInvalid={Boolean(error)}
      isRequired
      fullWidth
      className="flex flex-col gap-1.5"
    >
      <Label>{label}</Label>
      <InputGroup fullWidth className="h-12">
        <InputGroup.Input
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          className="text-base"
        />
        <InputGroup.Suffix className="pe-1">
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            aria-label={visible ? t('hidePassword') : t('showPassword')}
            onPress={() => setVisible((v) => !v)}
          >
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </Button>
        </InputGroup.Suffix>
      </InputGroup>
      {hint && !error ? <Description>{hint}</Description> : null}
      <FieldError>{error}</FieldError>
    </TextField>
  )
}
