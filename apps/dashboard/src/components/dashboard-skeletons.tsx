import { Card } from '@heroui/react'
import { SkeletonBlock } from '@repo/ui/components/loading-region'
import { dashboardMapFrame } from './map/map-frame'

export const businessRowsLayout =
  'border-line divide-line bg-surface divide-y overflow-hidden rounded-2xl border'
export const businessRowLayout = 'flex items-center gap-3 p-4'
export const villageRowLayout = '-mx-2 flex items-center gap-3 rounded-xl p-3'
export const dashboardProductRowLayout = '-mx-2 flex items-center gap-3 rounded-xl p-2'

const rows = [0, 1, 2]

export function BusinessRowsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <SkeletonBlock className="h-5 w-20" />
      <ul className={businessRowsLayout}>
        {rows.map((row) => (
          <li key={row} className={businessRowLayout}>
            <div className="min-w-0 flex-1">
              <SkeletonBlock className="h-6 w-2/5" />
              <SkeletonBlock className="mt-0.5 h-4 w-32" />
              <div className="mt-2 flex gap-1.5">
                <SkeletonBlock className="h-6 w-14 rounded-full" />
                <SkeletonBlock className="h-6 w-20 rounded-full" />
              </div>
            </div>
            <SkeletonBlock className="size-5 shrink-0" />
          </li>
        ))}
      </ul>
    </div>
  )
}

export function VillageRowsSkeleton() {
  return (
    <ul className="flex flex-col">
      {rows.map((row) => (
        <li key={row} className="border-line border-b last:border-0">
          <div className={villageRowLayout}>
            <div className="min-w-0 flex-1">
              <SkeletonBlock className="h-6 w-36" />
              <SkeletonBlock className="h-4 w-48 max-w-full" />
            </div>
            <SkeletonBlock className="size-4 shrink-0" />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function DashboardProductRowsSkeleton() {
  return (
    <ul className="flex flex-col">
      {rows.map((row) => (
        <li key={row} className="border-line border-b last:border-0">
          <div className={dashboardProductRowLayout}>
            <SkeletonBlock className="size-16 shrink-0 rounded-lg" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <SkeletonBlock className="h-5 w-2/3" />
              <SkeletonBlock className="h-5 w-20" />
              <SkeletonBlock className="h-6 w-16 rounded-full" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

function DetailHeader({ business = false }: { business?: boolean }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <SkeletonBlock className="h-8 w-52 max-w-full sm:h-9" />
        {business ? <SkeletonBlock className="mt-1 h-5 w-32" /> : null}
        <div className="mt-3 flex gap-1.5">
          <SkeletonBlock className="h-6 w-16 rounded-full" />
          <SkeletonBlock className="h-6 w-20 rounded-full" />
        </div>
      </div>
      {business ? <SkeletonBlock className="h-11 w-28 rounded-full" /> : null}
    </div>
  )
}

function PublishCard({ checklist }: { checklist: number }) {
  return (
    <Card>
      <Card.Header>
        <SkeletonBlock className="h-6 w-32" />
        <SkeletonBlock className="h-5 w-3/4" />
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <ul className="flex flex-col gap-2">
          {Array.from({ length: checklist }, (_, row) => (
            <li key={row} className="flex items-center gap-2">
              <SkeletonBlock className="size-5 rounded-full" />
              <SkeletonBlock className="h-5 w-44" />
            </li>
          ))}
        </ul>
        <SkeletonBlock className="h-10 w-28 rounded-full" />
      </Card.Content>
    </Card>
  )
}

export function BusinessDetailSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <SkeletonBlock className="h-5 w-36" />
      <DetailHeader business />
      <PublishCard checklist={4} />
    </div>
  )
}

export function DashboardProductSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <SkeletonBlock className="h-5 w-36" />
      <DetailHeader />
      <PublishCard checklist={2} />
      <PhotosCard />
    </div>
  )
}

export function VillageSettingsSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <SkeletonBlock className="h-8 w-44 sm:h-9" />
        <SkeletonBlock className="mt-1 h-5 w-60 max-w-full" />
      </div>
      <Card>
        <Card.Header>
          <SkeletonBlock className="h-6 w-36" />
          <SkeletonBlock className="h-5 w-4/5" />
        </Card.Header>
        <Card.Content className="flex flex-col gap-3">
          <SkeletonBlock className={dashboardMapFrame} />
          <SkeletonBlock className="h-10 w-36 rounded-full" />
        </Card.Content>
      </Card>
    </div>
  )
}

function FormField() {
  return (
    <div className="flex flex-col gap-1.5">
      <SkeletonBlock className="h-5 w-24" />
      <SkeletonBlock className="h-12 w-full rounded-xl" />
    </div>
  )
}

function PhotosCard() {
  return (
    <Card>
      <Card.Header>
        <SkeletonBlock className="h-7 w-32" />
      </Card.Header>
      <Card.Content>
        <SkeletonBlock className="h-12 w-32 rounded-full" />
      </Card.Content>
    </Card>
  )
}

export function BusinessFormSkeleton() {
  return (
    <div className="space-y-4">
      <Card>
        <Card.Header>
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-7 w-36" />
        </Card.Header>
        <Card.Content className="flex flex-col gap-5">
          <FormField />
          <FormField />
          <FormField />
        </Card.Content>
      </Card>
      <SkeletonBlock className="h-12 w-full rounded-full" />
    </div>
  )
}

export function ProductFormSkeleton() {
  return (
    <div className="space-y-4">
      <PhotosCard />
      <Card>
        <Card.Header>
          <SkeletonBlock className="h-7 w-36" />
        </Card.Header>
        <Card.Content className="flex flex-col gap-5">
          <FormField />
          <FormField />
          <FormField />
        </Card.Content>
      </Card>
    </div>
  )
}

export function InvitationSkeleton() {
  return (
    <Card className="w-full max-w-sm">
      <Card.Header>
        <SkeletonBlock className="h-6 w-48" />
        <SkeletonBlock className="h-5 w-4/5" />
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <FormField />
        <FormField />
        <FormField />
        <SkeletonBlock className="h-12 w-full rounded-full" />
      </Card.Content>
    </Card>
  )
}
