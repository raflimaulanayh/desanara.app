import { buttonVariants } from '@heroui/styles'
import { BRAND_NAME } from '@repo/i18n'
import { Container } from '@repo/ui/components/container'
import { ArrowRight, Store } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { CategoryGrid } from '@/components/home/category-grid'
import { HomeBanner } from '@/components/home/home-banner'
import { StoryRail } from '@/components/home/story-rail'
import { ProductGrid } from '@/components/product-card'
import { VillageCard } from '@/components/village-card'
import { Link } from '@/i18n/navigation'
import {
  isCataloguePreview,
  previewCategories,
  previewProducts,
  previewStories,
} from '@/lib/catalogue-preview'
import { getCategories, getVillages, searchProducts } from '@/lib/data'
import { pick } from '@/lib/localize'
import { mediaUrl } from '@/lib/media'
import { JOIN_HREF, VILLAGES_HASH } from '@/lib/paths'

export const revalidate = 300

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const preview = isCataloguePreview()
  const [t, villages, homeProducts, categories, storyText] = await Promise.all([
    getTranslations('home'),
    getVillages(),
    preview
      ? previewProducts.slice(0, 4)
      : searchProducts({ sort: 'newest', pageSize: 4 }).then((page) => page.data),
    preview ? previewCategories : getCategories(),
    getTranslations('stories.captions'),
  ])
  const featured = preview
    ? villages[0]
    : [...villages].sort((a, b) => b.businessCount - a.businessCount)[0]
  const stories = previewStories.map(({ product, image, caption }) => ({
    id: product.id,
    business: product.business.name,
    village: product.village.name,
    image,
    caption: storyText(caption),
    product: preview
      ? {
          slug: product.slug,
          name: pick(locale, product.name, product.nameEn),
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          image: mediaUrl(product.imageKey, true),
        }
      : undefined,
  }))

  return (
    <div className="catalogue-home pb-10 sm:pb-14">
      <h1 className="sr-only">{BRAND_NAME}</h1>
      <StoryRail stories={stories} />
      <section aria-labelledby="latest-products" className="pt-3 sm:pt-7">
        <Container>
          <div className="flex items-center justify-between gap-2">
            <h2 id="latest-products" className="section-title">
              {t('latestTitle')}
            </h2>
            <Link
              href="/jelajah"
              className="text-accent hover:bg-accent/8 -mr-1.5 inline-flex min-h-11 shrink-0 items-center gap-1 rounded-full px-1.5 text-xs font-bold transition-colors sm:px-3 sm:text-sm"
            >
              <span className="sr-only sm:not-sr-only">{t('seeAll')}</span>
              <ArrowRight className="size-4 shrink-0" aria-hidden />
            </Link>
          </div>
          <div className="catalogue-latest mt-1.5 sm:mt-3">
            {homeProducts.length === 0 ? (
              <p className="text-muted">{t('latestEmpty')}</p>
            ) : (
              <ProductGrid products={homeProducts} showSeller={false} preview={preview} />
            )}
          </div>
        </Container>
      </section>

      <CategoryGrid categories={categories} />
      <HomeBanner villageSlug={featured?.slug} />

      <section
        id={VILLAGES_HASH}
        aria-labelledby="villages-title"
        className="scroll-mt-32 pt-8 sm:pt-12 lg:scroll-mt-20"
      >
        <Container>
          <h2 id="villages-title" className="section-title">
            {t('villagesTitle')}
          </h2>
          {villages.length === 0 ? (
            <p className="text-muted mt-4">{t('villagesEmpty')}</p>
          ) : (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {villages.slice(0, 6).map((v) => (
                <li key={v.id}>
                  <VillageCard village={v} />
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>

      <section aria-labelledby="seller-title" className="pt-8 sm:pt-12">
        <Container>
          <div className="border-line bg-surface flex flex-col gap-4 rounded-(--radius) border p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5">
            <div className="flex min-w-0 items-start gap-3">
              <span className="bg-accent-soft text-accent-soft-foreground grid size-9 shrink-0 place-items-center rounded-(--radius)">
                <Store className="size-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <h2 id="seller-title" className="section-title">
                  {t('sellerTitle')}
                </h2>
                <p className="text-muted mt-1 max-w-[52ch] text-sm leading-relaxed">
                  {t('sellerBody')}
                </p>
              </div>
            </div>
            <Link
              href={JOIN_HREF}
              className={buttonVariants({
                variant: 'primary',
                className:
                  'h-auto min-h-11 w-full rounded-full px-4 py-2 text-center font-semibold whitespace-normal sm:w-auto sm:shrink-0',
              })}
            >
              {t('sellerCta')}
              <ArrowRight className="size-4 shrink-0" aria-hidden />
            </Link>
          </div>
        </Container>
      </section>
    </div>
  )
}
