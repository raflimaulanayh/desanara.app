import { BRAND_NAME, buildWhatsAppLink } from '@repo/i18n'
import { Container } from '@repo/ui/components/container'
import { weekdays } from '@repo/validators'
import { ChevronRight, ExternalLink, MapPin, User } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server'
import { OpenStatusBadge } from '@/components/open-status'
import { ProductGrid } from '@/components/product-card'
import { TrackView } from '@/components/track-view'
import { VerifiedBadge } from '@/components/verified-badge'
import { WhatsAppIcon } from '@/components/whatsapp-icon'
import { Link } from '@/i18n/navigation'
import { getBusiness, searchProducts } from '@/lib/data'
import { initialStatus } from '@/lib/status'

export const revalidate = 300

type Params = Promise<{ locale: string; village: string; business: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { business: slug } = await params
  const b = await getBusiness(slug)
  return { title: `${b.name} · ${b.village.name}`, description: b.description ?? undefined }
}

export default async function BusinessPage({ params }: { params: Params }) {
  const { locale, village: villageSlug, business: slug } = await params
  setRequestLocale(locale)
  const [t, tDays, business, products, activeLocale] = await Promise.all([
    getTranslations('business'),
    getTranslations('days'),
    getBusiness(slug),
    searchProducts({ business: slug, pageSize: 50, sort: 'newest' }),
    getLocale(),
  ])
  if (business.village.slug !== villageSlug) notFound()

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
    <Container className="pt-5 pb-8">
      <TrackView event={{ type: 'business_view', businessSlug: business.slug }} />
      <nav aria-label="Breadcrumb" className="text-muted text-sm">
        <ol className="flex flex-wrap items-center gap-x-1.5">
          <li>
            <Link href={`/desa/${business.village.slug}`} className="hover:text-accent font-medium">
              {business.village.name}
            </Link>
          </li>
          <ChevronRight className="size-3.5" aria-hidden />
          <li aria-current="page">{business.name}</li>
        </ol>
      </nav>

      <header className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-village text-[clamp(1.8rem,5.5vw,2.75rem)] leading-tight font-extrabold tracking-tight">
            {business.name}
          </h1>
          <div className="text-muted mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            {business.ownerName ? (
              <span className="inline-flex items-center gap-1">
                <User className="size-4" aria-hidden />
                {t('owner', { name: business.ownerName })}
              </span>
            ) : null}
            {/* Location stops at the village, like marketplaces show only the seller's city: the
                street/RT/RW is often the owner's home (UU PDP), so it never leaves the dashboard. */}
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-4" aria-hidden />
              {[business.village.name, business.village.regionName].filter(Boolean).join(', ')}
            </span>
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
            className="bg-wa hover:bg-wa-hover inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full px-6 font-bold text-white transition-colors"
          >
            <WhatsAppIcon className="size-5" />
            {t('chat')}
          </a>
        ) : null}
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_20rem]">
        <div>
          {business.description ? (
            <p className="mb-8 max-w-[68ch] text-base leading-relaxed sm:text-lg">
              {business.description}
            </p>
          ) : null}
          <h2 className="text-xl font-extrabold">
            {t('productsTitle', { business: business.name })}
          </h2>
          <div className="mt-4">
            <ProductGrid products={products.data} showVillage={false} />
          </div>
        </div>

        <aside className="flex flex-col gap-6 self-start">
          <section className="border-line rounded-(--radius) border p-4">
            <h2 className="font-extrabold">{t('hoursTitle')}</h2>
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
              <h2 className="font-extrabold">{t('marketplaces')}</h2>
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
  )
}
