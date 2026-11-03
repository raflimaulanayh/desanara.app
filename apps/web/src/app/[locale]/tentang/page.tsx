import { Container } from '@repo/ui/components/container'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { BrandMark } from '@/components/brand-mark'
import { Stamp } from '@/components/stamp'

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
  const [t, tStamp] = await Promise.all([getTranslations('about'), getTranslations('home')])
  return (
    <Container className="py-12 sm:py-16">
      <h1 className="font-print max-w-3xl text-[clamp(2.4rem,8vw,4.5rem)] leading-[0.92] font-bold text-balance uppercase">
        {t('title')}
      </h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex max-w-[66ch] flex-col gap-5 text-lg leading-relaxed">
          <p>{t('lead')}</p>
          <p>{t('how')}</p>
          <p className="text-muted">{t('pilot')}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-8 gap-y-4">
            <BrandMark mark="himasif" height={40} />
            <BrandMark mark="satu" height={52} />
          </div>
        </div>
        <div className="flex flex-wrap content-start gap-5">
          <Stamp size="lg" rotate={-4}>
            {tStamp('trust.verified.stamp')}
          </Stamp>
          <Stamp size="lg" rotate={3}>
            {tStamp('trust.direct.stamp')}
          </Stamp>
          <Stamp size="lg" rotate={-2}>
            {tStamp('trust.mentored.stamp')}
          </Stamp>
        </div>
      </div>
    </Container>
  )
}
