import { buttonVariants } from '@heroui/styles'
import { cn } from '@repo/ui/cn'
import { Container } from '@repo/ui/components/container'
import { LoadingRegion, SkeletonBlock } from '@repo/ui/components/loading-region'
import { ChevronDown, Map as MapIcon } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Suspense } from 'react'
import { CatalogueState, CatalogueUnavailable } from '@/components/catalogue-state'
import { ExploreFilters } from '@/components/explore-filters'
import { ExploreMapCanvas } from '@/components/explore-map-canvas'
import { ExploreMapFrame } from '@/components/explore-map-frame'
import {
  ExploreResultsLoading,
  exploreToolbarLayout,
  mapPageLayout,
  mapStatusLayout,
  mapStatusNoteLayout,
} from '@/components/explore-results-loading'
import { PaginationLabel } from '@/components/pagination-label'
import { VillageGrid, VillageGridSkeleton } from '@/components/village-card'
import { VillageDirectorySearch } from '@/components/village-directory-search'
import { Link } from '@/i18n/navigation'
import { isCataloguePreview, previewRegencies } from '@/lib/catalogue-preview'
import {
  getDirectoryMapPoints,
  getRegencies,
  getVillageDirectory,
  readSection,
  VILLAGES_PER_LOAD,
} from '@/lib/data'
import { ALL_FILTER_OPTIONS } from '@/lib/explore-filters'
import { localePath, VILLAGES_PATH } from '@/lib/paths'
import { pageAlternates } from '@/lib/site-url'

