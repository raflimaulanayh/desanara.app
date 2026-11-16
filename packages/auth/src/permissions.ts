/**
 * Single source of truth for authorization (see docs/architecture/auth-rbac.md).
 *
 * - The API calls `can()` before every read of private data and every mutation.
 *   That is the security boundary.
 * - The dashboard may call `can()` to hide buttons. That is UX only.
 *
 * Pure and framework-free so it can run in the API, the dashboard and the mobile app.
 * Do not bypass it with ad-hoc role checks.
 */

export type GlobalRole = 'super_admin'
export type VillageRole = 'village_admin' | 'village_assistant'
export type BusinessRole = 'owner' | 'assistant'

export interface Actor {
  userId: string
  globalRole: GlobalRole | null
  /** villageId → role */
  villageRoles: Readonly<Record<string, VillageRole>>
  /** businessId → role */
  businessRoles: Readonly<Record<string, BusinessRole>>
}

export type Resource =
  | { type: 'platform' }
  | { type: 'village'; villageId: string }
  | { type: 'business'; villageId: string; businessId: string }
  | { type: 'product'; villageId: string; businessId: string }

export type PlatformAction =
  | 'village.create'
  | 'category.manage'
  | 'user.manage'
  /** List businesses of every village (dashboard). */
  | 'business.list_all'
export type VillageAction =
  /** Read the village settings (profile, map centre): its admins and assistants. */
  | 'village.view'
  | 'village.update'
  | 'village.manage_members'
  | 'village.view_analytics'
  | 'village.customize_theme'
  /** See every business of the village, including drafts of others (dashboard list). */
  | 'business.list'
  | 'business.create'
  | 'business.verify'
  | 'business.takedown'
export type BusinessAction =
  /** Read the private view of one business (consent, verification, takedown). */
  | 'business.view'
  | 'business.update'
  /** Change the public URL slug; breaks shared links, so village admins only. */
  | 'business.change_slug'
  /** Soft delete (duplicates, mistakes); village admins only. */
  | 'business.delete'
  | 'business.publish'
  | 'business.manage_members'
  | 'business.invite_owner'
  | 'business.view_analytics'
  | 'product.create'
export type ProductAction = 'product.update' | 'product.publish' | 'product.delete'

type ActionFor<R extends Resource> = R extends { type: 'platform' }
  ? PlatformAction
  : R extends { type: 'village' }
    ? VillageAction
    : R extends { type: 'business' }
      ? BusinessAction
      : ProductAction

export type Action = PlatformAction | VillageAction | BusinessAction | ProductAction

const VILLAGE_ROLE_ACTIONS: Record<VillageRole, readonly VillageAction[]> = {
  village_admin: [
    'village.view',
    'village.update',
    'village.manage_members',
    'village.view_analytics',
    'village.customize_theme',
    'business.list',
    'business.create',
    'business.verify',
    'business.takedown',
  ],
  village_assistant: ['village.view', 'business.create'],
}

const BUSINESS_ROLE_ACTIONS: Record<BusinessRole, readonly (BusinessAction | ProductAction)[]> = {
  owner: [
    'business.view',
    'business.update',
    'business.publish',
    'business.manage_members',
    'business.invite_owner',
    'business.view_analytics',
    'product.create',
    'product.update',
    'product.publish',
    'product.delete',
  ],
  assistant: [
    'business.view',
    'business.update',
    'business.publish',
    'business.invite_owner',
    'business.view_analytics',
    'product.create',
    'product.update',
    'product.publish',
    'product.delete',
  ],
}

export function can<R extends Resource>(
  actor: Actor | null,
  action: ActionFor<R>,
  resource: R,
): boolean {
  if (!actor) return false
  if (actor.globalRole === 'super_admin') return true

  switch (resource.type) {
    case 'platform':
      return false

    case 'village': {
      const role = actor.villageRoles[resource.villageId]
      return role ? (VILLAGE_ROLE_ACTIONS[role] as readonly string[]).includes(action) : false
    }

    case 'business':
    case 'product': {
      // A village admin manages every business and product inside their village.
      if (actor.villageRoles[resource.villageId] === 'village_admin') return true
      const role = actor.businessRoles[resource.businessId]
      return role ? (BUSINESS_ROLE_ACTIONS[role] as readonly string[]).includes(action) : false
    }
  }
}

/** Throws-style helper for service code. */
export class ForbiddenError extends Error {
  constructor(public readonly action: Action) {
    super(`Forbidden: ${action}`)
    this.name = 'ForbiddenError'
  }
}

export function assertCan<R extends Resource>(
  actor: Actor | null,
  action: ActionFor<R>,
  resource: R,
): void {
  if (!can(actor, action, resource)) throw new ForbiddenError(action)
}
