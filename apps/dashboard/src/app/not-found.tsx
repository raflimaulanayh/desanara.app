import { buttonVariants } from '@heroui/styles'
import { StatusPage } from '@repo/ui/components/status-page'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

export default async function NotFound() {
  const t = await getTranslations('states')
  return (
    <main>
      <StatusPage
        pose="not-found"
        title={t('notFoundTitle')}
        description={t('notFoundBody')}
        action={
          <Link
            href="/"
            className={buttonVariants({
              variant: 'primary',
              className: 'min-h-11 rounded-full px-5 font-semibold',
            })}
          >
            {t('home')}
          </Link>
        }
      />
    </main>
  )
}
