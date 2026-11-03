import { BadgeCheck } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { cn } from '@repo/ui/cn'

/** "Verified by the village": the trust signal that sets this catalogue apart. */
export async function VerifiedBadge({ className, title }: { className?: string; title?: string }) {
  const t = await getTranslations('badge')
  return (
    <span
      title={title}
      className={cn(
        'bg-accent-soft text-accent-soft-foreground inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-bold',
        className,
      )}
    >
      <BadgeCheck className="size-4" aria-hidden />
      {t('verified')}
    </span>
  )
}
