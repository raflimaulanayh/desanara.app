'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Form drafts kept on this device so a dropped signal or a closed tab does not lose what was
 * typed. Keys include the user id: village phones are often shared, so one person's draft must
 * never appear for another, and all drafts of a user are removed at logout.
 * Every storage call is wrapped: private mode or full storage must never break the form.
 */
const PREFIX = 'desanara:draft:v1:'

export const draftKey = (userId: string, formId: string) => `${PREFIX}${userId}:${formId}`

interface Stored<T> {
  savedAt: number
  value: T
}

/** Drafts older than this are dropped instead of offered. */
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000

export function readDraft<T>(key: string, now = Date.now()): Stored<T> | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Stored<T>
    if (typeof parsed?.savedAt !== 'number' || now - parsed.savedAt > MAX_AGE_MS) {
      localStorage.removeItem(key)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function writeDraft<T>(key: string, value: T, now = Date.now()) {
  try {
    localStorage.setItem(key, JSON.stringify({ savedAt: now, value } satisfies Stored<T>))
  } catch {
    // Storage full or blocked: the form still works, only without a draft.
  }
}

export function removeDraft(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

/** Removes every draft of one user (call at logout). */
export function clearDrafts(userId: string) {
  try {
    const mine = `${PREFIX}${userId}:`
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i) ?? '')
    for (const key of keys) if (key.startsWith(mine)) localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

/**
 * Autosaves `value` (debounced) while `dirty`. `draft` is the stored copy found when the form
 * opened, for a "Lanjutkan isian sebelumnya?" prompt; call `discard()` after a successful save.
 * Forms render only after the session loaded in the browser (AppShell), so reading storage in the
 * state initializer is safe; give the form a React `key` per record so a new key re-reads it.
 */
export function useFormDraft<T>(key: string | null, value: T, dirty: boolean) {
  const [draft, setDraft] = useState<Stored<T> | null>(() => {
    if (!key || typeof window === 'undefined') return null
    const stored = readDraft<T>(key)
    // A draft identical to what the form already shows has nothing to restore.
    if (stored && JSON.stringify(stored.value) === JSON.stringify(value)) {
      removeDraft(key)
      return null
    }
    return stored
  })
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!key || !dirty) return
    pending.current = setTimeout(() => writeDraft(key, value), 800)
    return () => {
      if (pending.current) clearTimeout(pending.current)
    }
  }, [key, value, dirty])

  // Also cancels a write still waiting for its delay: saving right after typing must not leave a
  // stale draft behind (regression: "Ada isian yang belum tersimpan" after a successful save).
  const discard = useCallback(() => {
    if (pending.current) clearTimeout(pending.current)
    pending.current = null
    if (key) removeDraft(key)
    setDraft(null)
  }, [key])

  return { draft, discard, dismiss: () => setDraft(null) }
}
