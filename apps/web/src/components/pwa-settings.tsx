'use client'

import { Button } from '@heroui/react'
import { Bell, Smartphone } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { usePwa } from './pwa-provider'

interface PushState {
  publicKey: string | null
  subscription: PushSubscription | null
  permission: NotificationPermission
}

export function PwaSettings() {
  const t = useTranslations('pwa')
  const { standalone, install } = usePwa()
  const [installFailed, setInstallFailed] = useState(false)

  return (
    <section
      aria-labelledby="app-settings"
      className="border-line bg-surface mt-4 max-w-xl overflow-hidden rounded-(--radius) border"
    >
      <header className="bg-wash/55 flex items-center gap-3 px-4 py-3.5 sm:px-5">
        <Smartphone className="text-accent size-5 shrink-0" aria-hidden />
        <h2 id="app-settings" className="font-bold">
          {t('title')}
        </h2>
      </header>
      <div className="border-line space-y-2 border-b px-4 py-3.5 sm:px-5">
        <p className="text-sm font-semibold">{t(standalone ? 'installed' : 'installTitle')}</p>
        {standalone === false ? (
          <>
            <p className="text-muted text-sm leading-relaxed">
              {t(install ? 'installDescription' : 'installHelp')}
            </p>
            {install ? (
              <Button
                size="sm"
                variant="primary"
                className="min-h-11 rounded-full px-4 whitespace-nowrap"
                onPress={() => void install().catch(() => setInstallFailed(true))}
              >
                {t('installAction')}
              </Button>
            ) : null}
            {installFailed ? (
              <p role="status" className="text-muted text-sm">
                {t('installFailed')}
              </p>
            ) : null}
          </>
        ) : null}
      </div>
      <div className="space-y-2 px-4 py-3.5 sm:px-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Bell className="text-accent size-4 shrink-0" aria-hidden />
          {t('notifications')}
        </h3>
        {standalone ? (
          <PushSettings />
        ) : (
          <p className="text-muted text-sm leading-relaxed">{t('installForPush')}</p>
        )}
      </div>
    </section>
  )
}

function PushSettings() {
  const t = useTranslations('pwa')
  const locale = useLocale()
  const { registration } = usePwa()
  const [state, setState] = useState<PushState>()
  const [loadFailed, setLoadFailed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<'testSent' | 'expired' | 'rateLimited' | 'failed'>()
  const manager = registration?.pushManager
  const supported = typeof window !== 'undefined' && 'Notification' in window && !!manager

  useEffect(() => {
    if (!manager || !supported) return
    const controller = new AbortController()
    const readState = async () => {
      try {
        const response = await fetch('/api/pwa/push', { signal: controller.signal })
        if (!response.ok) throw new Error()
        const { data }: { data: { publicKey: string | null } } = await response.json()
        const subscription = await manager.getSubscription()
        if (!controller.signal.aborted) {
          setState({ publicKey: data.publicKey, subscription, permission: Notification.permission })
        }
      } catch {
        if (!controller.signal.aborted) setLoadFailed(true)
      }
    }
    void readState()
    return () => controller.abort()
  }, [manager, supported])

  async function update(action: 'enable' | 'disable' | 'test') {
    if (!manager || !state || busy) return
    setBusy(true)
    setMessage(undefined)
    let subscription = state.subscription
    try {
      if (action === 'enable' && state.publicKey) {
        subscription = await manager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: state.publicKey,
        })
      } else if (action === 'disable' && subscription) {
        if (!(await subscription.unsubscribe())) throw new Error()
        subscription = null
      } else if (action === 'test' && subscription) {
        const response = await fetch('/api/pwa/push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locale, subscription }),
        })
        if (response.status === 410) {
          await subscription.unsubscribe()
          subscription = null
          setMessage('expired')
        } else if (response.status === 429) {
          setMessage('rateLimited')
        } else if (response.ok) {
          setMessage('testSent')
        } else {
          throw new Error()
        }
      }
    } catch {
      if (Notification.permission !== 'denied' || action !== 'enable') setMessage('failed')
    } finally {
      setState({ ...state, subscription, permission: Notification.permission })
      setBusy(false)
    }
  }

  let status: string
  if (registration === undefined) status = t('checking')
  else if (!supported) status = t(registration ? 'unsupported' : 'workerFailed')
  else if (loadFailed) status = t('loadFailed')
  else if (!state) status = t('checking')
  else if (state.permission === 'denied') status = t('blocked')
  else if (!state.publicKey) status = t('unconfigured')
  else status = t(state.subscription ? 'enabled' : 'disabled')

  return (
    <>
      <p className="text-muted text-sm leading-relaxed" role="status">
        {status}
      </p>
      {state && (state.subscription || (state.publicKey && state.permission !== 'denied')) ? (
        <div className="flex flex-wrap gap-2 pt-0.5" aria-busy={busy}>
          {state.subscription ? (
            <>
              {state.publicKey && state.permission === 'granted' ? (
                <Button
                  size="sm"
                  variant="primary"
                  className="min-h-11 rounded-full px-4 whitespace-nowrap"
                  isDisabled={busy}
                  onPress={() => void update('test')}
                >
                  {t('test')}
                </Button>
              ) : null}
              <Button
                size="sm"
                variant="secondary"
                className="min-h-11 rounded-full px-4 whitespace-nowrap"
                isDisabled={busy}
                onPress={() => void update('disable')}
              >
                {t('disable')}
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="primary"
              className="min-h-11 rounded-full px-4 whitespace-nowrap"
              isDisabled={busy}
              onPress={() => void update('enable')}
            >
              {t('enable')}
            </Button>
          )}
        </div>
      ) : null}
      {message ? (
        <p role="status" className="text-muted text-sm leading-relaxed">
          {t(message)}
        </p>
      ) : null}
    </>
  )
}
