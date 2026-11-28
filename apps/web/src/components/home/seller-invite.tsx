import { Container } from '@repo/ui/components/container'
import { ArrowRight, Check } from 'lucide-react'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { mediaUrl } from '@/lib/media'
import { JOIN_HREF } from '@/lib/paths'

/** Real listed products from different villages, shown as a small stack of round photos. */
const PHOTOS = [
  'seed/products/coffee-ground.webp',
  'seed/products/batik.webp',
  'seed/products/honey-a.webp',
  'seed/products/besek.webp',
  'seed/products/chips-b.webp',
]

const PERKS = ['free', 'whatsapp', 'help'] as const

/**
 * The invitation for village businesses at the end of the catalogue home: a forest-green panel in the
 * same voice as the about page close (two-tone heading, three true benefits, one white action).
 */
export async function SellerInvite() {
  const t = await getTranslations('home')
  return (
    <section aria-labelledby="seller-title" className="pt-8 sm:pt-12">
      <Container>
        <div className="bg-forest relative isolate overflow-hidden rounded-(--radius) px-5 py-6 text-white sm:p-10 lg:p-12">
          <Image
            src="/brand/desanara-mark.svg"
            alt=""
            width={340}
            height={402}
            unoptimized
            className="pointer-events-none absolute -right-16 -bottom-32 -z-10 w-48 opacity-10 sm:w-80"
          />
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-center lg:gap-12">
            <div>
              <h2
                id="seller-title"
                className="text-[1.5rem] leading-[1.15] tracking-[-0.025em] text-balance sm:text-4xl sm:leading-[1.1]"
              >
                <span className="block font-semibold">{t('sellerTitle')}</span>
                <span className="mt-0.5 block font-normal text-[#b4e076] sm:mt-1">
                  {t('sellerLead')}
                </span>
              </h2>
              <p className="mt-3 max-w-[52ch] text-[0.9375rem] leading-relaxed text-white/80 sm:mt-4 sm:text-base">
                {t('sellerBody')}
              </p>
              <ul className="mt-5 flex flex-wrap gap-1.5 sm:mt-6 sm:gap-2">
                {PERKS.map((perk) => (
                  <li
                    key={perk}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3 text-xs font-semibold sm:h-9 sm:gap-2 sm:px-3.5 sm:text-sm"
                  >
                    <Check
                      className="size-3.5 text-[#b4e076] sm:size-4"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                    {t(`sellerPerks.${perk}`)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col items-start gap-5 sm:gap-6 lg:items-end">
              <div aria-hidden className="flex -space-x-2.5 sm:-space-x-3">
                {PHOTOS.map((key) => (
                  <span
                    key={key}
                    className="relative size-11 overflow-hidden rounded-full border-2 border-[#2f6347] sm:size-16"
                  >
                    <Image
                      src={mediaUrl(key) ?? ''}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </span>
                ))}
              </div>
              <div className="flex w-full flex-col gap-1 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
                <Link
                  href={JOIN_HREF}
                  className="text-forest hover:bg-sprout inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-6 font-semibold whitespace-nowrap transition-colors sm:min-h-12"
                >
                  {t('sellerCta')}
                  <ArrowRight className="size-4 shrink-0" aria-hidden />
                </Link>
                <Link
                  href="/tentang"
                  className="inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-semibold whitespace-nowrap text-white/85 underline decoration-white/30 underline-offset-[6px] transition-colors hover:text-white hover:decoration-white sm:min-h-12 sm:text-base"
                >
                  {t('sellerMore')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
