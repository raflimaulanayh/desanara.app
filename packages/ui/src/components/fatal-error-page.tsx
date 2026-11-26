'use client'

import { Button } from '@heroui/react'
import type { ReactNode } from 'react'

export function FatalErrorPage({
  locale,
  title,
  description,
  retryLabel,
  retry,
  home,
  illustration,
}: {
  locale: string
  title: string
  description: string
  retryLabel: string
  retry: () => void
  home: { href: string; label: string }
  illustration?: ReactNode
}) {
  return (
    <html lang={locale}>
      <head>
        <title>{title}</title>
      </head>
      <body
        className="bg-background text-foreground min-h-dvh antialiased"
        style={{ fontFamily: 'system-ui, sans-serif' }}
      >
        <main className="mx-auto grid min-h-dvh max-w-lg place-content-center justify-items-center gap-3 px-5 py-8 text-center">
          {illustration}
          <h1 className="text-xl font-bold text-balance">{title}</h1>
          <p className="text-muted text-sm leading-relaxed text-pretty">{description}</p>
          <Button className="mt-2 min-h-11 rounded-full px-5 font-semibold" onPress={retry}>
            {retryLabel}
          </Button>
          <a
            href={home.href}
            className="text-accent inline-flex min-h-11 items-center text-sm font-semibold hover:underline"
          >
            {home.label}
          </a>
        </main>
      </body>
    </html>
  )
}
