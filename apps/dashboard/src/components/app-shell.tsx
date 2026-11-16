'use client'

import { Button, Dropdown, Label } from '@heroui/react'
import { ApiError, unwrap } from '@repo/api-client'
import { cn } from '@repo/ui/cn'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { CircleCheck, House, LogOut, Settings, Store, type LucideIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { type ReactNode, useEffect } from 'react'
import { api } from '@/lib/api'
import { authClient } from '@/lib/auth-client'
import { clearDrafts } from '@/lib/form-draft'
import { type NavIcon, isActive, navFor } from '@/lib/nav'
import { type Session, SessionProvider } from '@/lib/session'
import { Logo, LogoMark } from './logo'

const ICONS: Record<NavIcon, LucideIcon> = {
  home: House,
  store: Store,
  check: CircleCheck,
  settings: Settings,
}

/** Short role line for the header: "Admin desa · Desa Baros", or the first role found. */
function roleLine(s: Session, t: (key: string) => string) {
  if (s.actor.globalRole) return t('roles.super_admin')
  const v = s.memberships.villages[0]
  if (v) return `${t(`roles.${v.role}`)} · ${v.name}`
  const b = s.memberships.businesses[0]
  if (b) return `${t(`roles.${b.role}`)} · ${b.name}`
  return t('dashboard.noRoleShort')
}

/**
 * Logged-in frame: checks the session (→ /login?next=… when it is gone), then a sidebar on
 * desktop and a top bar + bottom tab bar on phones (thumb reach; pendamping work on phones).
 */
export function AppShell({ children }: { children: ReactNode }) {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const me = useQuery({
    queryKey: ['me'],
    queryFn: async () => (await unwrap(await api.v1.me.$get())).data,
    retry: (count, error) => !(error instanceof ApiError && error.status === 401) && count < 2,
  })
  const expired = me.error instanceof ApiError && me.error.status === 401

  useEffect(() => {
    if (expired) router.replace(`/login?next=${encodeURIComponent(pathname)}`)
  }, [expired, pathname, router])

  if (!me.data) {
    return (
      <div className="grid min-h-dvh place-items-center px-4 text-center">
        {me.isError && !expired ? (
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm">{t('errors.network')}</p>
            <Button variant="secondary" onPress={() => me.refetch()}>
              {t('common.retry')}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3" role="status">
            <LogoMark size={40} />
            <p className="text-muted text-sm">{t('dashboard.loadingSession')}</p>
          </div>
        )}
      </div>
    )
  }

  const session = me.data
  const items = navFor(session.actor, (k) => t(`nav.${k}`))
  const logout = async () => {
    clearDrafts(session.user.id)
    await authClient.signOut()
    queryClient.clear()
    router.replace('/login')
  }

  const account = (
    <Dropdown>
      <Button
        variant="ghost"
        aria-label={`${t('dashboard.account')}: ${session.user.name}`}
        className="h-auto min-w-0 justify-start gap-2 px-2 py-1.5 text-left"
      >
        <span className="bg-accent-soft text-accent-soft-foreground grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold">
          {session.user.name.slice(0, 1).toUpperCase()}
        </span>
        <span className="hidden min-w-0 flex-col sm:flex">
          <span className="truncate text-sm font-semibold">{session.user.name}</span>
          <span className="text-muted truncate text-xs">{roleLine(session, t)}</span>
        </span>
      </Button>
      <Dropdown.Popover>
        <Dropdown.Menu
          aria-label={t('dashboard.account')}
          onAction={(key) => {
            if (key === 'logout') void logout()
          }}
        >
          <Dropdown.Item id="logout" textValue={t('dashboard.logout')} variant="danger">
            <LogOut className="size-4" aria-hidden />
            <Label>{t('dashboard.logout')}</Label>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  )

  return (
    <SessionProvider value={session}>
      <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_1fr]">
        <aside className="border-line bg-surface sticky top-0 hidden h-dvh flex-col gap-6 border-r p-4 lg:flex">
          <Link href="/" className="px-2 pt-1">
            <Logo />
          </Link>
          <nav aria-label={t('nav.label')} className="flex flex-col gap-1">
            {items.map((item) => {
              const Icon = ICONS[item.icon]
              const active = isActive(pathname, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors',
                    active ? 'bg-accent-soft text-accent-soft-foreground' : 'hover:bg-wash',
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="border-line mt-auto border-t pt-3">{account}</div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="border-line bg-surface/95 sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b px-4 backdrop-blur-sm lg:hidden">
            <Link href="/" aria-label={t('nav.home')}>
              <Logo className="h-5" />
            </Link>
            {account}
          </header>
          <main id="main" className={cn('flex-1', items.length > 1 && 'pb-20 lg:pb-0')}>
            {children}
          </main>
        </div>

        {items.length > 1 ? (
          <nav
            aria-label={t('nav.label')}
            className="border-line bg-surface/95 fixed inset-x-0 bottom-0 z-30 flex border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden"
          >
            {items.map((item) => {
              const Icon = ICONS[item.icon]
              const active = isActive(pathname, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex h-16 flex-1 flex-col items-center justify-center gap-1 text-xs font-semibold',
                    active ? 'text-accent' : 'text-muted',
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        ) : null}
      </div>
    </SessionProvider>
  )
}
