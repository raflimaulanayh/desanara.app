import { Container } from '@repo/ui/components/container'
import { cn } from '@repo/ui/cn'
import { ChevronRight, MapPin } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Suspense } from 'react'
import { CatalogueState, CatalogueUnavailable } from '@/components/catalogue-state'
import { OpenStatusBadge } from '@/components/open-status'
import { ProductGrid } from '@/components/product-card'
import { VillagePageSkeleton } from '@/components/public-detail-skeletons'
import {
  villageBusinessGrid,
  villageCover,
  villageCrestPosition,
} from '@/components/public-page-layout'
import { TrackView } from '@/components/track-view'
import { VerifiedBadge } from '@/components/verified-badge'
import { VillageLogo } from '@/components/village-logo'
import { VillageTheme } from '@/components/village/village-theme'
import { Link } from '@/i18n/navigation'
import { isCataloguePreview } from '@/lib/catalogue-preview'
import { getVillage, getVillageBusinesses, readSection, searchProducts } from '@/lib/data'
import { mediaUrl } from '@/lib/media'
import { initialStatus } from '@/lib/status'
import { pageAlternates } from '@/lib/site-url'
import { villageCrest } from '@/lib/village-crest'

export const revalidate = 300

type Params = Promise<{ locale: string; village: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, village: slug } = await params
  const village = await readSection(getVillage(slug))
  if (!village) return {}
  const banner = mediaUrl(village.bannerKey, isCataloguePreview())
  return {
    title: village.name,
    alternates: pageAlternates(`/desa/${slug}`, locale),
    description: village.description ?? undefined,
    openGraph: banner ? { images: [banner] } : undefined,
  }
}

export default async function VillagePage({ params }: { params: Params }) {
  const { locale, village: slug } = await params
  setRequestLocale(locale)
  const t = await getTranslations('states')
  return (
    <Suspense fallback={<VillagePageSkeleton label={t('loading')} />}>
      <VillageContent slug={slug} />
    </Suspense>
  )
}

async function VillageContent({ slug }: { slug: string }) {
  const preview = isCataloguePreview()
  const [t, states, village, businesses, products] = await Promise.all([
    getTranslations('village'),
    getTranslations('states'),
    readSection(getVillage(slug)),
    readSection(getVillageBusinesses(slug)),
    readSection(searchProducts({ village: slug, pageSize: 24, sort: 'newest' })),
  ])
  if (!village) return <CatalogueUnavailable fullPage />
  const crest = villageCrest(village, preview)
  const banner = mediaUrl(village.bannerKey, preview)
  const productTotal = businesses?.reduce((n, b) => n + b.productCount, 0) ?? 0
  const allBusinessesVerified = Boolean(
    businesses?.length && businesses.every(({ verifiedAt }) => verifiedAt),
  )

  return (
    <VillageTheme theme={village.theme}>
      {preview ? null : <TrackView event={{ type: 'village_view', villageSlug: village.slug }} />}
      {/* Destination header: cover, crest, place, and the trust claim */}
      <section>
        <div className={cn(villageCover, 'bg-accent')}>
          {banner ? (
            <Image src={banner} alt="" fill priority sizes="100vw" className="object-cover" />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(135deg, var(--accent), color-mix(in oklab, var(--accent) 55%, black))',
              }}
            />
          )}
        </div>
        <Container>
          <div className={villageCrestPosition}>
            <VillageLogo
              name={village.name}
              logoUrl={crest.url}
              crestLabel={crest.regency ? t('regencyCrest', { regency: crest.regency }) : undefined}
              accent="var(--accent)"
              size={88}
            />
          </div>
          <h1 className="page-title mt-3">{village.name}</h1>
          <div className="text-muted mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            {village.regionName ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-4" aria-hidden />
                {village.regionName}
              </span>
            ) : null}
            {businesses ? (
              <span>{t('stats', { businesses: businesses.length, products: productTotal })}</span>
            ) : null}
          </div>
          {preview || allBusinessesVerified ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {preview ? null : <VerifiedBadge />}
              <span className="text-muted text-sm">
                {t(preview ? 'previewNote' : 'verifiedNote')}
              </span>
            </div>
          ) : null}
          {village.description ? (
            <p className="mt-5 max-w-[68ch] text-base leading-relaxed">{village.description}</p>
          ) : null}
        </Container>
      </section>

      <section className="pt-12">
        <Container>
          <h2 className="section-title">{t('businessesTitle', { village: village.name })}</h2>
          <div className="mt-5">
            {!businesses ? (
              <CatalogueUnavailable />
            ) : businesses.length === 0 ? (
              <CatalogueState
                title={t('noBusinesses')}
                href="/jelajah"
                actionLabel={states('browseProducts')}
                compact
              />
            ) : (
              <ul className={villageBusinessGrid}>
                {businesses.map((b) => (
                  <li key={b.id} className="min-w-0 snap-start">
                    <Link
                      href={`/desa/${village.slug}/${b.slug}`}
                      className="border-line bg-surface hover:border-accent hover:bg-wash/50 focus-visible:outline-accent flex h-full items-center gap-3 rounded-[0.75rem] border p-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm leading-snug font-bold wrap-anywhere">
                          {b.name}
                        </p>
                        <p className="text-muted mt-1 truncate text-xs">
                          {[b.ownerName, t('productCount', { count: b.productCount })]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                        <OpenStatusBadge
                          className="mt-2"
                          showDetail={false}
                          initial={initialStatus(b, village.timezone)}
                          hours={b.openingHours}
                          closedUntil={b.closedUntil}
                          closedNote={b.closedNote}
                          timeZone={village.timezone}
                        />
                      </div>
                      <ChevronRight className="text-muted size-4 shrink-0" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Container>
      </section>

      <section className="pt-12">
        <Container>
          <h2 className="section-title">{t('products', { village: village.name })}</h2>
          <div className="mt-5">
            {!products ? (
              <CatalogueUnavailable />
            ) : products.data.length === 0 ? (
              <CatalogueState
                title={t('productsEmpty')}
                href="/jelajah"
                actionLabel={states('browseProducts')}
                compact
              />
            ) : (
              <ProductGrid products={products.data} preview={preview} />
            )}
          </div>
        </Container>
      </section>
    </VillageTheme>
  )
}
