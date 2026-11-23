import { cn } from '@repo/ui/cn'
import { ArrowRight, List, X } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { groupPreviewMapBusinesses } from '@/lib/catalogue-preview'
import { pick } from '@/lib/localize'
import { mediaUrl } from '@/lib/media'
import { ExploreMapCanvas } from './explore-map-canvas'
import { ProductPhoto } from './product-photo'

type Village = ReturnType<typeof groupPreviewMapBusinesses>[number] & {
  href: string
  listHref: string
}

export async function ExploreMap({
  villages,
  selectedSlug,
  closeHref,
  listHref,
}: {
  villages: Village[]
  selectedSlug?: string
  closeHref: string
  listHref: string
}) {
  const [t, locale] = await Promise.all([getTranslations('explore.map'), getLocale()])
  const selected = villages.find((village) => village.slug === selectedSlug)

  return (
    <div className="explore-map-layout flex flex-1 flex-col lg:flex-row">
      <div className="explore-map-canvas bg-wash relative isolate min-h-44 min-w-0 flex-1 overflow-hidden">
        <ExploreMapCanvas
          villages={villages.map(({ slug, name, lat, lng, href, businesses }) => ({
            slug,
            name,
            lat,
            lng,
            href,
            count: businesses.length,
          }))}
          selectedSlug={selectedSlug}
          closeHref={closeHref}
        />
        <Link
          href={listHref}
          className="explore-list-link bg-accent text-accent-foreground absolute bottom-[calc(1.75rem+env(safe-area-inset-bottom))] left-1/2 z-10 flex min-h-11 -translate-x-1/2 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold shadow-sm transition-colors hover:bg-[var(--accent-hover)]"
        >
          <List className="size-4 shrink-0" aria-hidden />
          {t('backToList')}
        </Link>
      </div>

      {selected ? (
        <section
          aria-label={t('selected', { village: selected.name })}
          className="explore-map-details bg-surface border-line max-h-[42dvh] shrink-0 overflow-y-auto overscroll-contain border-t px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] lg:max-h-none lg:w-80 lg:border-t-0 lg:border-l lg:p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="section-title">{selected.name}</h2>
              <p className="text-muted mt-0.5 text-sm font-medium">
                {t('count', { count: selected.businesses.length })}
              </p>
            </div>
            <Link
              href={closeHref}
              scroll={false}
              prefetch={false}
              aria-label={t('close')}
              className="bg-accent/8 hover:bg-accent/15 -mr-1 grid size-11 shrink-0 place-items-center rounded-full transition-colors"
            >
              <X className="size-4" aria-hidden />
            </Link>
          </div>
          <ul
            className={cn(
              'mt-3 grid gap-2',
              selected.businesses.length > 1 && 'grid-cols-2 lg:grid-cols-1',
            )}
          >
            {selected.businesses.slice(0, 2).map((product) => (
              <li key={product.business.slug} className="min-w-0">
                <Link
                  href={`/produk/${product.slug}`}
                  className="hover:bg-accent/7 flex min-w-0 items-center gap-2.5 rounded-xl p-1 transition-colors"
                >
                  <ProductPhoto
                    src={mediaUrl(product.imageKey, true)}
                    alt=""
                    category={product.category?.slug}
                    sizes="(min-width: 640px) 56px, 44px"
                    className="size-11 shrink-0 rounded-lg sm:size-14"
                  />
                  <span className="min-w-0 flex-1 text-sm leading-tight">
                    <span className="block font-bold wrap-break-word">{product.business.name}</span>
                    <span className="text-muted sr-only mt-0.5 text-xs wrap-break-word sm:not-sr-only sm:block">
                      {pick(locale, product.name, product.nameEn)}
                    </span>
                  </span>
                  <ArrowRight className="text-accent hidden size-4 shrink-0 sm:block" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={selected.listHref}
            scroll={false}
            className="bg-accent text-accent-foreground mt-3 flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 py-2 text-center text-sm font-bold transition-colors hover:bg-[var(--accent-hover)]"
          >
            {t('listVillage')}
            <ArrowRight className="size-4 shrink-0" aria-hidden />
          </Link>
        </section>
      ) : null}
    </div>
  )
}
