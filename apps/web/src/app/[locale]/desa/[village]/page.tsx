import { Container } from '@repo/ui/components/container'
import { MapPin } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { OpenStatusBadge } from '@/components/open-status'
import { ProductGrid } from '@/components/product-card'
import { TrackView } from '@/components/track-view'
import { VerifiedBadge } from '@/components/verified-badge'
import { VillageLogo } from '@/components/village-logo'
import { Link } from '@/i18n/navigation'
import { isCataloguePreview } from '@/lib/catalogue-preview'
import { getVillage, getVillageBusinesses, searchProducts } from '@/lib/data'
import { mediaUrl } from '@/lib/media'
import { initialStatus } from '@/lib/status'
import { pageAlternates } from '@/lib/site-url'

export const revalidate = 300

type Params = Promise<{ locale: string; village: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, village: slug } = await params
  const village = await getVillage(slug)
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
  const preview = isCataloguePreview()
  const [t, village, businesses, products] = await Promise.all([
    getTranslations('village'),
    getVillage(slug),
    getVillageBusinesses(slug),
    searchProducts({ village: slug, pageSize: 24, sort: 'newest' }),
  ])
  const banner = mediaUrl(village.bannerKey, preview)
  const productTotal = businesses.reduce((n, b) => n + b.productCount, 0)

  return (
    <>
      {preview ? null : <TrackView event={{ type: 'village_view', villageSlug: village.slug }} />}
      {/* Destination header: cover, crest, place, and the trust claim */}
      <section>
        <div className="bg-accent relative h-[clamp(10rem,30vw,20rem)] overflow-hidden">
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
          <div className="-mt-10 sm:-mt-12">
            <VillageLogo
              name={village.name}
              logoUrl={mediaUrl(village.logoKey, preview)}
              accent="var(--accent)"
              size={88}
            />
          </div>
          <h1 className="page-title font-village mt-3">{village.name}</h1>
          <div className="text-muted mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            {village.regionName ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-4" aria-hidden />
                {village.regionName}
              </span>
            ) : null}
            <span>{t('stats', { businesses: businesses.length, products: productTotal })}</span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {preview ? null : <VerifiedBadge />}
            <span className="text-muted text-sm">
              {t(preview ? 'previewNote' : 'verifiedNote')}
            </span>
          </div>
          {village.description ? (
            <p className="mt-5 max-w-[68ch] text-base leading-relaxed">{village.description}</p>
          ) : null}
        </Container>
      </section>

      <section className="pt-12">
        <Container>
          <h2 className="section-title font-village">
            {t('businessesTitle', { village: village.name })}
          </h2>
          {businesses.length === 0 ? <p className="text-muted mt-4">{t('noBusinesses')}</p> : null}
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/desa/${village.slug}/${b.slug}`}
                  className="border-line bg-surface flex h-full flex-col gap-2 rounded-(--radius) border p-4 transition-shadow hover:shadow-md"
                >
                  <p className="text-base leading-snug font-bold wrap-anywhere">{b.name}</p>
                  <p className="text-muted text-sm">
                    {[b.ownerName, t('productCount', { count: b.productCount })]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  <OpenStatusBadge
                    className="mt-auto pt-1"
                    showDetail={false}
                    initial={initialStatus(b, village.timezone)}
                    hours={b.openingHours}
                    closedUntil={b.closedUntil}
                    closedNote={b.closedNote}
                    timeZone={village.timezone}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="pt-12">
        <Container>
          <h2 className="section-title font-village">{t('products', { village: village.name })}</h2>
          <div className="mt-5">
            {products.data.length === 0 ? (
              <p className="text-muted">{t('productsEmpty')}</p>
            ) : (
              <ProductGrid products={products.data} preview={preview} />
            )}
          </div>
        </Container>
      </section>
    </>
  )
}
