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
          {promotions.map(({ id, href, image, sponsor }) => (
            <li key={id}>
              <Link
                href={href}
                rel={sponsor ? 'sponsored' : undefined}
                className="group bg-wash border-line hover:border-accent grid h-full min-h-40 grid-cols-[minmax(0,3fr)_minmax(0,2fr)] overflow-hidden rounded-(--radius) border transition-colors focus-visible:outline-offset-[-3px] md:min-h-48"
              >
                <div className="flex flex-col items-start justify-center px-3 py-4 sm:px-6 md:px-8">
                  {sponsor ? (
                    <p className="text-muted text-xs leading-snug font-semibold">
                      {t('sponsoredBy', { sponsor })}
                    </p>
                  ) : null}
                  <h3 className="text-foreground mt-1 text-base leading-tight font-extrabold text-pretty sm:text-xl md:text-2xl">
                    {t(`${id}.title`)}
                  </h3>
                  <span className="text-accent mt-3 inline-flex items-center gap-1.5 text-xs leading-snug font-bold sm:text-sm">
                    {t(id === 'bamboo' && !sponsor ? 'bamboo.browse' : `${id}.action`)}
                    <ArrowRight className="size-4 shrink-0" aria-hidden />
                  </span>
                </div>
                <div className="relative overflow-hidden">
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="(min-width: 1152px) 440px, 40vw"
                    className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.03]"
                  />
                </div>
              </Link>
            </li>
          ))}
        </PromotionCarousel>
      </Container>
    </section>
  )
}
