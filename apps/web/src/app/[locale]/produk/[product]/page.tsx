import { formatRupiah } from '@repo/i18n'
import { Container } from '@repo/ui/components/container'
import { ArrowLeft, ChevronRight, MapPin, Store } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { ReactNode } from 'react'
import { OpenStatusBadge } from '@/components/open-status'
import { OrderPanel } from '@/components/order-panel'
import { ProductGallery } from '@/components/product-gallery'
import { Price } from '@/components/price'
import { TrackView } from '@/components/track-view'
import { VerifiedBadge } from '@/components/verified-badge'
import { VillageTheme } from '@/components/village/village-theme'
import { Link } from '@/i18n/navigation'
import { getPreviewProduct, isCataloguePreview } from '@/lib/catalogue-preview'
import { getBusiness, getProduct } from '@/lib/data'
import { asLocale, pick } from '@/lib/localize'
import { mediaUrl } from '@/lib/media'
import { localePath } from '@/lib/paths'
import { initialStatus } from '@/lib/status'
import { pageAlternates, siteUrl } from '@/lib/site-url'

export const revalidate = 300

type Params = Promise<{ locale: string; product: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, product: slug } = await params
  const preview = isCataloguePreview()
  const [p, t] = await Promise.all([
    preview ? getPreviewProduct(slug)?.product : getProduct(slug),
    getTranslations({ locale, namespace: 'product' }),
  ])
  if (!p) notFound()
  const name = pick(locale, p.name, p.nameEn)
  const image = mediaUrl(p.images[0]?.key, preview)
  const price = p.price === 0 ? t('free') : formatRupiah(p.price, asLocale(locale))
  return {
    title: `${name} · ${p.business.name}`,
    robots: preview ? { index: false, follow: false } : undefined,
    alternates: pageAlternates(`/produk/${slug}`, locale),
    description:
      `${price} — ${p.business.name}, ${p.village.name}. ${pick(locale, p.description ?? '', p.descriptionEn)}`.trim(),
    openGraph: image ? { images: [image] } : undefined,
  }
}

async function loadProduct(slug: string, preview: boolean) {
  if (preview) {
    const entry = getPreviewProduct(slug)
    if (!entry) notFound()
    return entry
  }
  const product = await getProduct(slug)
  return { product, business: await getBusiness(product.business.slug) }
}

function OriginRow({
  href,
  preview,
  children,
}: {
  href: string
  preview: boolean
  children: ReactNode
}) {
  const className = 'flex min-h-12 items-center gap-3 py-2'
  if (preview) return <div className={className}>{children}</div>
  return (
    <Link href={href} className={`hover:bg-wash transition-colors ${className}`}>
      {children}
      <ChevronRight className="text-muted size-4 shrink-0" aria-hidden />
    </Link>
  )
}

