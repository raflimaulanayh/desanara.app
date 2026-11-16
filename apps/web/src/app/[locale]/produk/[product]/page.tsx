import { formatRupiah } from '@repo/i18n'
import { Container } from '@repo/ui/components/container'
import { ChevronRight, MapPin, Store } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { OpenStatusBadge } from '@/components/open-status'
import { OrderPanel } from '@/components/order-panel'
import { ProductGallery } from '@/components/product-gallery'
import { Price } from '@/components/price'
import { TrackView } from '@/components/track-view'
import { VerifiedBadge } from '@/components/verified-badge'
import { VillageLogo } from '@/components/village-logo'
import { VillageTheme } from '@/components/village/village-theme'
import { Link } from '@/i18n/navigation'
import { getBusiness, getProduct } from '@/lib/data'
import { asLocale, pick } from '@/lib/localize'
import { mediaUrl } from '@/lib/media'
import { localePath } from '@/lib/paths'
import { initialStatus } from '@/lib/status'

export const revalidate = 300

type Params = Promise<{ locale: string; product: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, product: slug } = await params
  const [p, t] = await Promise.all([
    getProduct(slug),
    getTranslations({ locale, namespace: 'product' }),
  ])
  const name = pick(locale, p.name, p.nameEn)
  const image = mediaUrl(p.images[0]?.key)
  const price = p.price === 0 ? t('free') : formatRupiah(p.price, asLocale(locale))
  return {
    title: `${name} · ${p.business.name}`,
    description:
      `${price} — ${p.business.name}, ${p.village.name}. ${pick(locale, p.description ?? '', p.descriptionEn)}`.trim(),
    openGraph: image ? { images: [image] } : undefined,
  }
}

export default async function ProductPage({ params }: { params: Params }) {
  const { locale, product: slug } = await params
  setRequestLocale(locale)
  const [t, tb, product] = await Promise.all([
    getTranslations('product'),
    getTranslations('business'),
    getProduct(slug),
  ])
  const business = await getBusiness(product.business.slug)
  const loc = asLocale(locale)
  const name = pick(locale, product.name, product.nameEn)
  const description = pick(locale, product.description ?? '', product.descriptionEn)
  const webUrl = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000'
  const village = business.village
  const photos = product.images.length > 0 ? product.images : [null]

  return (
    <VillageTheme theme={village.theme}>
      <TrackView event={{ type: 'product_view', productSlug: product.slug }} />
      {/* pb reserves room for the sticky order bar on phones */}
      <Container className="pt-5 pb-28 lg:pb-12">
        <nav aria-label="Breadcrumb" className="text-muted text-sm">
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

        <div className="mt-4 grid gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          <ProductGallery
            photos={photos.map((img) => ({ src: mediaUrl(img?.key), alt: img?.alt ?? name }))}
            category={product.category?.slug}
          />

          <div className="flex flex-col gap-5">
            <div>
              <h1 className="font-village text-[clamp(1.6rem,5vw,2.4rem)] leading-tight font-extrabold tracking-tight text-balance">
                {name}
              </h1>
              <p className="mt-3">
                <Price
                  price={product.price}
                  compareAtPrice={product.compareAtPrice}
                  className="text-3xl font-extrabold tabular-nums"
                  strikeClassName="text-lg"
                  showBadge
                />
              </p>
              {product.category ? (
                <p className="text-muted mt-1 text-sm">
                  {pick(locale, product.category.name, product.category.nameEn)}
                </p>
              ) : null}
            </div>

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
            />

            {/* The village is the differentiator: origin card right under the action */}
            <section className="border-line overflow-hidden rounded-(--radius) border">
              <Link
                href={`/desa/${village.slug}`}
                className="hover:bg-wash flex items-center gap-3 p-4 transition-colors"
              >
                <VillageLogo
                  name={village.name}
                  logoUrl={mediaUrl(village.logoKey)}
                  accent="var(--accent)"
                  size={52}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-muted text-xs font-semibold">{t('fromVillage')}</p>
                  <p className="font-village truncate text-lg font-extrabold">{village.name}</p>
                  {village.regionName ? (
                    <p className="text-muted flex items-center gap-1 text-sm">
                      <MapPin className="size-3.5" aria-hidden />
                      {village.regionName}
                    </p>
                  ) : null}
                </div>
                <ChevronRight className="text-muted size-5" aria-hidden />
              </Link>
              <Link
                href={`/desa/${village.slug}/${business.slug}`}
                className="border-line hover:bg-wash flex items-center gap-3 border-t p-4 transition-colors"
              >
                <span className="bg-wash-strong text-muted grid size-[52px] shrink-0 place-items-center rounded-full">
                  <Store className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-muted text-xs font-semibold">{t('by')}</p>
                  <p className="truncate font-bold">{business.name}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
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
                <ChevronRight className="text-muted size-5" aria-hidden />
              </Link>
            </section>

            {description ? (
              <section>
                <h2 className="text-lg font-extrabold">{t('description')}</h2>
                <p className="mt-2 max-w-[68ch] leading-relaxed whitespace-pre-line">
                  {description}
                </p>
              </section>
            ) : null}
          </div>
        </div>

        {product.more.length > 0 ? (
          <section className="mt-12">
            <h2 className="text-xl font-extrabold">
              {t('moreTitle', { business: business.name })}
            </h2>
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
                        className="font-extrabold tabular-nums"
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
