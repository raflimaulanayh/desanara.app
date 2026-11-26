import { buttonVariants } from '@heroui/styles'
import { StatusPage } from '@repo/ui/components/status-page'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

export default async function NotFound() {
  const t = await getTranslations('notFound')
  return (
    <StatusPage
      pose="not-found"
      title={t('title')}
      description={t('body')}
      action={
        <Link
          href="/"
          className={buttonVariants({
            variant: 'primary',
            className: 'min-h-11 rounded-full px-5 font-semibold',
          })}
        >
          {t('back')}
        </Link>
      }
    />
  )
}
