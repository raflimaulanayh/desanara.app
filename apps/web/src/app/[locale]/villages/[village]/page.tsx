import { Container } from '@repo/ui/components/container'
import { ArrowRight, MapPin } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { DemoNotice } from '@/components/demo-notice'
import { Kop } from '@/components/kop'
import { NotaSheet } from '@/components/nota/nota'
import { OpenStatusStamp } from '@/components/open-status'
import { ProductRows } from '@/components/product-rows'
import { VillageSeal } from '@/components/seal'
import { Stamp } from '@/components/stamp'
import { Link } from '@/i18n/navigation'
import { getVillage, getVillageBusinesses, searchProducts } from '@/lib/data'
import { mediaUrl } from '@/lib/media'
import { initialStatus } from '@/lib/status'

export const revalidate = 300

type Params = Promise<{ locale: string; village: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { village: slug } = await params
  const village = await getVillage(slug)
  const banner = mediaUrl(village.bannerKey)
  return {
    title: village.name,
    description: village.description ?? undefined,
    openGraph: banner ? { images: [banner] } : undefined,
  }
}

export default async function VillagePage({ params }: { params: Params }) {
  const { locale, village: slug } = await params
  setRequestLocale(locale)
  const [t, tNota, tStamp, village, businesses, products] = await Promise.all([
    getTranslations('village'),
    getTranslations('nota'),
    getTranslations('stamp'),
    getVillage(slug),
    getVillageBusinesses(slug),
    searchProducts({ village: slug, pageSize: 50, sort: 'newest' }),
  ])
  const banner = mediaUrl(village.bannerKey)
  const hasDemo = businesses.some((b) => b.isSeed)
  const byBusiness = new Map<string, typeof products.data>()
  for (const p of products.data) {
    byBusiness.set(p.business.slug, [...(byBusiness.get(p.business.slug) ?? []), p])
  }

  return (
    <>
      <section className="border-nota-rule relative border-b">
        {banner ? (
          <div className="bg-nota-blue relative h-[clamp(11rem,34vw,22rem)] overflow-hidden">
            <Image src={banner} alt="" fill priority sizes="100vw" className="object-cover" />
          </div>
        ) : (
          <div className="bg-accent-soft h-24" />
        )}
        <Container className="relative pb-8">
          <div className="text-accent -mt-[clamp(4rem,9vw,6rem)] flex items-end gap-4">
            <span className="rounded-full bg-white/95 p-1 shadow-[0_8px_24px_-12px_rgb(20_26_43/0.5)]">
              <VillageSeal
                name={village.name}
                region={village.regionName}
                logoUrl={mediaUrl(village.logoKey)}
                size={152}
                rotate={-5}
              />
            </span>
          </div>
          <Kop
            as="h1"
            size="lg"
            className="mt-5"
            name={village.name}
            lines={[
              village.regionName ? (
                <>
                  <MapPin className="size-4" aria-hidden />
                  {village.regionName}
                </>
              ) : null,
              t('businessCount', { count: village.businessCount }),
            ].filter(Boolean)}
            stamps={
              village.isSeed ? (
                <Stamp tone="demo" rotate={-4}>
                  {tStamp('demo')}
                </Stamp>
              ) : (
                <Stamp rotate={-4}>{tStamp('partner')}</Stamp>
              )
            }
          />
          {village.description ? (
            <p className="mt-5 max-w-[68ch] text-lg leading-relaxed">{village.description}</p>
          ) : null}
          {hasDemo ? (
            <div className="mt-6">
              <DemoNotice label={tStamp('demo')}>{t('demoNotice')}</DemoNotice>
            </div>
          ) : null}
        </Container>
      </section>

      <section className="py-12">
        <Container className="flex flex-col gap-12">
          <h2 className="font-village text-accent text-3xl leading-none font-bold uppercase sm:text-4xl">
            {t('businessesTitle', { village: village.name })}
          </h2>
          {businesses.length === 0 ? <p className="text-muted">{t('noBusinesses')}</p> : null}
          {businesses.map((b) => {
            const items = byBusiness.get(b.slug) ?? []
            return (
              <article key={b.id} className="flex flex-col gap-4">
                <Kop
                  as="h3"
                  name={
                    <Link href={`/villages/${village.slug}/${b.slug}`} className="hover:underline">
                      {b.name}
                    </Link>
                  }
                  lines={[b.ownerName, t('productCount', { count: b.productCount })].filter(
                    Boolean,
                  )}
                  stamps={
                    <OpenStatusStamp
                      initial={initialStatus(b, village.timezone)}
                      hours={b.openingHours}
                      closedUntil={b.closedUntil}
                      closedNote={b.closedNote}
                      timeZone={village.timezone}
                      size="sm"
                    />
                  }
                />
                {items.length > 0 ? (
                  <NotaSheet head={[tNota('name'), tNota('unit'), tNota('price')]}>
                    <ProductRows products={items.slice(0, 4)} showBusiness={false} />
                  </NotaSheet>
                ) : null}
                <Link
                  href={`/villages/${village.slug}/${b.slug}`}
                  className="font-print text-accent inline-flex h-11 items-center gap-2 self-end text-sm font-bold tracking-[0.1em] uppercase hover:underline"
                >
                  {t('seeAll', { business: b.name })}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </article>
            )
          })}
        </Container>
      </section>
    </>
  )
}
