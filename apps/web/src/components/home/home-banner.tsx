import { Container } from '@repo/ui/components/container'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import landscape from '../../../public/brand/catalogue-landscape.webp'

/** The catalogue banner uses the mobile mockup's village action and the laptop mockup's tagline. */
export async function HomeBanner({ villageSlug }: { villageSlug?: string }) {
  const t = await getTranslations('home')
  const action =
    'bg-sun text-foreground hover:bg-sun/90 min-h-11 w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors'

  return (
    <section aria-labelledby="catalogue-title" className="pt-7 md:pt-9">
      <Container>
        <div className="catalogue-hero relative isolate flex min-h-45 items-center overflow-hidden rounded-(--radius) md:min-h-88">
          <div className="catalogue-hero-art absolute inset-0 -z-20">
            <Image
              src={landscape}
              alt=""
              fill
              quality={60}
              sizes="(min-width: 1152px) 839px, (min-width: 768px) 76vw, (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)"
              className="object-cover object-[center_72%] md:object-right"
            />
          </div>
          <div className="px-4 py-4 sm:px-6 md:px-8 md:py-10 lg:px-11">
            <h2 id="catalogue-title" className="display-title">
              <span className="block max-w-[10ch] text-white sm:max-w-[16ch] md:hidden">
                {t('bannerMobileTitle')}
              </span>
              <span lang="id" className="text-accent hidden md:block">
                {t.rich('bannerTitle', {
                  line: (line) => <span className="block">{line}</span>,
                })}
              </span>
            </h2>
            <p className="text-foreground mt-3 hidden max-w-[30ch] text-base leading-relaxed md:block">
              {t('bannerDescription')}
            </p>
            <Link
              href={villageSlug ? `/desa/${villageSlug}` : '/jelajah'}
              className={`${action} mt-3 inline-flex focus-visible:outline-white md:hidden`}
            >
              {villageSlug ? t('bannerVillageCta') : t('bannerCta')}
              <ArrowRight className="size-4 shrink-0" aria-hidden />
            </Link>
            <Link
              href="/jelajah"
              className={`${action} mt-5 hidden md:inline-flex md:px-5 md:text-base`}
            >
              {t('bannerCta')}
              <ArrowRight className="size-5 shrink-0" aria-hidden />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  )
}
