import { cn } from '@repo/ui/cn'
import { ArrowRight, List, X } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { mapBusinessPins, type groupMapBusinesses, type MapCoordinates } from '@/lib/catalogue-map'
import { pick } from '@/lib/localize'
import { mediaUrl } from '@/lib/media'
import { ExploreBusinessSlider } from './explore-business-slider'
import { ExploreMapCanvas } from './explore-map-canvas'
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
    <div className="explore-map-layout flex flex-1 flex-col lg:flex-row">
      <div className="explore-map-canvas bg-wash relative isolate min-h-44 min-w-0 flex-1 overflow-hidden">
        <ExploreMapCanvas
          villages={villages.map(({ slug, name, lat, lng, href, businesses }) => ({
            slug,
            name,
            lat,
            lng,
            href,
            businessCount: businesses.length,
          }))}
          selectedSlug={selectedSlug}
          businessPoints={businessPoints}
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
        <section
          aria-label={t('selected', { village: selected.name })}
          className="explore-map-details bg-surface border-line flex max-h-[42dvh] min-h-0 shrink-0 flex-col overflow-hidden border-t px-4 py-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:max-h-[calc(100dvh-8rem)] lg:w-80 lg:border-t-0 lg:border-l lg:p-4"
        >
          <div className="flex shrink-0 items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base leading-tight font-bold sm:text-lg">{selected.name}</h2>
              <p className="text-muted mt-0.5 text-xs font-medium">
                {t('count', { count: selected.businesses.length })}
              </p>
            </div>
            <Link
              href={closeHref}
              scroll={false}
              prefetch={false}
              aria-label={t('close')}
              className="text-accent bg-accent/8 hover:bg-accent/15 grid size-9 shrink-0 place-items-center rounded-full transition-colors"
            >
              <X className="size-3.5" aria-hidden />
            </Link>
          </div>
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
          <Link
            href={selected.listHref}
            scroll={false}
            className="bg-accent text-accent-foreground mt-2 flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-bold whitespace-nowrap transition-colors hover:bg-[var(--accent-hover)]"
          >
            {t('listVillage')}
            <ArrowRight className="size-4 shrink-0" aria-hidden />
          </Link>
        </section>
      ) : null}
    </div>
  )
}
