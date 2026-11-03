import { BRAND_NAME } from '@repo/i18n'
import { Container } from '@repo/ui/components/container'
import { Search } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Logo } from './brand/logo'
import { LocaleSwitcher } from './locale-switcher'

/** The cover of the order book: printed wordmark in platform ink, a thin double rule underneath. */
export async function SiteHeader() {
  const t = await getTranslations('nav')
  return (
    <header className="bg-background/95 sticky top-0 z-20 border-b-[3px] border-double border-[var(--nota-ink)] backdrop-blur-sm">
      <Container className="flex h-14 items-center justify-between gap-3">
        <Link href="/" aria-label={BRAND_NAME} className="inline-flex h-11 items-center">
          <Logo size="md" />
        </Link>
        <nav
          aria-label={t('primary')}
          className="font-print flex items-center gap-1 text-sm font-semibold tracking-[0.1em] uppercase sm:gap-4"
        >
          <Link
            href="/jelajah"
            className="hover:text-accent inline-flex h-11 items-center gap-1.5 px-2"
          >
            <Search className="size-4" aria-hidden />
            <span>{t('explore')}</span>
          </Link>
          <Link
            href="/tentang"
            className="hover:text-accent hidden h-11 items-center px-2 sm:inline-flex"
          >
            {t('about')}
          </Link>
          <LocaleSwitcher />
        </nav>
      </Container>
    </header>
  )
}
