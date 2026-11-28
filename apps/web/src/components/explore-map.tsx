import { cn } from '@repo/ui/cn'
import { ArrowRight, Navigation, Store } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { mapBusinessPins, type groupMapBusinesses, type MapCoordinates } from '@/lib/catalogue-map'
import type { ProductSummary } from '@/lib/data'
import { pick } from '@/lib/localize'
import { mediaUrl } from '@/lib/media'
import {
  ExploreBusinessSlider,
  ExploreBusinessSliderControls,
  ExploreBusinessSliderRail,
} from './explore-business-slider'
import { ExploreMapCanvas } from './explore-map-canvas'
import { ExploreMapFrame } from './explore-map-frame'
import { ExploreVillageSheet } from './explore-village-sheet'
import { ProductPhoto } from './product-photo'

type Village = ReturnType<typeof groupMapBusinesses<MapCoordinates & { slug: string }>>[number] & {
  href: string
  listHref: string
  /** Opens one business of this village on the map (third level). */
  businessHref: (businessSlug: string) => string
}

const directions = ({ lat, lng }: MapCoordinates) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`

const secondaryAction =
  'border-line-strong text-foreground hover:bg-wash flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors'
const primaryAction =
  'bg-accent text-accent-foreground flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-center text-sm font-bold whitespace-nowrap transition-colors hover:bg-[var(--accent-hover)]'

export async function ExploreMap({
  villages,
  selectedSlug,
  selectedBusiness,
  products = [],
  preview,
  businessLocations,
  closeHref,
  listHref,
  otherVillages = [],
}: {
  villages: Village[]
  /** Villages without matching products: quieter pins that open the village profile. */
  otherVillages?: (MapCoordinates & {
    slug: string
    name: string
    href: string
  })[]
  selectedSlug?: string
  /** Business slug inside the selected village: the store sheet replaces the village sheet. */
  selectedBusiness?: string
  /** Every matching product, so the store sheet can list all of that business's products. */
  products?: ProductSummary[]
  preview: boolean
  businessLocations?: ReadonlyMap<string, MapCoordinates>
  closeHref: string
  listHref: string
}) {
  const [t, locale] = await Promise.all([getTranslations('explore.map'), getLocale()])
  const selected = villages.find((village) => village.slug === selectedSlug)
  const hrefOf = (product: ProductSummary) =>
    villages
      .find((village) => village.slug === product.village.slug)
      ?.businessHref(product.business.slug) ?? `/produk/${product.slug}`
  const businessPoints = mapBusinessPins(selected?.businesses ?? [], businessLocations, hrefOf)
  const allBusinessPoints = mapBusinessPins(
    villages.flatMap(({ businesses }) => businesses),
    businessLocations,
    hrefOf,
  )
  const store = selected?.businesses.find(({ business }) => business.slug === selectedBusiness)
  const storePoint = store ? businessLocations?.get(store.business.slug) : undefined
  const storeProducts = store
    ? products.filter(({ business }) => business.slug === store.business.slug)
    : []
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
        href={hrefOf(product)}
        scroll={false}
        aria-label={t('openStoreCard', { name: product.business.name })}
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

  const showSlider = (selected?.businesses.length ?? 0) > 2

  return (
    <div className="flex flex-1 flex-col">
      <ExploreMapFrame listHref={listHref}>
        <ExploreMapCanvas
          villages={[
            ...villages.map(({ slug, name, lat, lng, href, businesses }) => ({
              slug,
              name,
              lat,
              lng,
              href,
              locationCount: businesses.filter(({ business }) =>
                businessLocations?.has(business.slug),
              ).length,
            })),
            ...otherVillages.map((village) => ({
              ...village,
              label: t('otherVillagePin', { name: village.name }),
              locationCount: 0,
              muted: true,
            })),
          ]}
          selectedSlug={selectedSlug}
          selectedBusinessSlug={store ? `business:${store.business.slug}` : undefined}
          businessPoints={businessPoints}
          allBusinessPoints={allBusinessPoints}
        />
      </ExploreMapFrame>

      {selected && store ? (
        <ExploreBusinessSlider key={`store:${store.business.slug}`}>
          <ExploreVillageSheet
            title={store.business.name}
            label={t('storeSelected', { name: store.business.name, village: selected.name })}
            count={`${selected.name} · ${t('productCount', { count: storeProducts.length })}`}
            closeHref={selected.href}
            actions={storeProducts.length > 2 ? <ExploreBusinessSliderControls /> : undefined}
            footer={
              <div className="flex w-full gap-2">
                {storePoint ? (
                  <a
                    href={directions(storePoint)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t('directionsStoreLabel', { name: store.business.name })}
                    className={cn(secondaryAction, 'flex-1')}
                  >
                    <Navigation className="size-4 shrink-0" aria-hidden />
                    {t('directionsStore')}
                  </a>
                ) : null}
                <Link
                  href={`/desa/${selected.slug}/${store.business.slug}`}
                  className={primaryAction}
                >
                  <Store className="size-4 shrink-0" aria-hidden />
                  {t('openStore')}
                </Link>
              </div>
            }
          >
            <StoreProducts
              products={storeProducts}
              preview={preview}
              locale={locale}
              slider={storeProducts.length > 2}
            />
          </ExploreVillageSheet>
        </ExploreBusinessSlider>
      ) : selected ? (
        <ExploreBusinessSlider key={selected.slug}>
          <ExploreVillageSheet
            title={selected.name}
            label={t('selected', { village: selected.name })}
            count={
              <>
                {t('count', { count: selected.businesses.length })}
                <span aria-hidden> · </span>
                <a
                  href={directions(selected)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t('directionsLabel', { village: selected.name })}
                  className="text-accent inline-flex items-center gap-1 font-semibold hover:underline"
                >
                  <Navigation className="size-3 shrink-0" aria-hidden />
                  {t('directionsVillage')}
                </a>
              </>
            }
            closeHref={closeHref}
            actions={showSlider ? <ExploreBusinessSliderControls /> : undefined}
            footer={
              <Link href={selected.listHref} className={primaryAction}>
                {t('listVillage')}
                <ArrowRight className="size-4 shrink-0" aria-hidden />
              </Link>
            }
          >
            {showSlider ? (
              <ExploreBusinessSliderRail locationNote={locationNote}>
                {businessCards}
              </ExploreBusinessSliderRail>
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
        </ExploreBusinessSlider>
      ) : null}
    </div>
  )
}

/** Products of the selected store, as compact cards that open the product page. */
function StoreProducts({
  products,
  preview,
  locale,
  slider,
}: {
  products: ProductSummary[]
  preview: boolean
  locale: string
  slider: boolean
}) {
  const cards = products.map((product) => (
    <li key={product.slug} className="min-w-0">
      <Link
        href={`/produk/${product.slug}`}
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
          <span className="line-clamp-2 font-semibold wrap-anywhere">
            {pick(locale, product.name, product.nameEn)}
          </span>
        </span>
      </Link>
    </li>
  ))
  return slider ? (
    <ExploreBusinessSliderRail>{cards}</ExploreBusinessSliderRail>
  ) : (
    <ul className={cn('mt-2 grid gap-2 p-0.5', products.length === 2 && 'grid-cols-2')}>{cards}</ul>
  )
}
