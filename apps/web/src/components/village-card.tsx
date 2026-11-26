import { cn } from '@repo/ui/cn'
import { SkeletonBlock } from '@repo/ui/components/loading-region'
import { ArrowRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { getVillages } from '@/lib/data'
import { isCataloguePreview } from '@/lib/catalogue-preview'
import { villageCrest } from '@/lib/village-crest'
import { VillageLogo } from './village-logo'

type Village = Awaited<ReturnType<typeof getVillages>>[number]

const frame =
  'border-line bg-surface flex h-full items-center gap-3 rounded-(--radius) border p-3 sm:gap-4 sm:p-4'
const grid = 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3'

export function VillageGrid({ villages }: { villages: readonly Village[] }) {
  return (
    <ul className={grid}>
      {villages.map((village) => (
        <li key={village.id}>
          <VillageCard village={village} />
        </li>
      ))}
    </ul>
  )
}

export function VillageGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul className={grid}>
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>
          <VillageCardSkeleton />
        </li>
      ))}
    </ul>
  )
}

export function VillageCardSkeleton() {
  return (
    <div className={frame}>
      <SkeletonBlock className="size-12 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1">
        <SkeletonBlock className="h-5 w-2/3" />
        <SkeletonBlock className="mt-0.5 h-[1.25rem] w-5/6 sm:h-[1.4375rem]" />
        <SkeletonBlock className="mt-1 h-5 w-1/3" />
      </div>
      <SkeletonBlock className="size-5 shrink-0 rounded-full" />
    </div>
  )
}

/** A compact route to a village and its businesses. */
export async function VillageCard({ village: v }: { village: Village }) {
  const t = await getTranslations('village')
  const crest = villageCrest(v, isCataloguePreview())
  return (
    <Link
      href={`/desa/${v.slug}`}
      className={cn(frame, 'hover:border-accent hover:bg-wash/65 transition-colors')}
    >
      <VillageLogo
        name={v.name}
        logoUrl={crest.url}
        crestLabel={crest.regency ? t('regencyCrest', { regency: crest.regency }) : undefined}
        accent={v.accent}
        size={48}
      />
      <div className="min-w-0 flex-1">
        <h3 className="text-base leading-tight font-bold wrap-break-word">{v.name}</h3>
        {v.regionName ? (
          <p className="text-muted mt-0.5 text-xs leading-relaxed sm:text-sm">{v.regionName}</p>
        ) : null}
        <p className="text-accent mt-1 text-sm font-semibold">
          {t('businessCount', { count: v.businessCount })}
        </p>
      </div>
      <ArrowRight className="text-accent size-5 shrink-0" aria-hidden />
    </Link>
  )
}
