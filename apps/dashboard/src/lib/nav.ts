import { type Actor, can } from '@repo/auth/permissions'

/**
 * Menu per role. Visibility uses `can()` on the actor (UX only: the API enforces every action).
 * A page appears here once it exists, so the menu never links to an unfinished screen.
 */
export type NavIcon = 'home' | 'store' | 'check' | 'settings'

export interface NavItem {
  href: string
  label: string
  icon: NavIcon
}

/** Message keys under `nav.*`. */
type Label = 'home' | 'businesses' | 'verifications' | 'villageSettings'

interface NavRule {
  href: string
  label: Label
  icon: NavIcon
  visible: (actor: Actor) => boolean
}

const villageIds = (a: Actor) => Object.keys(a.villageRoles)

export const NAV_RULES: NavRule[] = [
  { href: '/', label: 'home', icon: 'home', visible: () => true },
  { href: '/businesses', label: 'businesses', icon: 'store', visible: (a) => canSeeBusinesses(a) },
]

export function navFor(actor: Actor, t: (key: Label) => string): NavItem[] {
  return NAV_RULES.filter((r) => r.visible(actor)).map((r) => ({
    href: r.href,
    label: t(r.label),
    icon: r.icon,
  }))
}

/** Helpers shared by later menu entries (kept here so the rules stay in one file). */
export const canSeeBusinesses = (a: Actor) =>
  can(a, 'business.list_all', { type: 'platform' }) ||
  villageIds(a).length > 0 ||
  Object.keys(a.businessRoles).length > 0

export const canReview = (a: Actor) =>
  can(a, 'business.list_all', { type: 'platform' }) ||
  villageIds(a).some((villageId) => can(a, 'business.verify', { type: 'village', villageId }))

/** Pages that live outside a section's path but belong to it (a product belongs to its UMKM). */
const SECTION_ALIASES: Record<string, string[]> = { '/businesses': ['/products'] }

const under = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`)

/** Exact match for "/", prefix match for sections ("/businesses" covers "/businesses/123"). */
export function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return [href, ...(SECTION_ALIASES[href] ?? [])].some((h) => under(pathname, h))
}

/** Only same-site paths, so `/login?next=` cannot send people to another site after login. */
export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return '/'
  return next
}