export default async function ProductPage({ params }: { params: Params }) {
  const { locale, product: slug } = await params
  setRequestLocale(locale)
  const preview = isCataloguePreview()
  const [t, tb, { product, business }] = await Promise.all([
    getTranslations('product'),
    getTranslations('business'),
    loadProduct(slug, preview),
  ])
  const loc = asLocale(locale)
  const name = pick(locale, product.name, product.nameEn)
  const description = pick(locale, product.description ?? '', product.descriptionEn)
  const webUrl = siteUrl()
  const village = business.village
  const photos = product.images.length > 0 ? product.images : [null]

  return (
    <VillageTheme theme={village.theme}>
      {preview ? null : <TrackView event={{ type: 'product_view', productSlug: product.slug }} />}
      <Container className="product-detail pt-1 pb-10 lg:pt-5 lg:pb-12">
        <div className="grid grid-cols-[2.75rem_1fr_2.75rem] items-center pb-2 lg:hidden">
          <Link
            href={preview ? '/' : '/jelajah'}
            aria-label={t(preview ? 'backToHome' : 'backToProducts')}
            className="hover:bg-accent/8 -ml-2 grid size-11 place-items-center rounded-full"
          >
            <ArrowLeft className="size-5" aria-hidden />
          </Link>
          <p className="text-center text-base font-bold">{t('detailTitle')}</p>
        </div>
        <nav
          aria-label={t('breadcrumb')}
          className="text-muted hidden text-sm lg:block"
          hidden={preview}
        >
          <ol className="flex flex-wrap items-center gap-x-1.5">
            <li>
              <Link href={`/desa/${village.slug}`} className="hover:text-accent font-medium">
                {village.name}
              </Link>
            </li>
            <ChevronRight className="size-3.5" aria-hidden />
            <li>
              <Link
                href={`/desa/${village.slug}/${business.slug}`}
                className="hover:text-accent font-medium"
              >
                {business.name}
              </Link>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 gap-3.5 lg:mt-4 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          <ProductGallery
            photos={photos.map((img) => ({
              src: mediaUrl(img?.key, preview),
              alt: img?.alt ?? name,
            }))}
            category={product.category?.slug}
          />

          <div className="flex min-w-0 flex-col gap-4 lg:gap-5">
            <div>
              <h1 className="page-title lg:font-village text-balance">{name}</h1>
              <p className="mt-1.5 lg:mt-3">
                <Price
                  price={product.price}
                  compareAtPrice={product.compareAtPrice}
                  className="product-detail-price text-xl font-bold tabular-nums sm:text-2xl"
                  strikeClassName="text-sm"
                  showBadge
                />
              </p>
              {product.category ? (
                <p className="text-muted mt-1 hidden text-sm lg:block">
                  {pick(locale, product.category.name, product.category.nameEn)}
                </p>
              ) : null}
            </div>

            <section aria-label={t('origin')} className="divide-line divide-y">
              <OriginRow href={`/desa/${village.slug}`} preview={preview}>
                <MapPin
                  className="lg:text-accent size-5 shrink-0 text-(--catalogue-accent)"
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-muted sr-only text-xs font-semibold lg:not-sr-only">
                    {t('fromVillage')}
                  </p>
                  <p className="lg:font-village text-base font-semibold wrap-break-word">
                    {village.name}
                  </p>
                  {village.regionName ? (
                    <p className="text-muted hidden text-sm lg:block">{village.regionName}</p>
                  ) : null}
                </div>
              </OriginRow>
              <OriginRow href={`/desa/${village.slug}/${business.slug}`} preview={preview}>
                <Store className="text-muted size-5 shrink-0" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-muted sr-only text-xs font-semibold lg:not-sr-only">
                    {t('by')}
                  </p>
                  <p className="text-base font-semibold wrap-break-word">{business.name}</p>
                  <div className="flex flex-wrap items-center gap-2" hidden={preview}>
                    {business.verifiedAt ? (
                      <VerifiedBadge
                        title={tb('verifiedOn', {
                          date: new Intl.DateTimeFormat(loc === 'en' ? 'en-GB' : 'id-ID', {
                            dateStyle: 'medium',
                          }).format(new Date(business.verifiedAt)),
                        })}
                      />
                    ) : null}
                    <OpenStatusBadge
                      showDetail={false}
                      initial={initialStatus(business, village.timezone)}
                      hours={business.openingHours}
                      closedUntil={business.closedUntil}
                      closedNote={business.closedNote}
                      timeZone={village.timezone}
                    />
                  </div>
                </div>
              </OriginRow>
            </section>

            <OrderPanel
              product={{
                slug: product.slug,
                name: product.name,
                price: product.price,
                compareAtPrice: product.compareAtPrice,
              }}
              businessName={business.name}
              businessSlug={business.slug}
              villageName={village.name}
              whatsappNumber={business.whatsappNumber}
              productUrl={`${webUrl}${localePath(locale, `/produk/${product.slug}`)}`}
              available={product.isAvailable}
              preview={preview}
            />

            {description ? (
              <section>
                <h2 className="section-title">{t('description')}</h2>
                <p className="mt-2 max-w-[68ch] leading-relaxed whitespace-pre-line">
                  {description}
                </p>
              </section>
            ) : null}
          </div>
        </div>

        {product.more.length > 0 ? (
          <section className="mt-12">
            <h2 className="section-title">{t('moreTitle', { business: business.name })}</h2>
            <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {product.more.map((m) => (
                <li key={m.slug}>
                  <Link
                    href={`/produk/${m.slug}`}
                    className="border-line flex h-full flex-col gap-1 rounded-(--radius) border p-3 transition-shadow hover:shadow-md"
                  >
                    <span className="line-clamp-2 text-sm font-medium">
                      {pick(locale, m.name, m.nameEn)}
                    </span>
                    <span className="mt-auto pt-1">
                      <Price
                        price={m.price}
                        compareAtPrice={m.compareAtPrice}
                        className="font-bold tabular-nums"
                        strikeClassName="text-xs"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </Container>
    </VillageTheme>
  )
}
