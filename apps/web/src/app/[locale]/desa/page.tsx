import { buttonVariants } from '@heroui/styles'
import { Container } from '@repo/ui/components/container'
import { LoadingRegion } from '@repo/ui/components/loading-region'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Suspense } from 'react'
import { CatalogueState, CatalogueUnavailable } from '@/components/catalogue-state'
import { PaginationLabel } from '@/components/pagination-label'
import { VillageGrid, VillageGridSkeleton } from '@/components/village-card'
import { Link } from '@/i18n/navigation'
import { getVillagePage, readSection } from '@/lib/data'
import { VILLAGES_PATH } from '@/lib/paths'
import { pageAlternates } from '@/lib/site-url'

const pageSize = 12
const pageHref = (page: number) => (page === 1 ? VILLAGES_PATH : `${VILLAGES_PATH}?page=${page}`)

type Params = Promise<{ locale: string }>

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Params
  searchParams: Promise<{ page?: string | string[] }>
}): Promise<Metadata> {
  const { locale } = await params
  const page = requestedPage((await searchParams).page)
  const t = await getTranslations({ locale, namespace: 'home' })
  return { title: t('villagesTitle'), alternates: pageAlternates(pageHref(page), locale) }
}

function requestedPage(value: string | string[] | undefined) {
  const page = Number(Array.isArray(value) ? value[0] : value)
  return Number.isInteger(page) && page >= 1 && page <= 10_000 ? page : 1
}

export default async function VillagesPage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: Promise<{ page?: string | string[] }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const page = requestedPage((await searchParams).page)
  const [t, states] = await Promise.all([getTranslations('home'), getTranslations('states')])

  return (
    <Container className="pt-3 pb-10 sm:pt-7">
      <h1 className="page-title">{t('villagesTitle')}</h1>
      <div className="mt-4 sm:mt-6">
        <Suspense
          fallback={
            <LoadingRegion label={states('loading')}>
              <VillageGridSkeleton count={pageSize} />
            </LoadingRegion>
          }
        >
          <VillageResults page={page} />
        </Suspense>
      </div>
    </Container>
  )
}

async function VillageResults({ page }: { page: number }) {
  const [result, t, home, states] = await Promise.all([
    readSection(getVillagePage(page, pageSize)),
    getTranslations('explore'),
    getTranslations('home'),
    getTranslations('states'),
  ])
  if (!result) return <CatalogueUnavailable />
  if (!result.meta.total)
    return <CatalogueState title={home('villagesEmpty')} description={states('tryLater')} />
  if (!result.data.length) {
    return (
      <CatalogueState
        title={home('villagesPageEmpty')}
        href={VILLAGES_PATH}
        actionLabel={t('firstPage')}
      />
    )
  }

  const pages = Math.ceil(result.meta.total / pageSize)
  const button = buttonVariants({ variant: 'secondary', className: 'min-h-11 rounded-full px-3' })
  return (
    <>
      <VillageGrid villages={result.data} />
      {pages > 1 ? (
        <nav
          aria-label={t('page', { page, pages })}
          className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-1 text-xs sm:gap-3 sm:text-sm"
        >
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className={`${button} justify-self-start`}>
              <ChevronLeft className="size-4" aria-hidden />
              <PaginationLabel label={t('prev')} />
            </Link>
          ) : (
            <span />
          )}
          <span className="text-muted text-center tabular-nums">{t('page', { page, pages })}</span>
          {page < pages ? (
            <Link href={pageHref(page + 1)} className={`${button} justify-self-end`}>
              <PaginationLabel label={t('next')} />
              <ChevronRight className="size-4" aria-hidden />
            </Link>
          ) : null}
        </nav>
      ) : null}
    </>
  )
}
