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
                <Link
                  href={href}
                  rel={sponsor ? 'sponsored' : undefined}
                  className="group border-line hover:border-accent relative isolate flex h-full min-h-40 flex-col items-start justify-end overflow-hidden rounded-(--radius) border bg-stone-800 p-4 text-white transition-colors focus-visible:outline-offset-[-3px] sm:p-6 md:min-h-48 md:px-8 lg:min-h-60"
                >
                  <Image
                    src={locale === 'en' && imageEn ? imageEn : image}
                    alt={imageOnly ? `${t(`${id}.title`)}. ${t(action)}.` : ''}
                    fill
                    sizes="(min-width: 1152px) 1104px, (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)"
                    className="-z-20 object-cover"
                    style={{ objectPosition: imagePosition }}
                  />
                  {imageOnly && sponsor ? (
                    <span className="sr-only">{t('sponsoredBy', { sponsor })}</span>
                  ) : null}
                  {imageOnly ? null : (
                    <>
                      <div
                        className="absolute inset-0 -z-10 bg-linear-to-r from-stone-950/90 via-stone-950/75 via-55% to-transparent"
                        aria-hidden
                      />
                      <div className="flex w-3/5 max-w-[24ch] flex-col items-start gap-2.5 md:w-1/2 md:max-w-[39ch]">
                        {sponsor ? (
                          <p className="text-xs leading-snug text-white/90">
                            {t('sponsoredBy', { sponsor })}
                          </p>
                        ) : null}
                        <h3 className="text-base leading-snug font-semibold tracking-tight text-pretty sm:text-lg md:text-2xl">
                          {t(`${id}.title`)}
                        </h3>
                        <span className="inline-flex items-center gap-1.5 text-xs leading-snug font-medium underline-offset-4 group-hover:underline group-focus-visible:underline sm:text-sm">
                          {t(action)}
                          <ArrowRight className="size-3.5 shrink-0" aria-hidden />
                        </span>
                      </div>
                    </>
                  )}
                </Link>
              </li>
            ),
          )}
        </PromotionCarousel>
      </Container>
    </section>
  )
}
