import { ArrowRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { getVillages } from '@/lib/data'
import { mediaUrl } from '@/lib/media'
import { VillageLogo } from './village-logo'

type Village = Awaited<ReturnType<typeof getVillages>>[number]

/** A compact route to a village and its businesses. */
export async function VillageCard({ village: v }: { village: Village }) {
  const t = await getTranslations('village')
  return (
    <Link
      href={`/desa/${v.slug}`}
      className="border-line bg-surface hover:border-accent hover:bg-wash/65 flex h-full items-center gap-3 rounded-(--radius) border p-3 transition-colors sm:gap-4 sm:p-4"
    >
      <VillageLogo name={v.name} logoUrl={mediaUrl(v.logoKey)} accent={v.accent} size={48} />
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
