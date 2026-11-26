import { getTranslations } from 'next-intl/server'
import { ProductPageSkeleton } from '@/components/public-detail-skeletons'

export default async function Loading() {
  const t = await getTranslations('states')
  return <ProductPageSkeleton label={t('loading')} />
}
