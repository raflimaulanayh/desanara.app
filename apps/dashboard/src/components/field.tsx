'use client'

import { Description, FieldError, Input, Label, TextArea, TextField } from '@heroui/react'
import type { ComponentProps } from 'react'

/**
 * One labelled text input with hint and error, sized for thumbs (≥ 44 px). `multiline` swaps in a
 * TextArea. Keeps form code short and every field consistent.
 */
export function Field({
  label,
  hint,
  error,
  value,
  onChange,
  multiline,
  required,
  inputMode,
  type,
  placeholder,
  autoComplete,
  name,
}: {
  label: string
  hint?: string
  error?: string
  value: string
  onChange: (value: string) => void
  multiline?: boolean
  required?: boolean
  inputMode?: ComponentProps<'input'>['inputMode']
  type?: string
  placeholder?: string
  autoComplete?: string
  name: string
}) {
  return (
    <TextField
      name={name}
      value={value}
      onChange={onChange}
      isInvalid={Boolean(error)}
      isRequired={required}
      type={type}
      className="flex flex-col gap-1.5"
    >
      <Label>{label}</Label>
      {multiline ? (
        <TextArea rows={4} placeholder={placeholder} className="text-base" />
      ) : (
        <Input
          inputMode={inputMode}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="h-12 text-base"
        />
      )}
      {hint && !error ? <Description>{hint}</Description> : null}
      <FieldError>{error}</FieldError>
    </TextField>
  )
}
