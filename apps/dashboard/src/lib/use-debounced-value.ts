'use client'

import { useEffect, useState } from 'react'

/** `value` once it stopped changing for `delay` ms: one request per pause, not per keystroke. */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [settled, setSettled] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setSettled(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return settled
}
