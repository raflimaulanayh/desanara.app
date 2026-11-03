import { Container } from '@repo/ui/components/container'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

export default async function NotFound() {
  const t = await getTranslations('notFound')
  return (
    <Container className="flex flex-col items-start gap-4 py-20">
      <p className="text-accent text-6xl font-extrabold tracking-tight">404</p>
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t('title')}</h1>
      <p className="text-muted max-w-[48ch] text-lg">{t('body')}</p>
      <Link
        href="/"
        className="bg-accent text-accent-foreground mt-2 inline-flex h-12 items-center rounded-full px-6 font-bold"
      >
        {t('back')}
      </Link>
    </Container>
  )
}
