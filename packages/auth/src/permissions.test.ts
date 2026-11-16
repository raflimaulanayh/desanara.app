import { describe, expect, test } from 'bun:test'
import { type Actor, can, assertCan, ForbiddenError } from './permissions'

const V1 = 'village-1'
const V2 = 'village-2'
const B1 = 'business-1' // in V1
const B2 = 'business-2' // in V1
const B3 = 'business-3' // in V2

const actor = (partial: Partial<Actor>): Actor => ({
  userId: 'u',
  globalRole: null,
  villageRoles: {},
  businessRoles: {},
  ...partial,
})

const superAdmin = actor({ globalRole: 'super_admin' })
const villageAdmin = actor({ villageRoles: { [V1]: 'village_admin' } })
const villageAssistant = actor({
  villageRoles: { [V1]: 'village_assistant' },
  businessRoles: { [B1]: 'assistant' },
})
const owner = actor({ businessRoles: { [B1]: 'owner' } })

describe('can()', () => {
  test('anonymous can do nothing', () => {
    expect(can(null, 'village.create', { type: 'platform' })).toBe(false)
    expect(can(null, 'product.update', { type: 'product', villageId: V1, businessId: B1 })).toBe(
      false,
    )
  })

  test('super admin can do everything', () => {
    expect(can(superAdmin, 'village.create', { type: 'platform' })).toBe(true)
    expect(can(superAdmin, 'business.verify', { type: 'village', villageId: V2 })).toBe(true)
  })

  test('only super admin has platform actions', () => {
    for (const a of [villageAdmin, villageAssistant, owner]) {
      expect(can(a, 'village.create', { type: 'platform' })).toBe(false)
      expect(can(a, 'category.manage', { type: 'platform' })).toBe(false)
    }
  })

  test('village admin is scoped to their own village', () => {
    expect(can(villageAdmin, 'business.verify', { type: 'village', villageId: V1 })).toBe(true)
    expect(can(villageAdmin, 'business.verify', { type: 'village', villageId: V2 })).toBe(false)
    expect(
      can(villageAdmin, 'product.update', { type: 'product', villageId: V1, businessId: B2 }),
    ).toBe(true)
    expect(
      can(villageAdmin, 'product.update', { type: 'product', villageId: V2, businessId: B3 }),
    ).toBe(false)
  })

  test('village assistant can create businesses but cannot verify them', () => {
    expect(can(villageAssistant, 'business.create', { type: 'village', villageId: V1 })).toBe(true)
    expect(can(villageAssistant, 'business.verify', { type: 'village', villageId: V1 })).toBe(false)
    expect(can(villageAssistant, 'business.create', { type: 'village', villageId: V2 })).toBe(false)
  })

  test('assistant manages only assigned businesses and can hand them over', () => {
    expect(
      can(villageAssistant, 'product.create', { type: 'business', villageId: V1, businessId: B1 }),
    ).toBe(true)
    expect(
      can(villageAssistant, 'business.invite_owner', {
        type: 'business',
        villageId: V1,
        businessId: B1,
      }),
    ).toBe(true)
    expect(
      can(villageAssistant, 'business.manage_members', {
        type: 'business',
        villageId: V1,
        businessId: B1,
      }),
    ).toBe(false)
    expect(
      can(villageAssistant, 'product.update', { type: 'product', villageId: V1, businessId: B2 }),
    ).toBe(false)
  })

  test('owner manages only their own business', () => {
    expect(
      can(owner, 'business.manage_members', { type: 'business', villageId: V1, businessId: B1 }),
    ).toBe(true)
    expect(can(owner, 'product.delete', { type: 'product', villageId: V1, businessId: B1 })).toBe(
      true,
    )
    expect(can(owner, 'product.delete', { type: 'product', villageId: V1, businessId: B2 })).toBe(
      false,
    )
    expect(can(owner, 'business.verify', { type: 'village', villageId: V1 })).toBe(false)
  })

  test('only the village admin (and super admin) can customise the village theme', () => {
    const village = { type: 'village', villageId: V1 } as const
    expect(can(villageAdmin, 'village.customize_theme', village)).toBe(true)
    expect(can(villageAdmin, 'village.customize_theme', { type: 'village', villageId: V2 })).toBe(
      false,
    )
    expect(can(villageAssistant, 'village.customize_theme', village)).toBe(false)
    expect(can(owner, 'village.customize_theme', village)).toBe(false)
    expect(can(superAdmin, 'village.customize_theme', village)).toBe(true)
  })

  test('only the super admin lists businesses of every village', () => {
    expect(can(superAdmin, 'business.list_all', { type: 'platform' })).toBe(true)
    for (const a of [villageAdmin, villageAssistant, owner]) {
      expect(can(a, 'business.list_all', { type: 'platform' })).toBe(false)
    }
  })

  test('village admin lists the businesses of their village only; assistants do not', () => {
    expect(can(villageAdmin, 'business.list', { type: 'village', villageId: V1 })).toBe(true)
    expect(can(villageAdmin, 'business.list', { type: 'village', villageId: V2 })).toBe(false)
    expect(can(villageAssistant, 'business.list', { type: 'village', villageId: V1 })).toBe(false)
    expect(can(owner, 'business.list', { type: 'village', villageId: V1 })).toBe(false)
  })

  test('members view their business; slug change and delete are village admin only', () => {
    const b1 = { type: 'business', villageId: V1, businessId: B1 } as const
    const b3 = { type: 'business', villageId: V2, businessId: B3 } as const
    expect(can(owner, 'business.view', b1)).toBe(true)
    expect(can(villageAssistant, 'business.view', b1)).toBe(true)
    expect(can(owner, 'business.view', b3)).toBe(false)
    for (const action of ['business.change_slug', 'business.delete'] as const) {
      expect(can(villageAdmin, action, b1)).toBe(true)
      expect(can(villageAdmin, action, b3)).toBe(false)
      expect(can(owner, action, b1)).toBe(false)
      expect(can(villageAssistant, action, b1)).toBe(false)
      expect(can(superAdmin, action, b3)).toBe(true)
    }
  })

  test('takedown is a village admin decision', () => {
    const village = { type: 'village', villageId: V1 } as const
    expect(can(villageAdmin, 'business.takedown', village)).toBe(true)
    expect(can(villageAssistant, 'business.takedown', village)).toBe(false)
    expect(can(owner, 'business.takedown', village)).toBe(false)
  })

  test('assertCan throws ForbiddenError', () => {
    expect(() => assertCan(owner, 'village.update', { type: 'village', villageId: V1 })).toThrow(
      ForbiddenError,
    )
  })
})

describe('village settings', () => {
  const v1 = { type: 'village', villageId: V1 } as const
  const v2 = { type: 'village', villageId: V2 } as const

  test('admins and assistants of the village may read them, only admins may change them', () => {
    expect(can(villageAdmin, 'village.view', v1)).toBe(true)
    expect(can(villageAdmin, 'village.update', v1)).toBe(true)
    expect(can(villageAssistant, 'village.view', v1)).toBe(true)
    expect(can(villageAssistant, 'village.update', v1)).toBe(false)
    expect(can(superAdmin, 'village.update', v2)).toBe(true)
  })

  test('nobody outside the village, and no business-only role', () => {
    expect(can(villageAdmin, 'village.view', v2)).toBe(false)
    expect(can(villageAssistant, 'village.view', v2)).toBe(false)
    expect(can(owner, 'village.view', v1)).toBe(false)
  })
})
