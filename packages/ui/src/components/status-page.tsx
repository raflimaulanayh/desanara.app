import type { ReactNode } from 'react'
import { Container } from './container'
import { type MascotPose, StatusMascot } from './status-mascot'

export function StatusPage({
  pose,
  title,
  description,
  action,
}: {
  pose: MascotPose
  title: string
  description: string
  action: ReactNode
}) {
  return (
    <Container className="grid min-h-[54svh] place-items-center py-8 sm:py-12">
      <div className="flex max-w-sm flex-col items-center gap-2 text-center">
        <StatusMascot pose={pose} fullPage />
        <h1 className="mt-2 text-xl leading-tight font-bold tracking-tight text-balance sm:text-2xl">
          {title}
        </h1>
        <p className="text-muted text-sm leading-relaxed text-pretty sm:text-base">{description}</p>
        <div className="mt-3">{action}</div>
      </div>
    </Container>
  )
}