type PageProps = {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

type DirectoryOptions = { page: number; query: string; region?: string; view?: 'map' }

function directoryHref({ page = 1, query, region, view }: Partial<DirectoryOptions> = {}) {
  const params = new URLSearchParams()
  if (query) params.set('q', query)
  if (region) params.set('region', region)
  if (view) params.set('view', view)
  if (page > 1) params.set('page', String(page))
  return params.size ? `${VILLAGES_PATH}?${params}` : VILLAGES_PATH
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

function requestedPage(value: string | string[] | undefined) {
  const page = Number(first(value))
  return Number.isInteger(page) && page >= 1 && page <= 10_000 ? page : 1
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const search = await searchParams
  const t = await getTranslations({ locale, namespace: 'home' })
  return {
    title: t('villagesTitle'),
    alternates: pageAlternates(directoryHref({ page: requestedPage(search.page) }), locale),
  }
}

export default async function VillagesPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const search = await searchParams
  const region = first(search.region)
  const options: DirectoryOptions = {
    page: requestedPage(search.page),
    query: first(search.q)?.trim().slice(0, 100) || '',
    region: region && /^\d{2}\.\d{2}$/.test(region) ? region : undefined,
    view: first(search.view) === 'map' ? 'map' : undefined,
  }
  const { query, view } = options
  const mapView = view === 'map'
  const action = localePath(locale, VILLAGES_PATH)
  const [home, states, map] = await Promise.all([
    getTranslations('home'),
    getTranslations('states'),
    getTranslations('explore.map'),
  ])

  return (
    <Container className={cn('village-directory', mapView ? mapPageLayout : 'pt-3 pb-10 sm:pt-7')}>
      <h1 className={mapView ? 'sr-only' : 'page-title'}>
        {mapView ? map('title') : home('villagesTitle')}
      </h1>
      <div
        className={
          mapView ? exploreToolbarLayout(true) : 'mt-3 flex flex-wrap items-center gap-2 sm:mt-4'
        }
      >
        <VillageDirectorySearch action={action} query={query} region={options.region} view={view} />
        <div
          className={cn(
            'flex shrink-0 items-center gap-2',
            !mapView && 'w-full justify-between sm:w-auto sm:justify-start',
          )}
        >
          <Suspense fallback={<SkeletonBlock className="h-9 w-20 rounded-full" />}>
            <DirectoryFilters key={directoryHref(options)} action={action} options={options} />
          </Suspense>
          {mapView ? null : (
            <Link
              href={directoryHref({ ...options, view: 'map' })}
              className={buttonVariants({
                variant: 'secondary',
                size: 'sm',
                className: 'min-h-9 rounded-full px-3 text-xs font-semibold',
              })}
            >
              <MapIcon className="size-3.5" aria-hidden />
              {map('mapMode')}
            </Link>
          )}
        </div>
      </div>
      <div className={mapView ? 'flex flex-1 flex-col' : 'mt-4 sm:mt-6'}>
        <Suspense
          key={directoryHref({ ...options, page: 1 })}
          fallback={
            mapView ? (
              <ExploreResultsLoading label={map('loading')} mapView filtered={false} />
            ) : (
              <LoadingRegion label={states('loading')}>
                <VillageGridSkeleton count={VILLAGES_PER_LOAD} />
              </LoadingRegion>
            )
          }
        >
          <VillageResults options={options} />
        </Suspense>
      </div>
    </Container>
  )
}

async function DirectoryFilters({
  action,
  options,
}: {
  action: string
  options: DirectoryOptions
}) {
  const { query, view, region } = options
  const [t, regencies] = await Promise.all([
    getTranslations('explore'),
    isCataloguePreview() ? previewRegencies : readSection(getRegencies()),
  ])
  if (!regencies)
    return (
      <p role="status" className="text-muted text-xs">
        {t('filtersUnavailable')}
      </p>
    )

  return (
    <ExploreFilters
      action={action}
      activeCount={Number(Boolean(region))}
      hidden={{ q: query, view }}
      fields={[
        {
          name: 'region',
          label: t('region'),
          searchLabel: t('searchRegion'),
          all: t('allRegions'),
          value: regencies.find(({ code }) => code === region)?.code ?? ALL_FILTER_OPTIONS,
          options: regencies.map(({ code, name }) => ({ id: code, label: name })),
        },
      ]}
    />
  )
}

async function VillageResults({ options }: { options: DirectoryOptions }) {
  const { page, query, region, view } = options
  const mapView = view === 'map'
  const filtered = Boolean(query || region)
  const [result, t, home, states] = await Promise.all([
    readSection(getVillageDirectory(mapView ? undefined : page, query, region)),
    getTranslations('village'),
    getTranslations('home'),
    getTranslations('states'),
  ])
  const resetHref = directoryHref({ view })
  if (!result?.data.length) {
    const notice = !result ? (
      <CatalogueUnavailable />
    ) : filtered ? (
      <CatalogueState
        title={t('directoryEmpty')}
        description={t('directoryEmptyBody')}
        href={resetHref}
        actionLabel={home('seeAllVillages')}
        compact={mapView}
      />
    ) : (
      <CatalogueState
        title={home('villagesEmpty')}
        description={states('tryLater')}
        compact={mapView}
      />
    )
    return mapView ? (
      <ExploreMapFrame listHref={directoryHref({ ...options, view: undefined })}>
        <div className="grid min-h-64 place-items-center px-4 pb-16">{notice}</div>
      </ExploreMapFrame>
    ) : (
      notice
    )
  }

  if (mapView) return <VillageMapResults villages={result.data} options={options} />

  return (
    <>
      <VillageGrid villages={result.data} />
      <div className="mt-5 flex flex-col items-center gap-2">
        <p role="status" className="text-muted text-xs tabular-nums">
          {t('directoryShowing', { shown: result.data.length, total: result.total })}
        </p>
        {result.data.length < result.total ? (
          <Link
            href={directoryHref({ ...options, page: page + 1 })}
            prefetch={false}
            scroll={false}
            className={buttonVariants({
              variant: 'secondary',
              className: 'min-h-11 min-w-44 rounded-full px-4 font-semibold',
            })}
          >
            <PaginationLabel label={t('directoryMore')} />
            <ChevronDown className="size-4 shrink-0" aria-hidden />
          </Link>
        ) : null}
      </div>
    </>
  )
}

async function VillageMapResults({
  villages,
  options,
}: {
  villages: Awaited<ReturnType<typeof getVillageDirectory>>['data']
  options: DirectoryOptions
}) {
  const [{ points, incomplete }, t, map] = await Promise.all([
    getDirectoryMapPoints(villages),
    getTranslations('village'),
    getTranslations('explore.map'),
  ])
  const names = new Map(villages.map(({ slug, name }) => [slug, name]))
  const markers = points.flatMap((point) => {
    const name = names.get(point.slug)
    return name
      ? [
          {
            ...point,
            name,
            href: `${VILLAGES_PATH}/${point.slug}`,
            label: t('directoryOpenVillage', { name }),
            locationCount: 0,
          },
        ]
      : []
  })

  return (
    <>
      <div className={cn('flex min-h-9 flex-wrap gap-x-3', mapStatusLayout)}>
        <p role="status" className="text-sm font-semibold tabular-nums">
          {markers.length === villages.length
            ? t('directoryMapCount', { count: markers.length })
            : t('directoryMapPartial', { count: markers.length, total: villages.length })}
        </p>
        {markers.length ? (
          <p className={cn('text-muted', mapStatusNoteLayout)}>
            {map(incomplete ? 'locationsUnavailable' : 'villageCentres')}
          </p>
        ) : null}
      </div>
      <ExploreMapFrame listHref={directoryHref({ ...options, view: undefined })}>
        {markers.length ? (
          <ExploreMapCanvas villages={markers} businessPoints={[]} allBusinessPoints={[]} />
        ) : (
          <div className="grid min-h-64 place-items-center px-4 pb-16">
            {incomplete ? (
              <CatalogueUnavailable />
            ) : (
              <CatalogueState title={map('noVillagePoints')} compact />
            )}
          </div>
        )}
      </ExploreMapFrame>
    </>
  )
}
