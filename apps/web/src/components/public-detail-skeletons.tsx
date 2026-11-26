import { cn } from '@repo/ui/cn'
import { Container } from '@repo/ui/components/container'
import { LoadingRegion, SkeletonBlock } from '@repo/ui/components/loading-region'
import { ProductGridSkeleton } from './product-card'
import {
  businessPageContainer,
  businessPageGrid,
  businessPageHeader,
  productDetailLayout,
  villageBusinessGrid,
  villageCover,
  villageCrestPosition,
} from './public-page-layout'

export function ProductPageSkeleton({ label }: { label: string }) {
  return (
    <Container className={productDetailLayout.container}>
      <LoadingRegion label={label}>
        <div className={productDetailLayout.titleBar}>
          <SkeletonBlock className="size-11 rounded-full" />
          <SkeletonBlock className="mx-auto h-6 w-28" />
        </div>
        <SkeletonBlock className="hidden h-5 w-48 lg:block" />
        <div className={productDetailLayout.grid}>
          <SkeletonBlock className={cn(productDetailLayout.cover, 'w-full rounded-(--radius)')} />
          <div className={productDetailLayout.details}>
            <div>
              <SkeletonBlock className="h-[1.5625rem] w-3/4 sm:h-[1.875rem]" />
              <SkeletonBlock className="mt-1.5 h-7 w-28 sm:h-8 lg:mt-3" />
            </div>
            <div className="divide-line divide-y">
              {[0, 1].map((row) => (
                <div key={row} className="flex min-h-12 items-center gap-3 py-2">
                  <SkeletonBlock className="size-5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <SkeletonBlock className="mb-1 hidden h-3 w-16 lg:block" />
                    <SkeletonBlock className="h-6 w-2/3" />
                  </div>
                  <SkeletonBlock className="size-4 shrink-0" />
                </div>
              ))}
            </div>
            <SkeletonBlock className="h-11 w-full rounded-full" />
          </div>
        </div>
      </LoadingRegion>
    </Container>
  )
}

export function VillagePageSkeleton({ label }: { label: string }) {
  return (
    <LoadingRegion label={label}>
      <div className={villageCover}>
        <SkeletonBlock className="size-full rounded-none" />
      </div>
      <Container>
        <div className={villageCrestPosition}>
          <SkeletonBlock className="size-22 rounded-full border-2 border-white" />
        </div>
        <SkeletonBlock className="mt-3 h-[1.5625rem] w-44 sm:h-[1.875rem]" />
        <SkeletonBlock className="mt-1 h-5 w-56" />
        <SkeletonBlock className="mt-4 h-6 w-36 rounded-full" />
      </Container>
      <Container className="pt-12">
        <SkeletonBlock className="h-[1.375rem] w-48 sm:h-6" />
        <ul className={cn('mt-5', villageBusinessGrid)}>
          {[0, 1, 2].map((index) => (
            <li
              key={index}
              className="border-line bg-surface flex flex-col gap-2 rounded-(--radius) border p-4"
            >
              <SkeletonBlock className="h-[1.375rem] w-3/4" />
              <SkeletonBlock className="h-5 w-1/2" />
            </li>
          ))}
        </ul>
      </Container>
      <Container className="pt-12">
        <SkeletonBlock className="h-[1.375rem] w-44 sm:h-6" />
        <div className="mt-5">
          <ProductGridSkeleton />
        </div>
      </Container>
    </LoadingRegion>
  )
}

export function BusinessPageSkeleton({ label }: { label: string }) {
  return (
    <Container className={businessPageContainer}>
      <LoadingRegion label={label}>
        <SkeletonBlock className="h-5 w-52" />
        <div className={businessPageHeader}>
          <div className="min-w-0 flex-1">
            <SkeletonBlock className="h-[1.5625rem] w-48 sm:h-[1.875rem]" />
            <SkeletonBlock className="mt-2 h-5 w-52" />
            <SkeletonBlock className="mt-4 h-6 w-28 rounded-full" />
          </div>
          <SkeletonBlock className="h-12 w-full rounded-full sm:w-40" />
        </div>
        <div className={businessPageGrid}>
          <div>
            <SkeletonBlock className="h-[1.375rem] w-44 sm:h-6" />
            <div className="mt-4">
              <ProductGridSkeleton showVillage={false} />
            </div>
          </div>
          <div className="border-line space-y-2 self-start rounded-(--radius) border p-4">
            <SkeletonBlock className="h-6 w-32" />
            {[0, 1, 2].map((row) => (
              <div key={row} className="flex justify-between py-2">
                <SkeletonBlock className="h-5 w-16" />
                <SkeletonBlock className="h-5 w-24" />
              </div>
            ))}
          </div>
        </div>
      </LoadingRegion>
    </Container>
  )
}
