import { MapPin } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { getVillages } from '@/lib/data'
import { mediaUrl } from '@/lib/media'
import { VillageLogo } from './village-logo'

type Village = Awaited<ReturnType<typeof getVillages>>[number]

/** Destination-style card for a village: its colour, crest, place, and how many businesses it holds. */
export async function VillageCard({ village: v }: { village: Village }) {
  const t = await getTranslations('village')
  return (
    <Link
      href={`/desa/${v.slug}`}
      className="group border-line bg-surface flex h-full flex-col overflow-hidden rounded-(--radius) border transition-shadow hover:shadow-md"
    >
      <div
        className="relative h-24"
        style={{
          background: `linear-gradient(135deg, ${v.accent}, color-mix(in oklab, ${v.accent} 55%, black))`,
        }}
      />
      <div className="-mt-9 flex flex-1 flex-col gap-1 px-4 pb-4">
        <VillageLogo name={v.name} logoUrl={mediaUrl(v.logoKey)} accent={v.accent} size={64} />
        <h3 className="mt-2 text-lg leading-tight font-extrabold">{v.name}</h3>
        {v.regionName ? (
          <p className="text-muted flex items-center gap-1 text-sm">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            {v.regionName}
          </p>
        ) : null}
        <p className="mt-2 text-sm font-semibold" style={{ color: v.accent }}>
          {t('businessCount', { count: v.businessCount })}
        </p>
      </div>
    </Link>
  )
}
