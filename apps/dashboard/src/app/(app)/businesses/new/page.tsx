import { Container } from '@repo/ui/components/container'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { BusinessForm } from '@/components/business/business-form'

export default async function NewBusinessPage() {
  const t = await getTranslations()
  return (
    <Container className="flex max-w-2xl flex-col gap-4 py-6 sm:py-10">
      <Link href="/businesses" className="text-muted text-sm font-semibold hover:underline">
        ← {t('businessDetail.backToList')}
      </Link>
      <h1 className="text-2xl font-extrabold sm:text-3xl">{t('businessForm.newTitle')}</h1>
      <BusinessForm />
    </Container>
  )
}
