import { cn } from '@repo/ui/cn'
import { Container } from '@repo/ui/components/container'
import { ChevronLeft, ChevronRight, List, Map, MapPin, X } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ExploreFilters } from '@/components/explore-filters'
import { ExploreMap } from '@/components/explore-map'
import { ProductGrid } from '@/components/product-card'
import { SearchForm } from '@/components/search-form'
import { Link } from '@/i18n/navigation'
import {
  groupPreviewMapBusinesses,
  isCataloguePreview,
  previewCategories,
  previewProducts,
  previewRegency,
  searchPreviewProducts,
} from '@/lib/catalogue-preview'
import { getCategories, getRegencies, searchProducts } from '@/lib/data'
import { pick } from '@/lib/localize'
import { localePath } from '@/lib/paths'
import { pageAlternates } from '@/lib/site-url'

type Params = Promise<{ locale: string }>
type Search = Promise<Record<string, string | string[] | undefined>>

const PAGE_SIZE = 20
const SORTS = ['newest', 'price_asc', 'price_desc'] as const

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'explore' })
  return { title: t('title'), alternates: pageAlternates('/jelajah', locale) }
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined

const ALL = '_all'

function filterValue(value: string | string[] | undefined) {
  const key = one(value)
  return key === ALL ? undefined : key
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
  const q = one(sp.q)?.slice(0, 100)
  const region = filterValue(sp.region)
  const category = filterValue(sp.category)
  const sortParam = one(sp.sort)
  const sort = SORTS.find((s) => s === sortParam) ?? 'newest'
  const page = Math.max(1, Number.parseInt(one(sp.page) ?? '1', 10) || 1)

  const preview = isCataloguePreview()
  const mapView = preview && one(sp.view) === 'map'
  const view = mapView ? 'map' : undefined
  const village = preview ? one(sp.village) : undefined
  const selectedSlug = mapView ? one(sp.selected) : undefined
  const queryParams = {
    q,
    region,
    category,
    village,
    sort,
    page: mapView ? 1 : page,
    pageSize: mapView ? previewProducts.length : PAGE_SIZE,
  }
  const [t, results, categories, regencies] = await Promise.all([
    getTranslations('explore'),
    preview ? searchPreviewProducts(queryParams) : searchProducts(queryParams),
    preview ? previewCategories : getCategories(),
    preview ? [previewRegency] : getRegencies(),
  ])
  const pages = Math.max(1, Math.ceil(results.meta.total / PAGE_SIZE))
  const hasFilters = Boolean(q || region || category || village || sort !== 'newest')
  const activeFilterCount =
    Number(Boolean(region)) + Number(sort !== 'newest') + Number(Boolean(mapView && category))
  const villageName =
    village && previewProducts.find((product) => product.village.slug === village)?.village.name
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
  const emptyMessage = (
    <>
      <p className="section-title">{t('emptyTitle')}</p>
      <p className="text-muted mx-auto mt-1 max-w-[48ch] text-sm">{t('emptyBody')}</p>
    </>
  )

  return (
    <Container
      className={cn(
        'catalogue-explore',
        mapView
          ? 'catalogue-explore-map flex max-w-none flex-1 flex-col px-0 sm:px-0'
          : 'pt-2 pb-8 sm:pt-7 sm:pb-10',
      )}
    >
      <h1 className={mapView ? 'sr-only' : 'page-title'}>
        {mapView ? t('map.title') : t('title')}
      </h1>

      <div
        className={cn(
          'flex',
          mapView
            ? 'bg-surface flex-wrap items-center gap-2 px-4 pt-3 pb-1 sm:px-6'
            : 'mt-3 flex-col gap-3 sm:mt-5 sm:gap-4',
        )}
      >
        <SearchForm
          action={action}
          defaultValue={q}
          placeholder={mapView ? t('map.searchPlaceholder') : t('searchPlaceholder')}
          hidden={{ category, region, village, view, sort: sort === 'newest' ? undefined : sort }}
          className={cn('sm:max-w-lg', mapView && 'flex-[1_1_12rem]')}
        />
        {mapView ? null : (
          <nav aria-label={t('category')}>
            <ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-0.5 sm:mx-0 sm:flex-wrap sm:px-0">
              {[{ slug: undefined as string | undefined, label: t('allCategories') }]
                .concat(
                  categories.map((c) => ({ slug: c.slug, label: pick(locale, c.name, c.nameEn) })),
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
            hidden={{ q, view, village, category: mapView ? undefined : category }}
            fields={[
              {
                name: 'region',
                label: t('region'),
                value: regencies.find((item) => item.code === region)?.code ?? ALL,
                options: [
                  { id: ALL, label: t('allRegions') },
                  ...regencies.map((item) => ({ id: item.code, label: item.name })),
                ],
              },
              ...(mapView
                ? [
                    {
                      name: 'category',
                      label: t('category'),
                      value: categories.find((item) => item.slug === category)?.slug ?? ALL,
                      options: [
                        { id: ALL, label: t('map.allCategories') },
                        ...categories.map((item) => ({
                          id: item.slug,
                          label: pick(locale, item.name, item.nameEn),
                        })),
                      ],
                    },
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
          {preview && !mapView ? (
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

      <div className={mapView ? 'flex flex-1 flex-col' : 'mt-3 sm:mt-4'}>
        <div
          className={cn(
            'flex min-h-9 flex-wrap gap-x-3',
            mapView
              ? 'bg-surface items-baseline gap-y-1 px-4 py-2 sm:px-6'
              : 'mb-2 items-center justify-between',
          )}
        >
          <p
            className={cn(
              'text-sm leading-5 font-semibold',
              mapView ? 'text-foreground tabular-nums' : 'text-muted',
            )}
            aria-live="polite"
          >
            {t('results', { count: results.meta.total })}
          </p>
          {hasFilters ? (
            <Link
              href={view ? '/jelajah?view=map' : '/jelajah'}
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
                'text-muted ml-auto text-xs leading-5',
                hasFilters && 'ml-0 basis-full sm:ml-auto sm:basis-auto',
              )}
            >
              {t('map.approximate')}
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
            {results.data.length === 0 ? (
              <div className="bg-surface px-4 pt-1 pb-3 text-center">{emptyMessage}</div>
            ) : null}
            <ExploreMap
              villages={groupPreviewMapBusinesses(results.data).map((point) => ({
                ...point,
                href: query({ selected: point.slug }),
                listHref: query({ view: undefined, village: point.slug }),
              }))}
              selectedSlug={selectedSlug}
              closeHref={query({})}
              listHref={query({ view: undefined })}
            />
          </>
        ) : results.data.length === 0 ? (
          <div className="bg-wash rounded-3xl px-6 py-14 text-center">{emptyMessage}</div>
        ) : (
          <ProductGrid products={results.data} mobileList preview={preview} />
        )}
      </div>

      {!mapView && pages > 1 ? (
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
              {t('prev')}
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
              {t('next')}
              <ChevronRight className="size-4" aria-hidden />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </Container>
  )
}
