import { Container } from '@repo/ui/components/container'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })
  return { title: t('title') }
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('about')
  return (
    <Container className="flex max-w-3xl flex-col gap-4 py-12">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p className="text-muted leading-relaxed">{t('body')}</p>
    </Container>
  )
}
