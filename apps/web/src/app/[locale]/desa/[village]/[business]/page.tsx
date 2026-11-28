import { BRAND_NAME, buildWhatsAppLink } from '@repo/i18n'
import { Container } from '@repo/ui/components/container'
import { weekdays } from '@repo/validators'
import { ChevronRight, ExternalLink, MapPin, User } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server'
import { CatalogueState, CatalogueUnavailable } from '@/components/catalogue-state'
import { OpenStatusBadge } from '@/components/open-status'
import { ProductGrid } from '@/components/product-card'
import {
  businessPageContainer,
  businessPageGrid,
  businessPageHeader,
} from '@/components/public-page-layout'
import { TrackView } from '@/components/track-view'
import { VerifiedBadge } from '@/components/verified-badge'
import { VillageTheme } from '@/components/village/village-theme'
import { WhatsAppIcon } from '@/components/whatsapp-icon'
import { Link } from '@/i18n/navigation'
import { isCataloguePreview } from '@/lib/catalogue-preview'
import { getBusiness, getRegion, getVillage, readSection, searchProducts } from '@/lib/data'
import { getDemoBusinessLocations } from '@/lib/demo-business-locations'
import { initialStatus } from '@/lib/status'
import { pageAlternates } from '@/lib/site-url'

export const revalidate = 300

type Params = Promise<{ locale: string; village: string; business: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, village, business: slug } = await params
  const b = await readSection(getBusiness(slug))
  if (!b) return {}
  return {
    title: `${b.name} · ${b.village.name}`,
    description: b.description ?? undefined,
    alternates: pageAlternates(`/desa/${village}/${slug}`, locale),
  }
}

export default async function BusinessPage({ params }: { params: Params }) {
  const { locale, village: villageSlug, business: slug } = await params
  setRequestLocale(locale)
  const preview = isCataloguePreview()
  const [t, tDays, states, business, products, activeLocale] = await Promise.all([
    getTranslations('business'),
    getTranslations('days'),
    getTranslations('states'),
    readSection(getBusiness(slug)),
    readSection(searchProducts({ business: slug, pageSize: 50, sort: 'newest' })),
    getLocale(),
  ])
  if (!business) return <CatalogueUnavailable fullPage />
  if (business.village.slug !== villageSlug) notFound()
  const village = preview ? null : await readSection(getVillage(villageSlug))
  const region = village?.regionCode ? await readSection(getRegion(village.regionCode)) : null
  const regionParts = region?.fullName.split(',').map((part) => part.trim()) ?? []
  const location = [
    business.village.name,
    ...(regionParts.length
      ? region?.level === 'village'
        ? regionParts.slice(1)
        : regionParts
      : []),
  ].join(', ')
  const demoPoint = getDemoBusinessLocations(products?.data ?? []).get(business.slug)
  const mapQuery = demoPoint ? `${demoPoint.lat},${demoPoint.lng}` : location
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`

  const hours = (business.openingHours ?? {}) as Partial<
    Record<(typeof weekdays)[number], { open: string; close: string }[]>
  >
  const hasHours = weekdays.some((d) => (hours[d]?.length ?? 0) > 0)
  const verifiedDate = business.verifiedAt
    ? new Intl.DateTimeFormat(activeLocale === 'en' ? 'en-GB' : 'id-ID', {
        dateStyle: 'medium',
      }).format(new Date(business.verifiedAt))
    : null
  const marketplaces = [
    ['Shopee', business.shopeeUrl],
    ['Tokopedia', business.tokopediaUrl],
    ['TikTok Shop', business.tiktokShopUrl],
    ['Instagram', business.instagramUrl],
  ].filter((m): m is [string, string] => Boolean(m[1]))

  return (
    <VillageTheme theme={business.village.theme}>
      <Container className={businessPageContainer}>
        {preview ? null : (
          <TrackView event={{ type: 'business_view', businessSlug: business.slug }} />
        )}
        <nav aria-label={states('breadcrumb')} className="text-muted text-sm">
          <ol className="flex flex-wrap items-center gap-x-1.5">
            <li>
              <Link
                href={`/desa/${business.village.slug}`}
                className="hover:text-accent font-medium"
              >
                {business.village.name}
              </Link>
            </li>
            <ChevronRight className="size-3.5" aria-hidden />
            <li aria-current="page">{business.name}</li>
          </ol>
        </nav>

        <header className={businessPageHeader}>
          <div className="min-w-0">
            <h1 className="page-title">{business.name}</h1>
            <div className="text-muted mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              {business.ownerName ? (
                <span className="inline-flex items-center gap-1">
                  <User className="size-4" aria-hidden />
                  {business.ownerName}
                </span>
              ) : null}
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent inline-flex items-start gap-1 underline-offset-2 hover:underline"
              >
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>{location}</span>
                <ExternalLink className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                <span className="sr-only">{t('openMap')}</span>
              </a>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {verifiedDate ? (
                <VerifiedBadge title={t('verifiedOn', { date: verifiedDate })} />
              ) : null}
              <OpenStatusBadge
                initial={initialStatus(business, business.village.timezone)}
                hours={business.openingHours}
                closedUntil={business.closedUntil}
                closedNote={business.closedNote}
                timeZone={business.village.timezone}
              />
            </div>
          </div>
          {business.whatsappNumber ? (
            <a
              href={buildWhatsAppLink(
                business.whatsappNumber,
                `Halo ${business.name}, saya melihat toko Anda di ${BRAND_NAME}.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-wa hover:bg-wa-hover inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full px-5 text-center text-sm font-bold text-white no-underline transition-colors"
            >
              <WhatsAppIcon className="size-5 shrink-0" />
              {t('chat')}
            </a>
          ) : null}
        </header>

        <div className={businessPageGrid}>
          <div>
            {business.description ? (
              <p className="mb-8 max-w-[68ch] text-base leading-relaxed">{business.description}</p>
            ) : null}
            <h2 className="section-title">{t('productsTitle', { business: business.name })}</h2>
            <div className="mt-4">
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
                <ProductGrid products={products.data} showVillage={false} preview={preview} />
              )}
            </div>
          </div>

          <aside className="flex flex-col gap-6 self-start">
            <section className="border-line rounded-(--radius) border p-4">
              <h2 className="font-bold">{t('hoursTitle')}</h2>
              {hasHours ? (
                <table className="mt-2 w-full text-sm">
                  <tbody className="divide-line divide-y">
                    {weekdays.map((d) => (
                      <tr key={d}>
                        <th scope="row" className="py-2 text-left font-medium">
                          {tDays(d)}
                        </th>
                        <td className="py-2 text-right tabular-nums">
                          {hours[d]?.length ? (
                            hours[d]!.map((p) => `${p.open}–${p.close}`).join(', ')
                          ) : (
                            <span className="text-muted">{t('closedDay')}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-muted mt-2 text-sm">{t('noHours')}</p>
              )}
            </section>

            {marketplaces.length > 0 ? (
              <section className="border-line rounded-(--radius) border p-4">
                <h2 className="font-bold">{t('marketplaces')}</h2>
                <ul className="mt-2 flex flex-col">
                  {marketplaces.map(([label, url]) => (
                    <li key={label}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-accent inline-flex h-10 items-center gap-2 font-medium"
                      >
                        {label}
                        <ExternalLink className="size-3.5" aria-hidden />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </aside>
        </div>
      </Container>
    </VillageTheme>
  )
}
