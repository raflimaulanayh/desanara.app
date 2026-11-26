import { buttonVariants } from '@heroui/styles'
import { cn } from '@repo/ui/cn'
import { EmptyState } from '@repo/ui/components/empty-state'
import { StatusMascot } from '@repo/ui/components/status-mascot'
import { ChevronLeft, ChevronRight, MapPin, X } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { ExploreMap } from '@/components/explore-map'
import {
  mapStatusLayout,
  mapStatusNoteLayout,
  mapStatusNoteWithReset,
} from '@/components/explore-results-loading'
import { PaginationLabel } from '@/components/pagination-label'
import { RetryPage } from '@/components/retry-page'
import { ProductGrid } from '@/components/product-card'
import { Link } from '@/i18n/navigation'
import { groupPreviewMapBusinesses, previewBusinessLocations } from '@/lib/catalogue-preview'
import { groupMapBusinesses } from '@/lib/catalogue-map'
import {
  getMapProducts,
  getMapVillagePoints,
  readSection,
  searchProducts,
  type ProductQuery,
} from '@/lib/data'
import { VILLAGES_HASH } from '@/lib/paths'

const actionClass = buttonVariants({
  variant: 'primary',
  className: 'min-h-11 rounded-full px-4 font-semibold',
})

export async function ExploreResults({
  queryParams,
  mapView,
  selectedSlug,
  href: query,
  preview,
  villageName,
  filtersUnavailable,
}: {
  queryParams: ProductQuery & { page: number; pageSize: number }
  mapView: boolean
  selectedSlug?: string
  href: (overrides: Record<string, string | undefined>) => string
  preview: boolean
  villageName?: string
  filtersUnavailable: boolean
}) {
  const t = await getTranslations('explore')
  const listHref = query({ view: undefined })
  const resetHref = mapView ? '/jelajah?view=map' : '/jelajah'
  const { q, region, category, village, sort, page, pageSize } = queryParams
  const isFiltered = Boolean(q || region || category || village)
  const hasFilters = isFiltered || sort !== 'newest'
  const results = await readSection(
    mapView && !preview ? getMapProducts(queryParams) : searchProducts(queryParams),
  )

  if (!results) {
    return (
      <div className={mapView ? 'px-4 py-4 sm:px-6' : 'mt-5'}>
        <div role="alert">
          <EmptyState
            title={t('errorTitle')}
            description={t('errorBody')}
            illustration={<StatusMascot pose="unavailable" />}
            action={<RetryPage />}
          />
        </div>
        {mapView ? (
          <Link
            href={listHref}
            className="text-accent mt-2 inline-flex min-h-11 items-center px-2 text-sm font-semibold hover:underline"
          >
            {t('map.backToList')}
          </Link>
        ) : null}
      </div>
    )
  }

  const locations = mapView && !preview ? await getMapVillagePoints(results.data) : null
  const mapResultsIncomplete = 'incomplete' in results && results.incomplete
  const mapVillages = mapView
    ? preview
      ? groupPreviewMapBusinesses(results.data)
      : groupMapBusinesses(results.data, locations?.points ?? [])
    : []
  villageName ??= results.data.find((product) => product.village.slug === village)?.village.name
  const pages = Math.max(1, Math.ceil(results.meta.total / pageSize))
  const emptyPage = !mapView && page > pages && results.meta.total > 0
  const state = emptyPage ? 'emptyPage' : isFiltered ? 'empty' : 'emptyCatalogue'
  const emptyState =
    results.data.length === 0 && !mapResultsIncomplete ? (
      <EmptyState
        title={t(`${state}Title`)}
        description={t(`${state}Body`)}
        className={mapView ? 'mx-4 mb-3 gap-1 py-3 sm:mx-6 sm:py-3' : undefined}
        illustration={mapView ? undefined : <StatusMascot pose="empty" />}
        action={
          <Link
            className={actionClass}
            href={emptyPage ? query({}) : isFiltered ? resetHref : `/#${VILLAGES_HASH}`}
          >
            {t(emptyPage ? 'firstPage' : isFiltered ? 'showAllProducts' : 'browseVillages')}
          </Link>
        }
      />
    ) : null

  return (
    <>
      <div className={mapView ? 'flex flex-1 flex-col' : 'mt-3 sm:mt-4'}>
        {filtersUnavailable ? (
          <div className={cn('mb-2 flex flex-wrap items-center gap-2', mapView && 'px-4 sm:px-6')}>
            <p role="status" className="text-muted text-sm">
              {t('filtersUnavailable')}
            </p>
            <RetryPage compact />
          </div>
        ) : null}
        <div
          className={cn(
            'flex min-h-9 flex-wrap gap-x-3',
            mapView ? mapStatusLayout : 'mb-2 items-center justify-between',
            emptyState && !mapView && 'sr-only',
          )}
        >
          <p
            className={cn(
              'text-sm leading-5 font-semibold',
              emptyState && 'sr-only',
              mapView ? 'text-foreground tabular-nums' : 'text-muted',
            )}
            aria-live="polite"
          >
            {t('results', { count: results.meta.total })}
          </p>
          {hasFilters && !emptyState ? (
            <Link
              href={resetHref}
              className={cn(
                'text-accent inline-flex min-h-9 items-center text-sm font-semibold hover:underline',
                mapView && 'ml-auto min-h-7 sm:ml-0',
              )}
            >
              {t('reset')}
            </Link>
          ) : null}
          {mapView ? (
            <p
              className={cn(
                'text-muted',
                mapStatusNoteLayout,
                hasFilters && mapStatusNoteWithReset,
              )}
            >
              {t(preview ? 'map.approximate' : 'map.villageCentres')}
            </p>
          ) : null}
        </div>
        {villageName ? (
          <Link
            href={query({ village: undefined })}
            aria-label={t('map.removeVillage', { village: villageName })}
            scroll={false}
            className={cn(
              'bg-accent/8 hover:bg-accent/14 mb-3 inline-flex min-h-9 items-center gap-2 rounded-full px-3 text-xs font-semibold',
              mapView && 'mx-4 self-start sm:mx-6',
            )}
          >
            <MapPin className="text-accent size-4 shrink-0" aria-hidden />
            <span className="min-w-0 wrap-anywhere">{villageName}</span>
            <X className="text-muted size-4 shrink-0" aria-hidden />
          </Link>
        ) : null}
        {mapView ? (
          <>
            {emptyState ??
              (locations?.incomplete || mapResultsIncomplete ? (
                <div className="bg-surface flex flex-wrap items-center justify-between gap-1 px-4 pb-2 sm:px-6">
                  <p role="status" className="text-muted text-sm">
                    {t(
                      mapResultsIncomplete ? 'map.resultsUnavailable' : 'map.locationsUnavailable',
                    )}
                  </p>
                  <RetryPage compact />
                </div>
              ) : mapVillages.length === 0 ? (
                <p className="text-muted bg-surface px-4 pb-3 text-center text-sm">
                  {t('map.noVillagePoints')}
                </p>
              ) : null)}
            <ExploreMap
              villages={mapVillages.map((point) => ({
                ...point,
                href: query({ selected: point.slug }),
                listHref: query({ view: undefined, village: point.slug }),
              }))}
              selectedSlug={selectedSlug}
              preview={preview}
              businessLocations={preview ? previewBusinessLocations : undefined}
              closeHref={query({})}
              listHref={listHref}
            />
          </>
        ) : (
          (emptyState ?? <ProductGrid products={results.data} mobileList preview={preview} />)
        )}
      </div>

      {!mapView && !emptyState && pages > 1 ? (
        <nav
          aria-label={t('page', { page, pages })}
          className="mt-8 flex items-center justify-between gap-4"
        >
          {page > 1 ? (
            <Link
              href={query({ page: String(page - 1) })}
              className="border-line-strong inline-flex h-9 items-center gap-1 rounded-full border px-3 text-sm font-semibold"
            >
              <ChevronLeft className="size-4" aria-hidden />
              <PaginationLabel label={t('prev')} />
            </Link>
          ) : (
            <span />
          )}
          <span className="text-muted text-sm">{t('page', { page, pages })}</span>
          {page < pages ? (
            <Link
              href={query({ page: String(page + 1) })}
              className="border-line-strong inline-flex h-9 items-center gap-1 rounded-full border px-3 text-sm font-semibold"
            >
              <PaginationLabel label={t('next')} />
              <ChevronRight className="size-4" aria-hidden />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </>
  )
}
