import { Suspense } from 'react'
import { InvitationAccept } from '@/components/auth/invitation-accept'
import { Logo } from '@/components/logo'

/** Invitation link (WhatsApp or email). Outside the logged-in layout: most visitors have no account yet. */
export default async function InvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-10">
      <Logo className="h-8" />
      {/* useSearchParams (?e=) needs a Suspense boundary. */}
      <Suspense>
        <InvitationAccept token={token} />
      </Suspense>
    </main>
  )
}
