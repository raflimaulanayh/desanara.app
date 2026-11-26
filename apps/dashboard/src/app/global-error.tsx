'use client'

import { FatalErrorPage } from '@repo/ui/components/fatal-error-page'
import { StatusMascot } from '@repo/ui/components/status-mascot'
import id from '../../messages/id.json'
import './globals.css'

export default function GlobalError({ retry }: { retry: () => void }) {
  return (
    <FatalErrorPage
      locale="id"
      title={id.states.errorTitle}
      description={id.errors.generic}
      retryLabel={id.common.retry}
      retry={retry}
      home={{ href: '/', label: id.states.home }}
      illustration={<StatusMascot pose="unavailable" />}
    />
  )
}
