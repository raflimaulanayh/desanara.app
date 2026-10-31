import { Container } from '@repo/ui/components/container'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { LocaleSwitcher } from './locale-switcher'

export async function SiteHeader() {
  const t = await getTranslations('nav')
  return (
    <header className="border-border bg-background/80 sticky top-0 z-10 border-b backdrop-blur">
      <Container className="flex h-14 items-center justify-between gap-4">
        <Link href="/" className="text-accent text-lg font-bold">
          {t('brand')}
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/explore" className="hover:text-accent">
            {t('explore')}
          </Link>
          <Link href="/about" className="hover:text-accent hidden sm:inline">
            {t('about')}
          </Link>
          <LocaleSwitcher />
        </nav>
      </Container>
    </header>
  )
}
