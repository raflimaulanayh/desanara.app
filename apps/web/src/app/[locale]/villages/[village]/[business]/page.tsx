import { weekdays } from '@repo/validators'
import { Container } from '@repo/ui/components/container'
import { ExternalLink, MapPin, MessageCircle, User } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server'
import { DemoNotice } from '@/components/demo-notice'
import { Kop } from '@/components/kop'
import { NotaSheet } from '@/components/nota/nota'
import { OpenStatusStamp } from '@/components/open-status'
import { ProductRows } from '@/components/product-rows'
import { VillageSeal } from '@/components/seal'
import { Stamp } from '@/components/stamp'
import { TrackView } from '@/components/track-view'
import { Link } from '@/i18n/navigation'
import { getBusiness, searchProducts } from '@/lib/data'
import { mediaUrl } from '@/lib/media'
import { initialStatus } from '@/lib/status'
import { buildWhatsAppLink } from '@repo/i18n'

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
  const [t, tNota, tStamp, tDays, tVillage, business, products, activeLocale] = await Promise.all([
    getTranslations('business'),
    getTranslations('nota'),
    getTranslations('stamp'),
    getTranslations('days'),
    getTranslations('village'),
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
    <Container className="py-10">
      <TrackView event={{ type: 'business_view', businessSlug: business.slug }} />
      <nav aria-label="Breadcrumb" className="text-muted flex items-center gap-3 text-sm">
        <Link
          href={`/villages/${business.village.slug}`}
          className="text-accent shrink-0"
          aria-label={business.village.name}
        >
          <VillageSeal
            name={business.village.name}
            region={business.village.regionName}
            logoUrl={mediaUrl(business.village.logoKey)}
            size={44}
            rotate={-6}
          />
        </Link>
        <Link href={`/villages/${business.village.slug}`} className="hover:text-accent underline">
          {business.village.name}
        </Link>
        <span aria-hidden>/</span>
        <span aria-current="page">{business.name}</span>
      </nav>

      <Kop
        as="h1"
        size="lg"
        className="mt-6"
        name={business.name}
        lines={[
          business.ownerName ? (
            <>
              <User className="size-4" aria-hidden />
              {t('owner', { name: business.ownerName })}
            </>
          ) : null,
          business.address ? (
            <>
              <MapPin className="size-4" aria-hidden />
              {business.address}
            </>
          ) : null,
        ].filter(Boolean)}
        stamps={
          <>
            {verifiedDate ? (
              <Stamp rotate={-5} title={t('verifiedOn', { date: verifiedDate })}>
                {tStamp('verified')}
              </Stamp>
            ) : null}
            <OpenStatusStamp
              initial={initialStatus(business, business.village.timezone)}
              hours={business.openingHours}
              closedUntil={business.closedUntil}
              closedNote={business.closedNote}
              timeZone={business.village.timezone}
            />
          </>
        }
        actions={
          business.whatsappNumber ? (
            <a
              href={buildWhatsAppLink(
                business.whatsappNumber,
                `Halo ${business.name}, saya melihat toko Anda di UMKM Desa.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-accent text-accent-foreground font-print inline-flex h-12 items-center gap-2 px-5 text-base font-bold tracking-[0.08em] uppercase transition-colors hover:bg-[var(--accent-hover)]"
            >
              <MessageCircle className="size-5" aria-hidden />
              {t('chat')}
            </a>
          ) : null
        }
      />

      {business.isSeed ? (
        <div className="mt-6">
          <DemoNotice label={tStamp('demo')}>{tVillage('demoNotice')}</DemoNotice>
        </div>
      ) : null}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem]">
        <div>
          {business.description ? (
            <p className="mb-8 max-w-[68ch] text-lg leading-relaxed">{business.description}</p>
          ) : null}
          <NotaSheet
            title={t('productsTitle')}
            head={[tNota('name'), tNota('unit'), tNota('price')]}
          >
            <ProductRows products={products.data} showBusiness={false} />
          </NotaSheet>
        </div>

        <aside className="flex flex-col gap-8">
          <section>
            <h2 className="font-print text-nota-ink border-nota-ink border-b-2 pb-1 text-sm font-bold tracking-[0.16em] uppercase">
              {t('hoursTitle')}
            </h2>
            {hasHours ? (
              <table className="mt-2 w-full text-sm">
                <tbody className="divide-nota-rule divide-y">
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
            <section>
              <h2 className="font-print text-nota-ink border-nota-ink border-b-2 pb-1 text-sm font-bold tracking-[0.16em] uppercase">
                {t('marketplaces')}
              </h2>
              <ul className="mt-2 flex flex-col">
                {marketplaces.map(([label, url]) => (
                  <li key={label}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-accent inline-flex h-10 items-center gap-2 underline"
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
