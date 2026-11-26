import { Suspense } from 'react'
import { LoadingRegion } from '@repo/ui/components/loading-region'
import { getTranslations } from 'next-intl/server'
import { InvitationAccept } from '@/components/auth/invitation-accept'
import { InvitationSkeleton } from '@/components/dashboard-skeletons'
import { Logo } from '@/components/logo'

/** Invitation link (WhatsApp or email). Outside the logged-in layout: most visitors have no account yet. */
export default async function InvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const t = await getTranslations('invite')
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-10">
      <Logo className="h-12" />
      {/* useSearchParams (?e=) needs a Suspense boundary. */}
      <Suspense
        fallback={
          <LoadingRegion label={t('loading')} className="w-full max-w-sm">
            <InvitationSkeleton />
          </LoadingRegion>
        }
      >
        <InvitationAccept token={token} />
      </Suspense>
    </main>
  )
}
