import type { Actor, BusinessRole, VillageRole } from '@repo/auth/permissions'
import { type Database, businessMembers, users, villageMembers } from '@repo/db'
import { eq } from 'drizzle-orm'

/** Builds the authorization actor (roles per village/business) for a logged-in user. */
export async function loadActor(db: Database, userId: string): Promise<Actor | null> {
  const [user] = await db
    .select({ globalRole: users.globalRole })
    .from(users)
    .where(eq(users.id, userId))
  if (!user) return null

  const [villageRows, businessRows] = await Promise.all([
    db
      .select({ villageId: villageMembers.villageId, role: villageMembers.role })
      .from(villageMembers)
      .where(eq(villageMembers.userId, userId)),
    db
      .select({ businessId: businessMembers.businessId, role: businessMembers.role })
      .from(businessMembers)
      .where(eq(businessMembers.userId, userId)),
  ])

  return {
    userId,
    globalRole: user.globalRole ?? null,
    villageRoles: Object.fromEntries(villageRows.map((r) => [r.villageId, r.role as VillageRole])),
    businessRoles: Object.fromEntries(
      businessRows.map((r) => [r.businessId, r.role as BusinessRole]),
    ),
  }
}
