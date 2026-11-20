import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { timestamps } from './_shared'
import { users } from './auth'
import { businesses } from './businesses'
import { businessRole, invitationStatus, invitationTarget, villageRole } from './enums'
import { villages } from './villages'

/**
 * Invitation links (sent via WhatsApp) used to onboard village admins, assistants,
 * and to hand a UMKM account over to its real owner.
 */
export const invitations = pgTable(
  'invitations',
  {
    id: uuid().primaryKey().defaultRandom(),
    /** Store only a hash of the token; the raw token is shown once in the link. */
    tokenHash: text().notNull().unique(),
    target: invitationTarget().notNull(),
    villageId: uuid().references(() => villages.id, { onDelete: 'cascade' }),
    businessId: uuid().references(() => businesses.id, { onDelete: 'cascade' }),
    villageRole: villageRole(),
    businessRole: businessRole(),
    /** Optional contact the invite was sent to (phone or email). */
    sentTo: text(),
    /** Prefills the acceptance form. */
    inviteeName: text(),
    /** Lower-cased. When set, the account must use this email. */
    inviteeEmail: text(),
    status: invitationStatus().notNull().default('pending'),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    acceptedBy: text().references(() => users.id),
    acceptedAt: timestamp({ withTimezone: true }),
    createdBy: text()
      .notNull()
      .references(() => users.id),
    ...timestamps,
  },
  (t) => [index().on(t.villageId), index().on(t.businessId), index().on(t.createdBy, t.createdAt)],
)
