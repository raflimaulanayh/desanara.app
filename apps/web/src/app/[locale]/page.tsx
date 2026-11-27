import { BRAND_NAME } from '@repo/i18n'
import { Container } from '@repo/ui/components/container'
import { LoadingRegion } from '@repo/ui/components/loading-region'
import { ArrowRight } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Suspense } from 'react'
import type { ComponentProps } from 'react'
import { CatalogueState, CatalogueUnavailable } from '@/components/catalogue-state'
import { CategoryGrid, CategoryGridSkeleton } from '@/components/home/category-grid'
import { HomePromotions } from '@/components/home/home-promotions'
import { SellerInvite } from '@/components/home/seller-invite'
import { StoryRail } from '@/components/home/story-rail'
import { ProductGrid, ProductGridSkeleton } from '@/components/product-card'
import { VillageGrid, VillageGridSkeleton } from '@/components/village-card'
import { Link } from '@/i18n/navigation'
import {
  isCataloguePreview,
  previewCategories,
  previewProducts,
  previewStoryAccounts,
} from '@/lib/catalogue-preview'
import {
  getCategories,
  getStoryProduct,
  getVillages,
  readSection,
  searchProducts,
} from '@/lib/data'
import { pick } from '@/lib/localize'
import { mediaUrl } from '@/lib/media'
import { VILLAGES_HASH, VILLAGES_PATH } from '@/lib/paths'
import type { StoryProduct } from '@/lib/story-order'

export const revalidate = 300
const homeVillageLimit = 6

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const preview = isCataloguePreview()
  const villages = readSection(getVillages())
  const products = preview
    ? Promise.resolve(previewProducts.slice(0, 4))
    : readSection(searchProducts({ sort: 'newest', pageSize: 4 }).then((page) => page.data))
  const categories = preview ? Promise.resolve(previewCategories) : readSection(getCategories())
  const storyProducts = preview ? undefined : loadStoryProducts(locale)
  const [t, states, storyText] = await Promise.all([
    getTranslations('home'),
    getTranslations('states'),
    getTranslations('stories.captions'),
  ])
  const storyAccounts = previewStoryAccounts.map((account) => ({
    ...account,
    stories: account.stories.map(
      ({ id, product, image, video, caption, publishedAt, status, catalogueSlug }) => ({
        id,
        image,
        video,
        caption: storyText(caption),
        publishedAt,
        status: preview ? status : undefined,
        catalogueSlug: preview ? undefined : catalogueSlug,
        product: preview
          ? {
              slug: product.slug,
              name: pick(locale, product.name, product.nameEn),
              price: product.price,
              compareAtPrice: product.compareAtPrice,
              image: mediaUrl(product.imageKey, true),
            }
          : undefined,
      }),
    ),
  }))

  return (
    <div className="catalogue-home pb-10 sm:pb-14">
      <h1 className="sr-only">{BRAND_NAME}</h1>
      <StoryRail accounts={storyAccounts} products={storyProducts} />
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
            <Suspense
              fallback={
                <LoadingRegion label={states('loading')}>
                  <ProductGridSkeleton showSeller={false} />
                </LoadingRegion>
              }
            >
              <LatestProducts
                request={products}
                preview={preview}
                emptyTitle={t('latestEmpty')}
                emptyBody={states('tryLater')}
              />
            </Suspense>
          </div>
        </Container>
      </section>

      <Suspense
        fallback={<CategoryGridSkeleton title={t('categoriesTitle')} label={states('loading')} />}
      >
        <HomeCategories request={categories} title={t('categoriesTitle')} />
      </Suspense>
      <HomePromotions preview={preview} />

      <section
        id={VILLAGES_HASH}
        aria-labelledby="villages-title"
        className="scroll-mt-32 pt-8 sm:pt-12 lg:scroll-mt-28"
      >
        <Container>
          <div className="flex items-center justify-between gap-2">
            <h2 id="villages-title" className="section-title">
              {t('villagesTitle')}
            </h2>
            <Link
              href={VILLAGES_PATH}
              className="text-accent hover:bg-accent/8 inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-bold whitespace-nowrap transition-colors sm:px-4 sm:text-sm"
            >
              {t('seeAllVillages')} <ArrowRight className="size-4 shrink-0" aria-hidden />
            </Link>
          </div>
          <div className="mt-4">
            <Suspense
              fallback={
                <LoadingRegion label={states('loading')}>
                  <VillageGridSkeleton count={homeVillageLimit} />
                </LoadingRegion>
              }
            >
              <HomeVillages
                request={villages}
                emptyTitle={t('villagesEmpty')}
                emptyBody={states('tryLater')}
              />
            </Suspense>
          </div>
        </Container>
      </section>

      <SellerInvite />
    </div>
  )
}

async function loadStoryProducts(locale: string): Promise<Record<string, StoryProduct>> {
  const slugs = new Set(
    previewStoryAccounts.flatMap(({ stories }) =>
      stories.flatMap(({ catalogueSlug }) => (catalogueSlug ? [catalogueSlug] : [])),
    ),
  )
  const products = await Promise.all([...slugs].map((slug) => getStoryProduct(slug)))
  return Object.fromEntries(
    products.flatMap((product) =>
      product
        ? [
            [
              product.slug,
              {
                slug: product.slug,
                name: pick(locale, product.name, product.nameEn),
                price: product.price,
                compareAtPrice: product.compareAtPrice,
                image: mediaUrl(product.images[0]?.key),
              },
            ],
          ]
        : [],
    ),
  )
}

type VillagesRequest = Promise<Awaited<ReturnType<typeof getVillages>> | null>

async function HomeVillages({
  request,
  emptyTitle,
  emptyBody,
}: {
  request: VillagesRequest
  emptyTitle: string
  emptyBody: string
}) {
  const villages = await request
  if (!villages) return <CatalogueUnavailable />
  if (!villages.length) return <CatalogueState title={emptyTitle} description={emptyBody} compact />

  return <VillageGrid villages={villages.slice(0, homeVillageLimit)} />
}

async function LatestProducts({
  request,
  preview,
  emptyTitle,
  emptyBody,
}: {
  request: Promise<Awaited<ReturnType<typeof searchProducts>>['data'] | null>
  preview: boolean
  emptyTitle: string
  emptyBody: string
}) {
  const products = await request
  if (!products) return <CatalogueUnavailable />
  if (!products.length) return <CatalogueState title={emptyTitle} description={emptyBody} compact />
  return <ProductGrid products={products} preview={preview} showSeller={false} />
}

async function HomeCategories({
  request,
  title,
}: {
  request: Promise<ComponentProps<typeof CategoryGrid>['categories'] | null>
  title: string
}) {
  const categories = await request
  if (categories) return <CategoryGrid categories={categories} />
  return (
    <Container className="space-y-3 pt-7 sm:pt-9">
      <h2 className="section-title">{title}</h2>
      <CatalogueUnavailable />
    </Container>
  )
}
