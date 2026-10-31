import { Container } from '@repo/ui/components/container'
import { getTranslations } from 'next-intl/server'

export async function SiteFooter() {
  const t = await getTranslations('footer')
  return (
    <footer className="border-border text-muted border-t py-8 text-sm">
      <Container>{t('credit', { year: new Date().getFullYear() })}</Container>
    </footer>
  )
}
