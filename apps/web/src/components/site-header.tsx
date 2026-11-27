import { getLocale, getTranslations } from 'next-intl/server'
import { Info, Store } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { JOIN_HREF, localePath, SETTINGS_PATH, VILLAGES_HASH } from '@/lib/paths'
import { Logo } from './brand/logo'
import { DesktopNav, type DesktopNavItem } from './desktop-nav'
import { HeaderScroll } from './header-scroll'
import { MobileMenu } from './mobile-menu'
import { SearchForm } from './search-form'

/**
 * Sticky search and brand. On phones a full-width glass bar. On desktop the same bar at the top of the
 * page, which turns into a floating rounded capsule as wide as the page content once the page scrolls
 * (HeaderScroll sets data-scrolled; styles in globals.css). The current page is marked in DesktopNav.
 */
export async function SiteHeader() {
  const [t, th, locale] = await Promise.all([
    getTranslations('nav'),
    getTranslations('home'),
    getLocale(),
  ])
  const menuItems: DesktopNavItem[] = [
    { section: 'home', href: '/', label: t('homeLink') },
    { section: 'products', href: '/jelajah', label: t('products') },
    { section: 'villages', href: { pathname: '/', hash: VILLAGES_HASH }, label: t('villages') },
    { section: 'about', href: '/tentang', label: t('about') },
    { section: 'settings', href: SETTINGS_PATH, label: t('settings') },
  ]
  return (
    <header className="site-header group/header sticky top-0 z-20">
      <HeaderScroll />
      <div className="header-bar navigation-glass border-line/75 relative border-b">
        <div className="header-inner mx-auto grid w-full max-w-6xl grid-cols-[2.5rem_1fr_2.5rem] items-center gap-y-1.5 px-4 pt-1.5 pb-2 sm:px-6 lg:flex lg:gap-5 lg:py-2.5">
          <MobileMenu openLabel={t('menu')} closeLabel={t('menuClose')}>
            <nav aria-label={t('menu')}>
              <Link
                href="/tentang"
                className="hover:bg-wash flex h-10 items-center gap-2 rounded-(--radius-compact) px-3 text-sm font-semibold"
              >
                <Info className="text-accent size-5 shrink-0" aria-hidden />
                {t('about')}
              </Link>
              <Link
                href={JOIN_HREF}
                className="bg-accent text-accent-foreground mt-3 flex h-10 items-center justify-center gap-2 rounded-full text-sm font-bold transition-colors hover:bg-[var(--accent-hover)]"
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
          <div className="site-search col-span-full row-start-2 min-w-0 lg:flex-1">
            <SearchForm
              action={localePath(locale, '/jelajah')}
              placeholder={th('searchPlaceholder')}
            />
          </div>
          <DesktopNav
            label={t('primary')}
            items={menuItems}
            join={{ href: JOIN_HREF, label: t('join') }}
          />
        </div>
      </div>
    </header>
  )
}
