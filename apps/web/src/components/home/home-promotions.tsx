import { Container } from '@repo/ui/components/container'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { VILLAGES_PATH } from '@/lib/paths'
import { HomeBanner } from './home-banner'
import { PromotionCarousel } from './promotion-carousel'

type Promotion = {
  id: 'bamboo' | 'coffee' | 'villages'
  href: string
  image: string
  imageEn?: string
  imagePosition?: string
  imageOnly?: boolean
  sponsor?: string
  sample?: { previewSlug: string; catalogueSlug: string }
}

const publishedPromotions: Promotion[] = [
  {
    id: 'bamboo',
    href: '/jelajah?category=kerajinan&village=baros',
    image: '/media/seed/stories/bamboo-finished.webp',
    imagePosition: 'center 23%',
    sample: {
      previewSlug: 'besek-bambu',
      catalogueSlug: 'anyaman-bambu-pak-ujang-besek-bambu-isi-10',
    },
  },
  {
    id: 'coffee',
    href: '/jelajah?category=minuman&village=baros',
    image: '/media/seed/stories/coffee-ready.webp',
    imagePosition: 'center 56%',
    sample: {
      previewSlug: 'kopi-baros',
      catalogueSlug: 'kopi-gunung-baros-arabika-biji-200g',
    },
  },
  {
    id: 'villages',
    href: VILLAGES_PATH,
    image: '/brand/village-discovery-promo-id.webp',
    imageEn: '/brand/village-discovery-promo-en.webp',
    imagePosition: 'left 43%',
    imageOnly: true,
  },
]

export async function HomePromotions({ preview }: { preview: boolean }) {
  if (!publishedPromotions.length) return <HomeBanner />

  const [t, locale] = await Promise.all([getTranslations('home.promotions'), getLocale()])
  const showSamples = preview || process.env.NODE_ENV === 'development'
  const promotions = publishedPromotions.map((promotion) => {
    const { sample } = promotion
    const action =
      promotion.id === 'bamboo' && !showSamples
        ? 'bamboo.browse'
        : (`${promotion.id}.action` as const)
    if (!showSamples || !sample) return { ...promotion, action }
    return {
      ...promotion,
      href: `/produk/${preview ? sample.previewSlug : sample.catalogueSlug}`,
      action,
    }
  })
  return (
    <section aria-label={t('title')} className="pt-7 md:pt-9">
      <Container>
        <PromotionCarousel count={promotions.length}>
          {promotions.map(
            ({ id, href, image, imageEn, imagePosition, imageOnly, sponsor, action }) => (
              <li key={id}>
                {imageOnly ? (
                  <Link
                    href={href}
                    rel={sponsor ? 'sponsored' : undefined}
                    className="group border-line hover:border-accent relative isolate flex h-full min-h-40 overflow-hidden rounded-(--radius) border bg-stone-800 transition-colors focus-visible:outline-offset-[-3px] md:min-h-64 lg:min-h-72"
                  >
                    <Image
                      src={locale === 'en' && imageEn ? imageEn : image}
                      alt={`${t(`${id}.title`)}. ${t(action)}.`}
                      fill
                      sizes="(min-width: 1152px) 1104px, (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)"
                      className="-z-20 object-cover"
                      style={{ objectPosition: imagePosition }}
                    />
                    {sponsor ? (
                      <span className="sr-only">{t('sponsoredBy', { sponsor })}</span>
                    ) : null}
                  </Link>
                ) : (
                  <Link
                    href={href}
                    rel={sponsor ? 'sponsored' : undefined}
                    className="group border-line hover:border-accent relative isolate grid h-full min-h-40 overflow-hidden rounded-(--radius) border bg-stone-800 text-white transition-colors focus-visible:outline-offset-[-3px] md:min-h-64 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:bg-[color-mix(in_oklab,var(--wash)_55%,white)] md:text-[var(--foreground)] lg:min-h-72"
                  >
                    {/* Phones: the photo fills the card behind the text. Wider: it takes the right half. */}
                    <div className="absolute inset-0 -z-20 overflow-hidden md:relative md:inset-auto md:z-auto md:order-2">
                      <Image
                        src={image}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 640px, calc(100vw - 32px)"
                        className="object-cover transition-transform duration-700 ease-out md:group-hover:scale-[1.03]"
                        style={{ objectPosition: imagePosition }}
                      />
                    </div>
                    <div
                      className="absolute inset-0 -z-10 bg-linear-to-r from-stone-950/90 via-stone-950/75 via-55% to-transparent md:hidden"
                      aria-hidden
                    />
                    <div className="flex w-3/5 max-w-[24ch] flex-col items-start justify-end gap-2.5 p-4 sm:p-6 md:order-1 md:w-auto md:max-w-none md:justify-center md:gap-3 md:p-10 lg:p-12">
                      {sponsor ? (
                        <p className="text-xs leading-snug text-white/90 md:text-[var(--muted)]">
                          {t('sponsoredBy', { sponsor })}
                        </p>
                      ) : null}
                      <h3 className="text-base leading-snug font-semibold tracking-tight text-pretty sm:text-lg md:text-[1.75rem] md:leading-tight md:tracking-[-0.02em]">
                        {t(`${id}.title`)}
                      </h3>
                      {t.has(`${id}.body`) ? (
                        <p className="hidden max-w-[36ch] leading-relaxed text-pretty text-[color:color-mix(in_oklab,var(--foreground)_75%,white)] md:block">
                          {t(`${id}.body`)}
                        </p>
                      ) : null}
                      <span className="inline-flex items-center gap-1.5 text-xs leading-snug font-medium underline-offset-4 group-hover:underline group-focus-visible:underline sm:text-sm md:mt-3 md:min-h-11 md:rounded-full md:bg-[var(--accent)] md:px-5 md:font-semibold md:text-white md:no-underline md:group-hover:bg-[var(--accent-hover)] md:group-hover:no-underline">
                        {t(action)}
                        <ArrowRight className="size-3.5 shrink-0 md:size-4" aria-hidden />
                      </span>
                    </div>
                  </Link>
                )}
              </li>
            ),
          )}
        </PromotionCarousel>
      </Container>
    </section>
  )
}
