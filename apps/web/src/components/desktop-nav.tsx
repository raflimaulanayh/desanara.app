'use client'

import { cn } from '@repo/ui/cn'
import { Settings } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState, type ComponentProps } from 'react'
import { Link, usePathname } from '@/i18n/navigation'
import { publicNavSection } from '@/lib/paths'

type Href = ComponentProps<typeof Link>['href']

export interface DesktopNavItem {
  /** Matches publicNavSection(), so the current page can be marked. */
  section: 'home' | 'products' | 'villages' | 'about' | 'settings'
  href: Href
  label: string
}

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * Desktop links inside the floating header capsule. One light-green pill sits behind the current page
 * and slides to the next one on navigation; hover gives the other links a faint tint.
 */
export function DesktopNav({
  label,
  items,
  join,
}: {
  label: string
  items: DesktopNavItem[]
  join: { href: Href; label: string }
}) {
  const pathname = usePathname()
  const [hash, setHash] = useState('')
  const listRef = useRef<HTMLUListElement>(null)
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null)

  useEffect(() => {
    const read = () => setHash(window.location.hash)
    read()
    window.addEventListener('hashchange', read)
    return () => window.removeEventListener('hashchange', read)
  }, [pathname])

  const current =
    pathname === '/tentang' || pathname.startsWith('/tentang/')
      ? 'about'
      : publicNavSection(pathname, hash)

  useIsoLayoutEffect(() => {
    const list = listRef.current
    // Measure the list item: the link's own offsetLeft is relative to its li.
    const active = list?.querySelector<HTMLElement>('[aria-current="page"]')?.closest('li')
    if (!list || !active) {
      setPill(null)
      return
    }
    const place = () => setPill({ left: active.offsetLeft, width: active.offsetWidth })
    place()
    const observer = new ResizeObserver(place)
    observer.observe(list)
    return () => observer.disconnect()
  }, [current])

  return (
    <nav aria-label={label} className="ml-auto hidden lg:block">
      <ul ref={listRef} className="relative flex items-center gap-0.5 text-sm font-semibold">
        {pill ? (
          <li
            aria-hidden
            className="bg-accent-soft absolute top-1/2 h-10 -translate-y-1/2 rounded-full transition-[left,width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
            style={{ left: pill.left, width: pill.width }}
          />
        ) : null}
        {items.map((item) => {
          const active = item.section === current
          return (
            <li key={item.section} className="relative">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                title={item.section === 'settings' ? item.label : undefined}
                className={cn(
                  'inline-flex h-11 items-center gap-1.5 rounded-full whitespace-nowrap transition-colors',
                  item.section === 'settings' ? 'w-11 justify-center' : 'px-3.5',
                  active
                    ? 'text-accent-soft-foreground'
                    : 'text-foreground/80 hover:bg-accent-soft hover:text-accent-soft-foreground',
                )}
              >
                {item.section === 'settings' ? (
                  <>
                    <Settings className="size-[1.125rem]" aria-hidden />
                    <span className="sr-only">{item.label}</span>
                  </>
                ) : (
                  item.label
                )}
              </Link>
            </li>
          )
        })}
        <li className="header-join relative ml-1 hidden xl:block">
          <Link
            href={join.href}
            className="bg-accent text-accent-foreground inline-flex h-10 items-center rounded-full px-4 whitespace-nowrap transition-colors hover:bg-[var(--accent-hover)]"
          >
            {join.label}
          </Link>
        </li>
      </ul>
    </nav>
  )
}
