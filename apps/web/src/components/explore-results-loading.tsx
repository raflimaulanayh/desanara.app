import { cn } from '@repo/ui/cn'
import { Container } from '@repo/ui/components/container'
import { LoadingRegion, SkeletonBlock } from '@repo/ui/components/loading-region'
import { ProductGridSkeleton } from './product-card'

export function explorePageLayout(mapView: boolean) {
  return cn(
    'catalogue-explore',
    mapView
      ? 'catalogue-explore-map flex max-w-none flex-1 flex-col px-0 sm:px-0'
      : 'pt-2 pb-8 sm:pt-7 sm:pb-10',
  )
}

export function exploreToolbarLayout(mapView: boolean) {
  return cn(
    'flex',
    mapView
      ? 'bg-surface flex-wrap items-center gap-2 px-4 pt-3 pb-1 sm:px-6'
      : 'mt-3 flex-col gap-3 sm:mt-5 sm:gap-4',
  )
}

export const mapStatusLayout = 'bg-surface items-baseline gap-y-1 px-4 py-2 sm:px-6'
export const mapStatusNoteLayout = 'ml-auto text-xs leading-5'
export const mapStatusNoteWithReset = 'ml-0 basis-full sm:ml-auto sm:basis-auto'

export function ExplorePageSkeleton({
  label,
  title,
  mapView,
  filtered,
}: {
  label: string
  title: string
  mapView: boolean
  filtered: boolean
}) {
  return (
    <Container className={explorePageLayout(mapView)}>
      <h1 className={mapView ? 'sr-only' : 'page-title'}>{title}</h1>
      <div className={exploreToolbarLayout(mapView)} aria-hidden>
        <SkeletonBlock
          className={cn('h-10 rounded-full sm:max-w-lg', mapView && 'flex-[1_1_12rem]')}
        />
        {mapView ? (
          <SkeletonBlock className="h-9 w-20 rounded-full" />
        ) : (
          <>
            <div className="flex gap-2 py-0.5">
              {['w-16', 'w-24', 'w-20'].map((width) => (
                <SkeletonBlock key={width} className={cn('h-9 rounded-full', width)} />
              ))}
            </div>
            <div className="flex items-center justify-between gap-2">
              <SkeletonBlock className="h-9 w-20 rounded-full" />
              <SkeletonBlock className="h-9 w-32 rounded-full" />
            </div>
          </>
        )}
      </div>
      <ExploreResultsLoading label={label} mapView={mapView} filtered={filtered} />
    </Container>
  )
}

export function ExploreResultsLoading({
  label,
  mapView,
  filtered,
}: {
  label: string
  mapView: boolean
  filtered: boolean
}) {
  return (
    <LoadingRegion label={label} className={mapView ? 'flex flex-1 flex-col' : 'mt-3 sm:mt-4'}>
      <div
        className={cn(
          'flex min-h-9 flex-wrap gap-x-3',
          mapView ? mapStatusLayout : 'mb-2 items-center justify-between',
        )}
      >
        <SkeletonBlock className="h-5 w-24 rounded-full" />
        {filtered ? (
          <div className={cn('flex items-center', mapView ? 'ml-auto min-h-7 sm:ml-0' : 'min-h-9')}>
            <SkeletonBlock className="h-5 w-20 rounded-full" />
          </div>
        ) : null}
        {mapView ? (
          <div
            className={cn(
              'flex min-h-5 items-center',
              mapStatusNoteLayout,
              filtered && mapStatusNoteWithReset,
            )}
          >
            <SkeletonBlock className="h-4 w-28 rounded-full" />
          </div>
        ) : null}
      </div>
      {mapView ? (
        <div className="explore-map-canvas bg-wash relative min-h-44 flex-1">
          <SkeletonBlock className="absolute inset-0 rounded-none" />
          <SkeletonBlock className="absolute bottom-[calc(1.75rem+env(safe-area-inset-bottom))] left-1/2 h-11 w-24 -translate-x-1/2 rounded-full" />
        </div>
      ) : (
        <ProductGridSkeleton mobileList />
      )}
    </LoadingRegion>
  )
}
