import { getLocale, getTranslations } from 'next-intl/server'
import { Container } from '@repo/ui/components/container'
import { Info, Settings, Store } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { JOIN_HREF, localePath, SETTINGS_PATH, VILLAGES_HASH } from '@/lib/paths'
import { Logo } from './brand/logo'
import { MobileMenu } from './mobile-menu'
import { SearchForm } from './search-form'

/** Sticky search and brand, with full navigation on desktop. */
export async function SiteHeader() {
  const [t, th, locale] = await Promise.all([
    getTranslations('nav'),
    getTranslations('home'),
    getLocale(),
  ])
  const menuItems = [
    { href: '/', label: t('homeLink') },
    { href: '/jelajah', label: t('products') },
    { href: { pathname: '/', hash: VILLAGES_HASH }, label: t('villages') },
    { href: '/tentang', label: t('about') },
  ]
  return (
    <header className="site-header bg-surface lg:border-line/75 sticky top-0 z-20 lg:border-b">
      <Container className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-y-1.5 pt-1.5 pb-2 lg:flex lg:gap-5 lg:py-2.5">
        <MobileMenu openLabel={t('menu')} closeLabel={t('menuClose')}>
          <nav aria-label={t('menu')}>
            <Link
              href="/tentang"
              className="hover:bg-wash flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold"
            >
              <Info className="text-accent size-5 shrink-0" aria-hidden />
              {t('about')}
            </Link>
            <Link
              href={JOIN_HREF}
              className="bg-accent text-accent-foreground mt-3 flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-colors hover:bg-[var(--accent-hover)]"
            >
              <Store className="size-5" aria-hidden />
              {t('join')}
            </Link>
          </nav>
        </MobileMenu>
        <Link
          href="/"
          aria-label={t('home')}
          className="inline-flex h-11 shrink-0 items-center justify-self-center"
        >
          <Logo size="sm" priority className="h-10 w-auto" />
        </Link>
        <div className="site-search col-span-full row-start-2 min-w-0 lg:max-w-sm lg:flex-1">
          <SearchForm
            action={localePath(locale, '/jelajah')}
            placeholder={th('searchPlaceholder')}
          />
        </div>
        <nav
          aria-label={t('primary')}
          className="ml-auto hidden items-center gap-1 text-sm font-semibold lg:flex"
        >
          {menuItems.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className="hover:bg-wash-strong inline-flex h-11 items-center rounded-full px-3 whitespace-nowrap"
            >
              {label}
            </Link>
          ))}
          <Link
            href={JOIN_HREF}
            className="text-accent hover:bg-wash-strong mr-1 hidden h-11 items-center rounded-full px-3 whitespace-nowrap transition-colors xl:inline-flex"
          >
            {t('join')}
          </Link>
          <Link
            href={SETTINGS_PATH}
            className="hover:bg-wash-strong inline-flex h-11 items-center gap-1.5 rounded-full px-3 whitespace-nowrap"
          >
            <Settings className="text-accent size-4" aria-hidden />
            {t('settings')}
          </Link>
        </nav>
      </Container>
    </header>
  )
}
