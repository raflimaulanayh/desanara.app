import { getTranslations } from 'next-intl/server'
import { BusinessPageSkeleton } from '@/components/public-detail-skeletons'

export default async function Loading() {
  const t = await getTranslations('states')
  return <BusinessPageSkeleton label={t('loading')} />
}
