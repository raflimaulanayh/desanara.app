import { cn } from '@repo/ui/cn'
import { Container } from '@repo/ui/components/container'
import { List, Map } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Suspense } from 'react'
import { ExploreFilters } from '@/components/explore-filters'
import {
  ExplorePageSkeleton,
  ExploreResultsLoading,
  explorePageLayout,
  exploreToolbarLayout,
} from '@/components/explore-results-loading'
import { SearchForm } from '@/components/search-form'
import { Link } from '@/i18n/navigation'
import {
  isCataloguePreview,
  previewCategories,
  previewProducts,
  previewRegencies,
} from '@/lib/catalogue-preview'
import { getCategories, getRegencies, getVillagesForFilter, readSection } from '@/lib/data'
import { ALL_FILTER_OPTIONS as ALL, regencyCode } from '@/lib/explore-filters'
import { pick } from '@/lib/localize'
import { localePath } from '@/lib/paths'
import { pageAlternates } from '@/lib/site-url'
import { ExploreResults } from './results'

type Params = Promise<{ locale: string }>
type Query = Record<string, string | string[] | undefined>
type Search = Promise<Query>

const PAGE_SIZE = 20
const SORTS = ['newest', 'price_asc', 'price_desc'] as const

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'explore' })
  return { title: t('title'), alternates: pageAlternates('/jelajah', locale) }
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined

function filterValue(value: string | string[] | undefined) {
  const key = one(value)
  return key === ALL ? undefined : key
}

function hasExploreFilters(search: Query) {
  return Boolean(
    one(search.q) ||
    filterValue(search.region) ||
    filterValue(search.category) ||
    filterValue(search.village) ||
    SORTS.slice(1).some((sort) => sort === one(search.sort)),
  )
}

export default async function ExplorePage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: Search
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const sp = await searchParams
  const t = await getTranslations('explore')
  const mapView = one(sp.view) === 'map'
  return (
    <Suspense
      fallback={
        <ExplorePageSkeleton
          label={t('loading')}
          title={t(mapView ? 'map.title' : 'title')}
          mapView={mapView}
          filtered={hasExploreFilters(sp)}
        />
      }
    >
      <ExploreView sp={sp} locale={locale} mapView={mapView} />
    </Suspense>
  )
}

