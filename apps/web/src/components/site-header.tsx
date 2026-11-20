import { getLocale, getTranslations } from 'next-intl/server'
import { Container } from '@repo/ui/components/container'
import { Link } from '@/i18n/navigation'
import { localePath } from '@/lib/paths'
import { Logo } from './brand/logo'
import { LocaleSwitcher } from './locale-switcher'
import { SearchForm } from './search-form'

/** Sticky marketplace header: brand, search (always one tap away), language. */
export async function SiteHeader() {
  const [t, th, locale] = await Promise.all([
    getTranslations('nav'),
    getTranslations('home'),
    getLocale(),
  ])
  return (
    <header className="bg-surface/95 border-line sticky top-0 z-20 border-b backdrop-blur-sm">
      <Container className="flex flex-wrap items-center gap-x-4 gap-y-2 py-2.5 md:flex-nowrap">
        <Link href="/" aria-label={t('home')} className="inline-flex h-11 shrink-0 items-center">
          <Logo size="md" priority />
        </Link>
        <div className="order-3 w-full md:order-none md:max-w-xl md:flex-1">
          <SearchForm
            action={localePath(locale, '/jelajah')}
            placeholder={th('searchPlaceholder')}
          />
        </div>
        <nav
          aria-label={t('primary')}
          className="ml-auto flex items-center gap-1 text-sm font-semibold md:ml-0"
        >
          <Link
            href="/jelajah"
            className="hover:bg-wash hidden h-10 items-center rounded-full px-4 md:inline-flex"
          >
            {t('explore')}
          </Link>
          <Link
            href="/tentang"
            className="hover:bg-wash hidden h-10 items-center rounded-full px-4 md:inline-flex"
          >
            {t('about')}
          </Link>
          <LocaleSwitcher />
        </nav>
      </Container>
    </header>
  )
}
