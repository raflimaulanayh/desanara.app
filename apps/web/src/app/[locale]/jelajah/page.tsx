import { Container } from '@repo/ui/components/container'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { NotaSheet } from '@/components/nota/nota'
import { ProductRows } from '@/components/product-rows'
import { SearchForm } from '@/components/search-form'
import { Link } from '@/i18n/navigation'
import { localePath } from '@/lib/paths'
import { getCategories, getRegencies, searchProducts } from '@/lib/data'
import { pick } from '@/lib/localize'

type Params = Promise<{ locale: string }>
type Search = Promise<Record<string, string | string[] | undefined>>

const PAGE_SIZE = 20
const SORTS = ['newest', 'price_asc', 'price_desc'] as const

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'explore' })
  return { title: t('title') }
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined

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

  const [t, tNota, results, categories, regencies] = await Promise.all([
    getTranslations('explore'),
    getTranslations('nota'),
    searchProducts({ q, region, category, sort, page, pageSize: PAGE_SIZE }),
    getCategories(),
    getRegencies(),
  ])
  const pages = Math.max(1, Math.ceil(results.meta.total / PAGE_SIZE))
  const hasFilters = Boolean(q || region || category || sort !== 'newest')
  const query = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries({
      q,
      region,
      category,
      sort: sort === 'newest' ? undefined : sort,
      ...overrides,
    })) {
      if (v) params.set(k, v)
    }
    const s = params.toString()
    return s ? `/jelajah?${s}` : '/jelajah'
  }
  const selectClass =
    'border-nota-ink h-12 w-full appearance-none border-b-2 bg-transparent bg-[length:1rem] bg-[right_0.25rem_center] bg-no-repeat pr-7 pl-1 text-base focus:outline-none focus-visible:border-[var(--accent)]'
  const chevron = {
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231f3a8a' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
  }

  return (
    <Container className="py-10 sm:py-14">
      <h1 className="font-print text-[clamp(2.4rem,8vw,4rem)] leading-none font-bold uppercase">
        {t('title')}
      </h1>

      <div className="mt-8 flex flex-col gap-6">
        <SearchForm
          action={localePath(locale, '/jelajah')}
          defaultValue={q}
          placeholder={t('searchPlaceholder')}
          size="md"
          hidden={{ region, category, sort: sort === 'newest' ? undefined : sort }}
        />
        <form
          action={localePath(locale, '/jelajah')}
          method="get"
          className="grid grid-cols-2 items-end gap-x-4 gap-y-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
        >
          {q ? <input type="hidden" name="q" value={q} /> : null}
          <label className="col-span-2 flex flex-col gap-1 sm:col-span-1">
            <span className="font-print text-nota-ink text-xs font-semibold tracking-[0.16em] uppercase">
              {t('region')}
            </span>
            <select
              name="region"
              defaultValue={region ?? ''}
              className={selectClass}
              style={chevron}
            >
              <option value="">{t('all')}</option>
              {regencies.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-print text-nota-ink text-xs font-semibold tracking-[0.16em] uppercase">
              {t('category')}
            </span>
            <select
              name="category"
              defaultValue={category ?? ''}
              className={selectClass}
              style={chevron}
            >
              <option value="">{t('all')}</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {pick(locale, c.name, c.nameEn)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-print text-nota-ink text-xs font-semibold tracking-[0.16em] uppercase">
              {t('sort')}
            </span>
            <select name="sort" defaultValue={sort} className={selectClass} style={chevron}>
              <option value="newest">{t('sortNewest')}</option>
              <option value="price_asc">{t('sortPriceAsc')}</option>
              <option value="price_desc">{t('sortPriceDesc')}</option>
            </select>
          </label>
          <button
            type="submit"
            className="border-nota-ink text-nota-ink hover:bg-nota-blue font-print h-12 border-2 px-5 text-base font-bold tracking-[0.08em] uppercase transition-colors"
          >
            {t('apply')}
          </button>
        </form>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="font-print text-lg font-semibold" aria-live="polite">
            {t('results', { count: results.meta.total })}
          </p>
          {hasFilters ? (
            <Link href="/jelajah" className="text-accent text-sm underline">
              {t('reset')}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-6">
        {results.data.length === 0 ? (
          <div className="border-nota-rule-strong border border-dashed px-6 py-12 text-center">
            <p className="font-print text-2xl font-bold uppercase">{t('emptyTitle')}</p>
            <p className="text-muted mx-auto mt-2 max-w-[48ch]">{t('emptyBody')}</p>
          </div>
        ) : (
          <NotaSheet head={[tNota('name'), tNota('unit'), tNota('price')]}>
            <ProductRows products={results.data} crossVillage />
          </NotaSheet>
        )}
      </div>

      {pages > 1 ? (
        <nav
          aria-label={t('page', { page, pages })}
          className="mt-6 flex items-center justify-between gap-4"
        >
          {page > 1 ? (
            <Link
              href={query({ page: String(page - 1) })}
              className="font-print text-accent inline-flex h-11 items-center gap-1 font-bold uppercase hover:underline"
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
              className="font-print text-accent inline-flex h-11 items-center gap-1 font-bold uppercase hover:underline"
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
