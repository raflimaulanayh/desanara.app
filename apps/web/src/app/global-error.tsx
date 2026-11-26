'use client'

import { FatalErrorPage } from '@repo/ui/components/fatal-error-page'
import { StatusMascot } from '@repo/ui/components/status-mascot'
import { useSyncExternalStore } from 'react'
import en from '../../messages/en.json'
import id from '../../messages/id.json'
import './globals.css'

const subscribe = () => () => {}

export default function GlobalError({ retry }: { retry: () => void }) {
  const locale = useSyncExternalStore(
    subscribe,
    () => (/^\/en(?:\/|$)/.test(window.location.pathname) ? 'en' : 'id'),
    () => 'id' as const,
  )
  const messages = locale === 'en' ? en : id
  const t = messages.states

  return (
    <FatalErrorPage
      locale={locale}
      title={t.errorTitle}
      description={t.errorBody}
      retryLabel={t.retry}
      retry={retry}
      home={{ href: locale === 'en' ? '/en' : '/', label: messages.notFound.back }}
      illustration={<StatusMascot pose="unavailable" />}
    />
  )
}
