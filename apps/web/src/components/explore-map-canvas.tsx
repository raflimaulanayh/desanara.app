'use client'

import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import type { ExploreLeafletProps } from './explore-leaflet-map'

const ExploreLeafletMap = dynamic(() => import('./explore-leaflet-map'), {
  ssr: false,
  loading: MapLoading,
})

function MapLoading() {
  const t = useTranslations('explore.map')
  return (
    <p role="status" className="text-muted grid size-full place-items-center text-sm font-medium">
      {t('loading')}
    </p>
  )
}

export function ExploreMapCanvas(props: ExploreLeafletProps) {
  return <ExploreLeafletMap {...props} />
}
