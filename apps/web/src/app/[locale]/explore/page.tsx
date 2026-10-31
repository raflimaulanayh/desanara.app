import { Container } from '@repo/ui/components/container'
import { EmptyState } from '@repo/ui/components/empty-state'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'explore' })
  return { title: t('title') }
}

export default async function ExplorePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('explore')
  return (
    <Container className="flex flex-col gap-6 py-12">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <EmptyState title={t('comingSoonTitle')} description={t('comingSoonDescription')} />
    </Container>
  )
}
