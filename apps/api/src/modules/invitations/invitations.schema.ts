import { z } from '@hono/zod-openapi'
import { invitationRoleSchema } from '@repo/validators'

export const createdInvitationSchema = z
  .object({
    id: z.uuid(),
    /** Shown once: the token is not stored. Share it through WhatsApp or copy it. */
    url: z.url(),
    role: invitationRoleSchema,
    roleLabel: z.string(),
    targetName: z.string(),
    inviteeName: z.string().nullable(),
    expiresAt: z.string(),
    /** False when there was no email or sending failed (the link still works). */
    emailed: z.boolean(),
  })
  .openapi('CreatedInvitation')

export const pendingInvitationSchema = z
  .object({
    id: z.uuid(),
    role: invitationRoleSchema,
    roleLabel: z.string(),
    inviteeName: z.string().nullable(),
    inviteeEmail: z.string().nullable(),
    inviterName: z.string(),
    createdAt: z.string(),
    expiresAt: z.string(),
  })
  .openapi('PendingInvitation')

export const invitationPreviewSchema = z
  .object({
    role: invitationRoleSchema,
    roleLabel: z.string(),
    targetName: z.string(),
    villageName: z.string().nullable(),
    inviterName: z.string(),
    inviteeName: z.string().nullable(),
    inviteeEmail: z.string().nullable(),
    expiresAt: z.string(),
    /** The invited email already has an account: sign in, then accept. */
    accountExists: z.boolean(),
  })
  .openapi('InvitationPreview')

export const acceptedInvitationSchema = z
  .object({
    email: z.string(),
    /** False: sign in, then enter the 6-digit code that sign-in sends. */
    emailVerified: z.boolean(),
    joined: z.boolean(),
  })
  .openapi('AcceptedInvitation')
