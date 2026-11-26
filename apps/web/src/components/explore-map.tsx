import { cn } from '@repo/ui/cn'
import { ArrowRight, List } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { mapBusinessPins, type groupMapBusinesses, type MapCoordinates } from '@/lib/catalogue-map'
import { pick } from '@/lib/localize'
import { mediaUrl } from '@/lib/media'
import { ExploreBusinessSlider } from './explore-business-slider'
import { ExploreMapCanvas } from './explore-map-canvas'
import { ExploreVillageSheet } from './explore-village-sheet'
import { ProductPhoto } from './product-photo'

type Village = ReturnType<typeof groupMapBusinesses>[number] & {
  href: string
  listHref: string
}

export async function ExploreMap({
  villages,
  selectedSlug,
  preview,
  businessLocations,
  closeHref,
  listHref,
}: {
  villages: Village[]
  selectedSlug?: string
  preview: boolean
  businessLocations?: ReadonlyMap<string, MapCoordinates>
  closeHref: string
  listHref: string
}) {
  const [t, locale] = await Promise.all([getTranslations('explore.map'), getLocale()])
  const selected = villages.find((village) => village.slug === selectedSlug)
  const businessPoints = mapBusinessPins(selected?.businesses ?? [], businessLocations)
  const allBusinessPoints = mapBusinessPins(
    villages.flatMap(({ businesses }) => businesses),
    businessLocations,
  )
  const totalBusinesses = selected?.businesses.length ?? 0
  const locationNote =
    businessPoints.length === 0
      ? t('noPublicBusinessLocations')
      : businessPoints.length < totalBusinesses
        ? t('somePublicBusinessLocations', { count: businessPoints.length, total: totalBusinesses })
        : undefined
  const businessCards = selected?.businesses.map((product) => (
    <li key={product.business.slug} className="min-w-0">
      <Link
        href={`/produk/${product.slug}`}
        title={product.business.name}
        className="border-line hover:bg-accent/7 flex h-full min-h-11 min-w-0 items-center gap-2 rounded-(--radius-compact) border px-1.5 py-1 transition-colors focus-visible:outline-offset-[-2px]"
      >
        <ProductPhoto
          src={mediaUrl(product.imageKey, preview)}
          alt=""
          category={product.category?.slug}
          sizes="40px"
          className="size-9 shrink-0 rounded-(--radius-compact) sm:size-10"
        />
        <span className="min-w-0 flex-1 text-xs leading-snug">
          <span className="line-clamp-2 font-semibold wrap-anywhere">{product.business.name}</span>
          <span className="text-muted mt-0.5 hidden truncate sm:block">
            {pick(locale, product.name, product.nameEn)}
          </span>
        </span>
      </Link>
    </li>
  ))

  return (
    <div className="flex flex-1 flex-col">
      <div className="explore-map-canvas bg-wash relative isolate min-h-44 min-w-0 flex-1 overflow-hidden">
        <ExploreMapCanvas
          villages={villages.map(({ slug, name, lat, lng, href, businesses }) => ({
            slug,
            name,
            lat,
            lng,
            href,
            locationCount: businesses.filter(({ business }) =>
              businessLocations?.has(business.slug),
            ).length,
          }))}
          selectedSlug={selectedSlug}
          businessPoints={businessPoints}
          allBusinessPoints={allBusinessPoints}
        />
        <Link
          href={listHref}
          aria-label={t('backToList')}
          className="explore-list-link bg-accent text-accent-foreground absolute bottom-[calc(1.75rem+env(safe-area-inset-bottom))] left-1/2 z-10 flex min-h-11 w-max -translate-x-1/2 items-center justify-center gap-2 rounded-full px-4 text-sm font-bold whitespace-nowrap shadow-sm transition-colors hover:bg-[var(--accent-hover)]"
        >
          <List className="size-4 shrink-0" aria-hidden />
          {t('listMode')}
        </Link>
      </div>

      {selected ? (
        <ExploreVillageSheet
          key={selected.slug}
          title={selected.name}
          label={t('selected', { village: selected.name })}
          count={t('count', { count: selected.businesses.length })}
          closeHref={closeHref}
          footer={
            <Link
              href={selected.listHref}
              className="bg-accent text-accent-foreground flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-3 py-2 text-center text-sm font-bold transition-colors hover:bg-[var(--accent-hover)]"
            >
              {t('listVillage')}
              <ArrowRight className="size-4 shrink-0" aria-hidden />
            </Link>
          }
        >
          {selected.businesses.length > 2 ? (
            <ExploreBusinessSlider key={selected.slug} locationNote={locationNote}>
              {businessCards}
            </ExploreBusinessSlider>
          ) : (
            <>
              {locationNote ? (
                <p className="text-muted mt-1 shrink-0 text-xs leading-snug">{locationNote}</p>
              ) : null}
              <ul
                className={cn(
                  'mt-2 grid gap-2 p-0.5',
                  selected.businesses.length === 2 && 'grid-cols-2',
                )}
              >
                {businessCards}
              </ul>
            </>
          )}
        </ExploreVillageSheet>
      ) : null}
    </div>
  )
}
