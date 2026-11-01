import { Container } from '@repo/ui/components/container'
import { getTranslations } from 'next-intl/server'
import { Stamp } from '@/components/stamp'
import { Link } from '@/i18n/navigation'

export default async function NotFound() {
  const t = await getTranslations('notFound')
  return (
    <Container className="flex flex-col items-start gap-6 py-20">
      <Stamp tone="demo" size="lg" rotate={-6}>
        404
      </Stamp>
      <h1 className="font-print text-[clamp(2.2rem,7vw,3.75rem)] leading-none font-bold uppercase">
        {t('title')}
      </h1>
      <p className="text-muted max-w-[48ch] text-lg">{t('body')}</p>
      <Link href="/" className="font-print text-accent text-lg font-bold uppercase underline">
        {t('back')}
      </Link>
    </Container>
  )
}
