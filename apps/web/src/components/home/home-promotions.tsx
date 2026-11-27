import { Container } from '@repo/ui/components/container'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { VILLAGES_PATH } from '@/lib/paths'
import { HomeBanner } from './home-banner'
import { PromotionCarousel } from './promotion-carousel'

type Promotion = {
  id: 'bamboo' | 'coffee' | 'villages'
  href: string
  image: string
  imageOnly?: boolean
  sponsor?: string
  sample?: { previewSlug: string; catalogueSlug: string; sponsor: string }
}

const publishedPromotions: Promotion[] = [
  {
    id: 'bamboo',
    href: '/jelajah?category=kerajinan&village=baros',
    image: '/media/seed/stories/bamboo-finished.webp',
    sample: {
      previewSlug: 'besek-bambu',
      catalogueSlug: 'anyaman-bambu-pak-ujang-besek-bambu-isi-10',
      sponsor: 'Anyaman Pak Ujang',
    },
  },
  {
    id: 'coffee',
    href: '/jelajah?category=minuman&village=baros',
    image: '/media/seed/stories/coffee-ready.webp',
    sample: {
      previewSlug: 'kopi-baros',
      catalogueSlug: 'kopi-gunung-baros-arabika-biji-200g',
      sponsor: 'Kopi Gunung Baros',
    },
  },
  {
    id: 'villages',
    href: VILLAGES_PATH,
    image: '/brand/catalogue-landscape.webp',
    imageOnly: true,
  },
]

export async function HomePromotions({ preview }: { preview: boolean }) {
  if (!publishedPromotions.length) return <HomeBanner />

  const t = await getTranslations('home.promotions')
  const showSamples = preview || process.env.NODE_ENV === 'development'
  const promotions = publishedPromotions.map((promotion) => {
    const { sample } = promotion
    if (!showSamples || !sample) return promotion
    return {
      ...promotion,
      href: `/produk/${preview ? sample.previewSlug : sample.catalogueSlug}`,
      sponsor: sample.sponsor,
    }
  })
  return (
    <section aria-label={t('title')} className="pt-7 md:pt-9">
      <Container>
        <PromotionCarousel count={promotions.length}>
          {promotions.map(({ id, href, image, imageOnly, sponsor }) => (
            <li key={id}>
              <Link
                href={href}
                rel={sponsor ? 'sponsored' : undefined}
                aria-label={imageOnly && !sponsor ? t(`${id}.action`) : undefined}
                className="group bg-wash border-line hover:border-accent relative isolate flex h-full min-h-40 flex-col items-start justify-end overflow-hidden rounded-(--radius) border px-4 py-4 transition-colors focus-visible:outline-offset-[-3px] sm:px-6 md:min-h-48 md:px-8"
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="(min-width: 1152px) 1104px, (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)"
                  className="-z-20 object-cover object-center motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.03]"
                />
                {sponsor ? (
                  <p className="mb-auto rounded-full bg-stone-950/90 px-2.5 py-1 text-xs leading-snug font-semibold text-white">
                    {t('sponsoredBy', { sponsor })}
                  </p>
                ) : null}
                {imageOnly ? (
                  sponsor && <span className="sr-only">{t(`${id}.action`)}</span>
                ) : (
                  <>
                    <div
                      className="absolute inset-0 -z-10 bg-linear-to-r from-stone-950/95 via-stone-950/75 to-transparent"
                      aria-hidden
                    />
                    <h3 className="mt-6 max-w-[16ch] text-lg leading-tight font-extrabold text-pretty text-white sm:text-xl md:text-2xl">
                      {t(`${id}.title`)}
                    </h3>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-xs leading-snug font-bold text-white sm:text-sm">
                      {t(id === 'bamboo' && !sponsor ? 'bamboo.browse' : `${id}.action`)}
                      <ArrowRight className="size-4 shrink-0" aria-hidden />
                    </span>
                  </>
                )}
              </Link>
            </li>
          ))}
        </PromotionCarousel>
      </Container>
    </section>
  )
}
