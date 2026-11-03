import { formatRupiah } from '@repo/i18n'
import { Container } from '@repo/ui/components/container'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { DemoNotice } from '@/components/demo-notice'
import { LocaleLink } from '@/components/link'
import { NotaRow, NotaSheet } from '@/components/nota/nota'
import { OpenStatusStamp } from '@/components/open-status'
import { OrderSlip } from '@/components/order-slip'
import { ProductPlate } from '@/components/product-plate'
import { Stamp } from '@/components/stamp'
import { TrackView } from '@/components/track-view'
import { VillageTheme } from '@/components/village/village-theme'
import { Link } from '@/i18n/navigation'
import { localePath } from '@/lib/paths'
import { getBusiness, getProduct } from '@/lib/data'
import { asLocale, pick } from '@/lib/localize'
import { mediaUrl } from '@/lib/media'
import { initialStatus } from '@/lib/status'

export const revalidate = 300

type Params = Promise<{ locale: string; product: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, product: slug } = await params
  const p = await getProduct(slug)
  const name = pick(locale, p.name, p.nameEn)
  const image = mediaUrl(p.images[0]?.key)
  return {
    title: `${name} · ${p.business.name}`,
    description:
      `${formatRupiah(p.price, asLocale(locale))}${p.unit ? ` / ${p.unit}` : ''} — ${p.business.name}, ${p.village.name}. ${pick(locale, p.description ?? '', p.descriptionEn)}`.trim(),
    openGraph: image ? { images: [image] } : undefined,
  }
}

export default async function ProductPage({ params }: { params: Params }) {
  const { locale, product: slug } = await params
  setRequestLocale(locale)
  const [t, tStamp, tVillage, product] = await Promise.all([
    getTranslations('product'),
    getTranslations('stamp'),
    getTranslations('village'),
    getProduct(slug),
  ])
  const business = await getBusiness(product.business.slug)
  const loc = asLocale(locale)
  const name = pick(locale, product.name, product.nameEn)
  const description = pick(locale, product.description ?? '', product.descriptionEn)
  const webUrl = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000'

  return (
    <VillageTheme theme={business.village.theme}>
      <TrackView event={{ type: 'product_view', productSlug: product.slug }} />
      <Container className="py-8 sm:py-12">
        <nav aria-label="Breadcrumb" className="text-muted text-sm">
          <ol className="flex flex-wrap items-center gap-x-2">
            <li>
              <Link href={`/desa/${business.village.slug}`} className="hover:text-accent underline">
                {business.village.name}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link
                href={`/desa/${business.village.slug}/${business.slug}`}
                className="hover:text-accent underline"
              >
                {business.name}
              </Link>
            </li>
          </ol>
        </nav>

        {/* Mobile reading order: picture → name, price, order → description. Desktop: two columns. */}
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:grid-rows-[auto_auto_1fr] lg:gap-x-12 lg:gap-y-8">
          <div className="lg:col-start-1 lg:row-start-1">
            <ProductPlate
              imageUrl={mediaUrl(product.images[0]?.key)}
              alt={product.images[0]?.alt ?? name}
              category={
                product.category
                  ? pick(locale, product.category.name, product.category.nameEn)
                  : null
              }
              village={{
                name: business.village.name,
                region: business.village.regionName,
                logoUrl: mediaUrl(business.village.logoKey),
              }}
              categoryLabel={t('kind')}
              pendingLabel={t('photoPending')}
            />
          </div>
          <div className="flex flex-col gap-6 lg:col-start-2 lg:row-span-3 lg:row-start-1">
            <div className="border-accent border-b-[5px] border-double pb-4">
              <h1 className="font-village text-foreground text-[clamp(2rem,6vw,3.25rem)] leading-[0.95] font-bold text-balance uppercase">
                {name}
              </h1>
              <p className="text-muted mt-2">
                {t('by', { business: business.name })} ·{' '}
                {t('from', { village: business.village.name })}
              </p>
              <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-2">
                <span className="font-print text-accent text-4xl font-bold tabular-nums">
                  {formatRupiah(product.price, loc)}
                </span>
                {product.unit ? (
                  <span className="text-muted">{t('per', { unit: product.unit })}</span>
                ) : null}
                {!product.isAvailable ? (
                  <Stamp tone="muted" rotate={-3}>
                    {t('unavailable')}
                  </Stamp>
                ) : null}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {business.verifiedAt ? <Stamp rotate={-4}>{tStamp('verified')}</Stamp> : null}
                <OpenStatusStamp
                  initial={initialStatus(business, business.village.timezone)}
                  hours={business.openingHours}
                  closedUntil={business.closedUntil}
                  closedNote={business.closedNote}
                  timeZone={business.village.timezone}
                />
              </div>
            </div>

            {product.isSeed ? (
              <DemoNotice label={tStamp('demo')}>{tVillage('demoNotice')}</DemoNotice>
            ) : null}

            <OrderSlip
              product={{
                slug: product.slug,
                name: product.name,
                unit: product.unit,
                price: product.price,
              }}
              businessName={business.name}
              businessSlug={business.slug}
              villageName={business.village.name}
              whatsappNumber={business.whatsappNumber}
              productUrl={`${webUrl}${localePath(locale, `/produk/${product.slug}`)}`}
              available={product.isAvailable}
            />
          </div>
          <div className="lg:col-start-1 lg:row-start-2">
            {description ? (
              <section>
                <h2 className="font-print text-nota-ink border-nota-ink border-b-2 pb-1 text-sm font-bold tracking-[0.16em] uppercase">
                  {t('description')}
                </h2>
                <p className="mt-3 max-w-[68ch] text-lg leading-relaxed">{description}</p>
              </section>
            ) : null}
          </div>
          <div className="lg:col-start-1 lg:row-start-3">
            {product.more.length > 0 ? (
              <NotaSheet title={t('moreTitle', { business: business.name })}>
                {product.more.map((m) => (
                  <NotaRow
                    key={m.slug}
                    href={`/produk/${m.slug}`}
                    name={pick(locale, m.name, m.nameEn)}
                    unit={m.unit}
                    price={formatRupiah(m.price, loc)}
                    linkComponent={LocaleLink}
                  />
                ))}
              </NotaSheet>
            ) : null}
          </div>
        </div>
      </Container>
    </VillageTheme>
  )
}
