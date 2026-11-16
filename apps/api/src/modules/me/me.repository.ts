import type { Actor } from '@repo/auth/permissions'
import { type Database, businesses, villages } from '@repo/db'
import { and, asc, inArray, isNull } from 'drizzle-orm'

/** Names of the villages and businesses the actor has a role in (live rows only). */
export async function membershipsOf(db: Database, actor: Actor) {
  const villageIds = Object.keys(actor.villageRoles)
  const businessIds = Object.keys(actor.businessRoles)
  const [vs, bs] = await Promise.all([
    villageIds.length
      ? db
          .select({ id: villages.id, slug: villages.slug, name: villages.name })
          .from(villages)
          .where(and(inArray(villages.id, villageIds), isNull(villages.deletedAt)))
          .orderBy(asc(villages.name))
      : [],
    businessIds.length
      ? db
          .select({
            id: businesses.id,
            slug: businesses.slug,
            name: businesses.name,
            villageId: businesses.villageId,
          })
          .from(businesses)
          .where(and(inArray(businesses.id, businessIds), isNull(businesses.deletedAt)))
          .orderBy(asc(businesses.name))
      : [],
  ])
  return {
    villages: vs.map((v) => ({ ...v, role: actor.villageRoles[v.id]! })),
    businesses: bs.map((b) => ({ ...b, role: actor.businessRoles[b.id]! })),
  }
}
