'use client'

import { cn } from '@repo/ui/cn'
import { Home, LayoutGrid, MapPin, Settings } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { publicNavSection, SETTINGS_PATH, VILLAGES_PATH } from '@/lib/paths'

const tabs = [
  { section: 'home', href: '/', label: 'homeLink', Icon: Home },
  { section: 'products', href: '/jelajah', label: 'products', Icon: LayoutGrid },
  { section: 'villages', href: VILLAGES_PATH, label: 'villages', Icon: MapPin },
  { section: 'settings', href: SETTINGS_PATH, label: 'settings', Icon: Settings },
] as const

export function MobileNavigation() {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const currentSection = publicNavSection(pathname)

  return (
    <nav
      aria-label={t('primary')}
      className="mobile-navigation navigation-glass border-line/75 fixed inset-x-0 bottom-0 z-30 h-(--mobile-nav-space) border-t pb-(--mobile-nav-bottom-padding) lg:hidden"
    >
      <ul className="mx-auto grid h-full max-w-xl grid-cols-4 items-stretch gap-1">
        {tabs.map(({ section, href, label, Icon }) => {
          const active = section === currentSection
          const linkProps = {
            'aria-current': active
              ? href === pathname
                ? ('page' as const)
                : ('location' as const)
              : undefined,
            className: cn(
              'group flex h-full min-h-11 flex-col items-center justify-center gap-0.5 rounded-(--radius-compact) px-0.5 py-1 text-center text-xs font-semibold transition-colors focus-visible:outline-offset-[-3px]',
              active ? 'text-(--navigation-accent)' : 'text-muted hover:text-(--navigation-accent)',
            ),
          }
          const content = (
            <>
              <span
                className={cn(
                  'grid h-7 w-14 shrink-0 place-items-center rounded-full transition-colors',
                  active ? 'bg-accent/14' : 'group-hover:bg-accent/14',
                )}
              >
                <Icon
                  className="size-5 group-hover:[stroke-width:2.5]"
                  strokeWidth={active ? 2.5 : 2}
                  aria-hidden
                />
              </span>
              <span className="whitespace-nowrap max-[360px]:text-[0.6875rem]">{t(label)}</span>
            </>
          )
          return (
            <li key={section} className="min-w-0">
              {pathname === '/' && section === 'home' ? (
                <a href="#" {...linkProps}>
                  {content}
                </a>
              ) : (
                <Link href={href} {...linkProps}>
                  {content}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
