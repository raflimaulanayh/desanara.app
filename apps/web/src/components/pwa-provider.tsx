'use client'

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'

interface InstallPrompt extends Event {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface PwaState {
  standalone: boolean | null
  install: (() => Promise<void>) | null
  registration: ServiceWorkerRegistration | null | undefined
}

const PwaContext = createContext<PwaState>({
  standalone: null,
  install: null,
  registration: undefined,
})

const standaloneQuery = '(display-mode: standalone)'

function subscribeToDisplayMode(onChange: () => void) {
  const query = window.matchMedia(standaloneQuery)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

function isStandalone() {
  const ios = navigator as Navigator & { standalone?: boolean }
  return window.matchMedia(standaloneQuery).matches || ios.standalone === true
}

export function PwaProvider({ children }: { children: ReactNode }) {
  const standalone = useSyncExternalStore(subscribeToDisplayMode, isStandalone, () => null)
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>()

  useEffect(() => {
    let active = true
    const rememberPrompt = (event: Event) => {
      event.preventDefault()
      setPrompt(event as InstallPrompt)
    }
    const clearPrompt = () => setPrompt(null)
    window.addEventListener('beforeinstallprompt', rememberPrompt)
    window.addEventListener('appinstalled', clearPrompt)
    const worker = navigator.serviceWorker
    Promise.resolve()
      .then(async () => {
        if (!worker) return null
        await worker.register('/sw.js', { updateViaCache: 'none' })
        return worker.ready
      })
      .then(
        (result) => {
          if (active) setRegistration(result)
        },
        () => {
          if (active) setRegistration(null)
        },
      )
    return () => {
      active = false
      window.removeEventListener('beforeinstallprompt', rememberPrompt)
      window.removeEventListener('appinstalled', clearPrompt)
    }
  }, [])

  const install = prompt
    ? async () => {
        setPrompt(null)
        await prompt.prompt()
      }
    : null

  return (
    <PwaContext.Provider value={{ standalone, registration, install }}>
      {children}
    </PwaContext.Provider>
  )
}

export function usePwa() {
  return useContext(PwaContext)
}
