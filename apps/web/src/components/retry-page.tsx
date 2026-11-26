'use client'

import { Button } from '@heroui/react'
import { useOnline } from '@repo/ui/components/offline-notice'
import { RotateCw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTransition } from 'react'
import { useRouter } from '@/i18n/navigation'

export function RetryPage({
  onRetry,
  compact = false,
}: {
  onRetry?: () => void
  compact?: boolean
}) {
  const t = useTranslations('states')
  const online = useOnline()
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <Button
      variant={compact ? 'secondary' : 'primary'}
      className="min-h-11 rounded-full px-4 font-semibold"
      isDisabled={!online}
      isPending={pending}
      onPress={() => startTransition(onRetry ?? (() => router.refresh()))}
    >
      <RotateCw className="size-4" aria-hidden />
      {t(pending ? 'retrying' : 'retry')}
    </Button>
  )
}
