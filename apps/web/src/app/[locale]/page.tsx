import { Container } from '@repo/ui/components/container'
import { ArrowRight } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { DemoNotice } from '@/components/demo-notice'
import { NotaSheet } from '@/components/nota/nota'
import { ProductRows } from '@/components/product-rows'
import { SearchForm } from '@/components/search-form'
import { VillageSeal } from '@/components/seal'
import { Stamp } from '@/components/stamp'
import { Link } from '@/i18n/navigation'
import { localePath } from '@/lib/paths'
import { getVillages, searchProducts } from '@/lib/data'
import { mediaUrl } from '@/lib/media'

export const revalidate = 300

const SEAL_TILT = [-8, 5, -3, 9, -6, 4]

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const [t, tNota, tStamp, villages, latest] = await Promise.all([
    getTranslations('home'),
    getTranslations('nota'),
    getTranslations('stamp'),
    getVillages(),
    searchProducts({ sort: 'newest', pageSize: 8 }),
  ])

  return (
    <>
      {/* First viewport: the promise, the search line, and the village stamps */}
      <section className="border-nota-rule border-b">
        <Container className="grid gap-10 py-10 sm:py-16 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-14">
          <div className="max-w-2xl">
            <h1 className="font-print text-foreground text-[clamp(2.6rem,9vw,5.25rem)] leading-[0.92] font-bold tracking-[-0.015em] text-balance uppercase">
              {t('heroTitle')}
            </h1>
            <p className="text-muted mt-5 max-w-[56ch] text-lg leading-relaxed">
              {t('heroSubtitle')}
            </p>
            <div className="mt-8">
              <SearchForm
                action={localePath(locale, '/jelajah')}
                placeholder={t('searchPlaceholder')}
              />
            </div>
          </div>

          <figure>
            {villages.length === 0 ? (
              <p className="text-muted">{t('villagesEmpty')}</p>
            ) : (
              <ul className="flex flex-wrap items-center justify-center gap-x-2 gap-y-4 lg:justify-end">
                {villages.slice(0, 6).map((v, i) => (
                  <li key={v.id} className={'relative ' + (i % 2 ? 'lg:translate-y-6' : '')}>
                    <Link
                      href={`/desa/${v.slug}`}
                      className="block transition-transform duration-200 ease-out hover:-translate-y-1 hover:rotate-1 focus-visible:-translate-y-1"
                      style={{ color: v.accent }}
                    >
                      <VillageSeal
                        name={v.name}
                        region={v.regionName}
                        logoUrl={mediaUrl(v.logoKey)}
                        size={i === 0 ? 176 : 140}
                        rotate={SEAL_TILT[i % SEAL_TILT.length]}
                      />
                    </Link>
                    {v.isSeed ? (
                      <span className="mt-1 flex justify-center">
                        <Stamp tone="demo" size="sm" rotate={-6}>
                          {tStamp('demo')}
                        </Stamp>
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
            <figcaption className="text-muted mt-4 text-center text-sm lg:text-right">
              {t('sealsCaption')}
            </figcaption>
          </figure>
        </Container>
      </section>

      {/* Latest products as today's nota */}
      <section className="py-14">
        <Container>
          {latest.data.some((p) => p.isSeed) ? (
            <div className="mb-4">
              <DemoNotice label={tStamp('demo')}>{t('latestDemo')}</DemoNotice>
            </div>
          ) : null}
          <NotaSheet
            title={t('latestTitle')}
            aside={<span className="hidden sm:inline">{t('latestAside')}</span>}
            head={[tNota('name'), tNota('unit'), tNota('price')]}
            footer={
              <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-[auto_1fr] sm:items-baseline">
                {(['verified', 'direct', 'mentored'] as const).map((k, i) => (
                  <div key={k} className="contents">
                    <dt>
                      <Stamp rotate={[-4, 3, -2][i]}>{t(`trust.${k}.stamp`)}</Stamp>
                    </dt>
                    <dd className="text-muted max-w-[60ch] text-sm leading-relaxed">
                      {t(`trust.${k}.body`)}
                    </dd>
                  </div>
                ))}
              </dl>
            }
          >
            {latest.data.length === 0 ? (
              <li className="text-muted px-6 py-8">{t('latestEmpty')}</li>
            ) : (
              <ProductRows products={latest.data} crossVillage />
            )}
          </NotaSheet>
          <div className="mt-4 flex justify-end">
            <Link
              href="/jelajah"
              className="font-print text-accent inline-flex h-11 items-center gap-2 text-base font-bold tracking-[0.08em] uppercase hover:underline"
            >
              {t('seeAll')}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </Container>
      </section>

      {/* How to order: the sequence matters, so the steps keep the nota's "No." column */}
      <section className="bg-nota-blue py-14">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <h2 className="font-print text-nota-ink text-4xl leading-none font-bold uppercase sm:text-5xl">
            {t('howTitle')}
          </h2>
          <ol className="border-nota-ink border-t-2">
            {(['1', '2', '3'] as const).map((n) => (
              <li
                key={n}
                className="border-nota-rule-strong grid grid-cols-[3rem_1fr] gap-4 border-b py-5"
              >
                <span className="font-print text-nota-ink text-3xl leading-none font-bold tabular-nums">
                  {n}.
                </span>
                <div>
                  <p className="font-print text-xl font-bold uppercase">{t(`how.${n}.title`)}</p>
                  <p className="text-muted mt-1 max-w-[52ch]">{t(`how.${n}.body`)}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>
    </>
  )
}
