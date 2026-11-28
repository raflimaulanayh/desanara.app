import { List } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'
import { Link } from '@/i18n/navigation'

export async function ExploreMapFrame({
  children,
  listHref,
}: {
  children: ReactNode
  listHref: string
}) {
  const t = await getTranslations('explore.map')

  return (
    <div className="explore-map-canvas bg-wash relative isolate min-h-44 min-w-0 flex-1 overflow-hidden">
      {children}
      <Link
        href={listHref}
        aria-label={t('backToList')}
        className="explore-list-link bg-accent text-accent-foreground absolute bottom-[calc(1.75rem+env(safe-area-inset-bottom))] left-1/2 z-10 flex min-h-11 w-max -translate-x-1/2 items-center justify-center gap-2 rounded-full px-4 text-sm font-bold whitespace-nowrap shadow-sm transition-colors hover:bg-[var(--accent-hover)]"
      >
        <List className="size-4 shrink-0" aria-hidden />
        {t('listMode')}
      </Link>
    </div>
  )
}
