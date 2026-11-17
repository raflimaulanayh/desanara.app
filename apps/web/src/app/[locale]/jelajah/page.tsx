import { cn } from '@repo/ui/cn'
import { Container } from '@repo/ui/components/container'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ProductGrid } from '@/components/product-card'
import { Link } from '@/i18n/navigation'
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

const selectClass =
  'border-line-strong bg-surface focus:border-accent h-11 w-full rounded-full border px-4 text-sm font-medium focus:outline-none'

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
  const region = one(sp.region)
  const category = one(sp.category)
  const sortParam = one(sp.sort)
  const sort = SORTS.find((s) => s === sortParam) ?? 'newest'
  const page = Math.max(1, Number.parseInt(one(sp.page) ?? '1', 10) || 1)

  const [t, results, categories, regencies] = await Promise.all([
    getTranslations('explore'),
    searchProducts({ q, region, category, sort, page, pageSize: PAGE_SIZE }),
    getCategories(),
    getRegencies(),
  ])
  const pages = Math.max(1, Math.ceil(results.meta.total / PAGE_SIZE))
  const hasFilters = Boolean(q || region || category || sort !== 'newest')
  const query = (overrides: Record<string, string | undefined>) => {
    const out = new URLSearchParams()
    for (const [k, v] of Object.entries({
      q,
      region,
      category,
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
    <Container className="py-8 sm:py-10">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t('title')}</h1>

      <div className="mt-5 flex flex-col gap-4">
        <nav aria-label={t('category')}>
          <ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
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
                        'inline-flex h-11 items-center rounded-full border px-4 text-sm font-semibold transition-colors',
                        active
                          ? 'bg-accent text-accent-foreground border-transparent'
                          : 'border-line-strong bg-surface hover:border-accent',
                      )}
                    >
                      {c.label}
                    </Link>
                  </li>
                )
              })}
          </ul>
        </nav>

        <form
          action={action}
          method="get"
          className="grid grid-cols-2 gap-2 sm:max-w-xl sm:grid-cols-[1fr_1fr_auto]"
        >
          {q ? <input type="hidden" name="q" value={q} /> : null}
          {category ? <input type="hidden" name="category" value={category} /> : null}
          <label>
            <span className="sr-only">{t('region')}</span>
            <select name="region" defaultValue={region ?? ''} className={selectClass}>
              <option value="">{t('region')}</option>
              {regencies.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">{t('sort')}</span>
            <select name="sort" defaultValue={sort} className={selectClass}>
              <option value="newest">{t('sortNewest')}</option>
              <option value="price_asc">{t('sortPriceAsc')}</option>
              <option value="price_desc">{t('sortPriceDesc')}</option>
            </select>
          </label>
          <button
            type="submit"
            className="bg-foreground text-background col-span-2 h-11 rounded-full px-6 text-sm font-bold sm:col-span-1"
          >
            {t('apply')}
          </button>
        </form>

        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="text-muted text-sm font-medium" aria-live="polite">
            {t('results', { count: results.meta.total })}
          </p>
          {hasFilters ? (
            <Link href="/jelajah" className="text-accent text-sm font-semibold hover:underline">
              {t('reset')}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-5">
        {results.data.length === 0 ? (
          <div className="bg-wash rounded-3xl px-6 py-14 text-center">
            <p className="text-xl font-extrabold">{t('emptyTitle')}</p>
            <p className="text-muted mx-auto mt-2 max-w-[48ch]">{t('emptyBody')}</p>
          </div>
        ) : (
          <ProductGrid products={results.data} />
        )}
      </div>

      {pages > 1 ? (
        <nav
          aria-label={t('page', { page, pages })}
          className="mt-8 flex items-center justify-between gap-4"
        >
          {page > 1 ? (
            <Link
              href={query({ page: String(page - 1) })}
              className="border-line-strong inline-flex h-11 items-center gap-1 rounded-full border px-4 text-sm font-semibold"
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
              className="border-line-strong inline-flex h-11 items-center gap-1 rounded-full border px-4 text-sm font-semibold"
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