async function ExploreView({
  sp,
  locale,
  mapView,
}: {
  sp: Query
  locale: string
  mapView: boolean
}) {
  const q = one(sp.q)?.slice(0, 100)
  const region = filterValue(sp.region)
  const category = filterValue(sp.category)
  const sortParam = one(sp.sort)
  const sort = SORTS.find((s) => s === sortParam) ?? 'newest'
  const page = Math.max(1, Number.parseInt(one(sp.page) ?? '1', 10) || 1)

  const preview = isCataloguePreview()
  const view = mapView ? 'map' : undefined
  const village = filterValue(sp.village)
  const selectedSlug = mapView ? one(sp.selected) : undefined
  const queryParams = {
    q,
    region,
    category,
    village,
    sort,
    page: mapView ? 1 : page,
    pageSize: mapView && preview ? previewProducts.length : PAGE_SIZE,
  }
  const [t, categories, regencies, villages] = await Promise.all([
    getTranslations('explore'),
    preview ? previewCategories : readSection(getCategories()),
    preview ? previewRegencies : readSection(getRegencies()),
    readSection(getVillagesForFilter()),
  ])
  const selectedVillage = villages?.find(({ slug }) => slug === village)
  const activeFilterCount =
    [region, village, category].filter(Boolean).length + Number(sort !== 'newest')
  const query = (overrides: Record<string, string | undefined>) => {
    const out = new URLSearchParams()
    for (const [k, v] of Object.entries({
      q,
      region,
      category,
      village,
      view,
      sort: sort === 'newest' ? undefined : sort,
      ...overrides,
    })) {
      if (v) out.set(k, v)
    }
    const s = out.toString()
    return s ? `/jelajah?${s}` : '/jelajah'
  }
  const action = localePath(locale, '/jelajah')
  return (
    <Container className={explorePageLayout(mapView)}>
      <h1 className={mapView ? 'sr-only' : 'page-title'}>
        {mapView ? t('map.title') : t('title')}
      </h1>

      <div className={exploreToolbarLayout(mapView)}>
        <SearchForm
          key={q}
          action={action}
          defaultValue={q}
          placeholder={mapView ? t('map.searchPlaceholder') : t('searchPlaceholder')}
          hidden={{ category, region, village, view, sort: sort === 'newest' ? undefined : sort }}
          className={cn('sm:max-w-lg', mapView && 'flex-[1_1_12rem]')}
        />
        {mapView ? null : (
          <nav aria-label={t('category')}>
            <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 py-0.5 sm:mx-0 sm:flex-wrap sm:px-0">
              {[{ slug: undefined as string | undefined, label: t('allCategories') }]
                .concat(
                  (categories ?? []).map((c) => ({
                    slug: c.slug,
                    label: pick(locale, c.name, c.nameEn),
                  })),
                )
                .map((c) => {
                  const active = (c.slug ?? undefined) === category
                  return (
                    <li key={c.slug ?? 'all'} className="shrink-0">
                      <Link
                        href={query({ category: c.slug, page: undefined })}
                        aria-current={active ? 'true' : undefined}
                        className={cn(
                          'inline-flex h-9 items-center rounded-full px-3 text-xs font-semibold transition-colors focus-visible:outline-offset-[-2px]',
                          active
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-accent/7 hover:bg-accent/14',
                        )}
                      >
                        {c.label}
                      </Link>
                    </li>
                  )
                })}
            </ul>
          </nav>
        )}

        <div className={mapView ? 'contents' : 'flex items-center justify-between gap-2'}>
          <ExploreFilters
            key={query({})}
            action={action}
            activeCount={activeFilterCount}
            hidden={{
              q,
              view,
              village: villages ? undefined : village,
              category: categories ? undefined : category,
              region: regencies ? undefined : region,
            }}
            fields={[
              ...(regencies
                ? [
                    {
                      name: 'region',
                      label: t('region'),
                      searchLabel: t('searchRegion'),
                      all: t('allRegions'),
                      value: regencies.find((item) => item.code === region)?.code ?? ALL,
                      options: regencies.map((item) => ({ id: item.code, label: item.name })),
                    } as const,
                  ]
                : []),
              ...(villages
                ? [
                    {
                      name: 'village',
                      label: t('village'),
                      searchLabel: t('searchVillage'),
                      all: t('allVillages'),
                      value: selectedVillage?.slug ?? ALL,
                      options: villages.map((item) => ({
                        id: item.slug,
                        label: item.name,
                        region: regencyCode(item.regionCode),
                      })),
                    } as const,
                  ]
                : []),
              ...(categories
                ? [
                    {
                      name: 'category',
                      label: t('category'),
                      searchLabel: t('searchCategory'),
                      all: t('map.allCategories'),
                      value: categories.find((item) => item.slug === category)?.slug ?? ALL,
                      options: categories.map((item) => ({
                        id: item.slug,
                        label: pick(locale, item.name, item.nameEn),
                      })),
                    } as const,
                  ]
                : []),
              {
                name: 'sort',
                label: t('sort'),
                value: sort,
                options: [
                  { id: 'newest', label: t('sortNewest') },
                  { id: 'price_asc', label: t('sortPriceAsc') },
                  { id: 'price_desc', label: t('sortPriceDesc') },
                ],
              },
            ]}
          />
          {!mapView ? (
            <nav
              aria-label={t('map.viewLabel')}
              className="border-line bg-surface flex items-center rounded-full border p-0.5"
            >
              {(
                [
                  { value: undefined, Icon: List, label: t('map.listMode') },
                  { value: 'map', Icon: Map, label: t('map.mapMode') },
                ] as const
              ).map(({ value, Icon, label }) => (
                <Link
                  key={label}
                  href={query({ view: value })}
                  aria-current={value === undefined ? 'page' : undefined}
                  scroll={false}
                  className={cn(
                    'flex min-h-8 items-center justify-center gap-1.5 rounded-full px-2.5 text-xs font-semibold transition-colors',
                    value === undefined
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted hover:bg-accent/8 hover:text-foreground',
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
                  {label}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
      </div>

      <Suspense
        key={query({})}
        fallback={
          <ExploreResultsLoading
            label={t('loading')}
            mapView={mapView}
            filtered={hasExploreFilters(sp)}
          />
        }
      >
        <ExploreResults
          queryParams={queryParams}
          mapView={mapView}
          selectedSlug={selectedSlug}
          href={query}
          preview={preview}
          villageName={selectedVillage?.name}
          filtersUnavailable={!categories || !regencies || !villages}
        />
      </Suspense>
    </Container>
  )
}
