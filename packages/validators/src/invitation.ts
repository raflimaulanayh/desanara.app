import { z } from 'zod'

/** Lower-cased, trimmed email (Better Auth stores emails lower-case). */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email('Email tidak valid').max(254))

/** Same rule as Better Auth (`minPasswordLength: 8`): length only, no symbol rules. */
export const passwordSchema = z
  .string()
  .min(8, 'Password minimal 8 karakter')
  .max(128, 'Password terlalu panjang')

export const personNameSchema = z
  .string()
  .trim()
  .min(2, 'Nama minimal 2 huruf')
  .max(80, 'Nama terlalu panjang')

export const invitationRoleSchema = z.enum([
  'village_admin',
  'village_assistant',
  'owner',
  'assistant',
])
export type InvitationRole = z.infer<typeof invitationRoleSchema>

/** Which target each role belongs to. */
export const ROLE_TARGET = {
  village_admin: 'village',
  village_assistant: 'village',
  owner: 'business',
  assistant: 'business',
} as const satisfies Record<InvitationRole, 'village' | 'business'>

/** Labels used in emails and the dashboard. */
export const ROLE_LABEL: Record<InvitationRole, string> = {
  village_admin: 'admin desa',
  village_assistant: 'pendamping desa',
  owner: 'pemilik UMKM',
  assistant: 'asisten UMKM',
}

/** `POST /v1/manage/invitations`. Village roles need `villageId`, business roles `businessId`. */
export const invitationCreateSchema = z
  .object({
    role: invitationRoleSchema,
    villageId: z.uuid().optional(),
    businessId: z.uuid().optional(),
    inviteeName: personNameSchema.optional(),
    /** When set, the invitation is also emailed and the account must use this address. */
    inviteeEmail: emailSchema.optional(),
  })
  .refine((v) => (ROLE_TARGET[v.role] === 'village' ? !!v.villageId : !!v.businessId), {
    message: 'Pilih desa atau UMKM tujuan undangan',
    path: ['role'],
  })
export type InvitationCreateInput = z.infer<typeof invitationCreateSchema>

/**
 * `POST /v1/invitations/{token}/accept`. Without a session all three fields are required (new account);
 * with a session the body may be empty (the logged-in user joins).
 */
export const invitationAcceptSchema = z.object({
  name: personNameSchema.optional(),
  email: emailSchema.optional(),
  password: passwordSchema.optional(),
  /** Proof from the emailed link (`?e=`): the email is verified without a code. */
  emailProof: z.string().max(100).optional(),
})
export type InvitationAcceptInput = z.infer<typeof invitationAcceptSchema>

/** Invitation links stay valid for 7 days. */
export const INVITATION_DAYS = 7
/** Invitations one person may create per 24 hours. */
export const INVITATIONS_PER_DAY = 30
