# Authentication and authorization

## Authentication — Better Auth

- Mounted by the API at `/api/auth/*` (`packages/auth/src/server.ts`, created in `apps/api/src/index.ts`).
- Email + password for the MVP. Tables: `users`, `sessions`, `accounts`, `verifications`, `rate_limits`
  (Drizzle, plural).
- Public sign-up is off. Accounts come from invitations (`apps/api/src/modules/invitations`), created with
  `createCredentialUser()` in the same transaction as the membership. Email verification is required, with a 6-digit
  code (Better Auth `emailOTP` plugin, `overrideDefaultEmailVerification`); a correct code signs the person in.
  Forgot password uses a code too. Details and limits: [security-privacy](security-privacy.md#authentication).
- Extra user fields: `phone`, `globalRole` (server-set only), `isSeed`.
- Dashboard: HTTP-only session cookie, first-party on `dashboard.desanara.app` because the dashboard proxies the API.
  `COOKIE_DOMAIN=desanara.app` (`crossSubDomainCookies`) is available if another subdomain must read the session;
  it is empty today. `TRUSTED_ORIGINS` lists the apps.
- Dashboard client: `createUmkmAuthClient()` from `@repo/auth/client` (`signIn.email`, `signOut`,
  `emailOtp.verifyEmail`, `emailOtp.requestPasswordReset`, `emailOtp.resetPassword`).
- Mobile (later): Better Auth Expo/bearer plugin.

## Authorization — `can()`

`packages/auth/src/permissions.ts` is the only place that decides access.
The API session middleware builds an `Actor` (`apps/api/src/lib/actor.ts`) from the membership tables.

| Role                                  | Scope        | Stored in               |
| ------------------------------------- | ------------ | ----------------------- |
| `super_admin`                         | platform     | `users.global_role`     |
| `village_admin`                       | one village  | `village_members.role`  |
| `village_assistant` (pendamping desa) | one village  | `village_members.role`  |
| `owner` (pemilik UMKM)                | one business | `business_members.role` |
| `assistant` (pendamping UMKM)         | one business | `business_members.role` |

### Matrix

| Action                                                                                          | super_admin | village_admin (own village) | village_assistant | owner (own) | assistant (assigned) |
| ----------------------------------------------------------------------------------------------- | ----------- | --------------------------- | ----------------- | ----------- | -------------------- |
| `village.create`, `category.manage`, `user.manage`                                              | Yes         | No                          | No                | No          | No                   |
| `business.list_all` (dashboard list across villages)                                            | Yes         | No                          | No                | No          | No                   |
| `village.view` (village settings, map centre)                                                   | Yes         | Yes                         | Yes               | No          | No                   |
| `village.update`, `village.manage_members`, `village.view_analytics`, `village.customize_theme` | Yes         | Yes                         | No                | No          | No                   |
| `village.invite_members` (invite pendamping desa)                                               | Yes         | Yes                         | No                | No          | No                   |
| `business.list` (every business of the village, incl. drafts)                                   | Yes         | Yes                         | No                | No          | No                   |
| `business.create`                                                                               | Yes         | Yes                         | Yes               | No          | No                   |
| `business.verify`, `business.takedown`                                                          | Yes         | Yes                         | No                | No          | No                   |
| `business.view`, `business.update`, `business.publish`, `business.view_analytics`               | Yes         | Yes                         | via assignment    | Yes         | Yes                  |
| `business.change_slug`, `business.delete` (soft)                                                | Yes         | Yes                         | No                | No          | No                   |
| `business.manage_members`                                                                       | Yes         | Yes                         | No                | Yes         | No                   |
| `business.invite_owner` (hand-over)                                                             | Yes         | Yes                         | via assignment    | Yes         | No (see below)       |
| `business.invite_members` (invite the owner's helpers)                                          | Yes         | Yes                         | No                | Yes         | No                   |
| `product.create/update/publish/delete`                                                          | Yes         | Yes                         | via assignment    | Yes         | Yes                  |

A village assistant who creates a business becomes its `assistant` (business membership) in the same
transaction. `business.invite_owner` for a business `assistant` is granted only when that person is also a
`village_assistant` of the village (a pendamping): a helper the owner invited must not be able to create an owner,
who outranks them. Village admins are invited by the super admin only (`user.manage`). Business rules that are not "who" questions live in services, not in `can()`:

- Publish needs `verificationStatus = verified`, consent (`consentAt`), a WhatsApp number, and no takedown.
  The API answers 409 `CONFLICT` with `details.reason` = `NOT_VERIFIED` | `NO_CONSENT` | `NO_WHATSAPP` |
  `TAKEN_DOWN` so the dashboard can explain what is missing.
- Only a `pending` business can be reviewed; rejection needs a note (`verificationNote`). Editing a rejected
  business puts it back to `pending`.
- Takedown (`takenDownAt`) hides the business and blocks publishing until a village admin restores it.
- Withdrawing consent unpublishes the business immediately.
- Products: reading needs `business.view` on the product's business; creating needs `product.create` on the
  business; edit, publish and delete use `product.*` on the product (ids from the database row).
  Publishing a product needs a category and at least one photo (409 `NO_CATEGORY` | `NO_PHOTO`); it shows
  publicly only while its business is public too. There is no product takedown: a village admin can delete
  (soft) a product, and the reason is in `audit_logs`.
- Dashboard lists: super admin sees all; a village admin sees their villages; everyone else sees only the
  businesses they are a member of.

## Account hand-over and registration (planned, invitations module)

Not built yet. Decided on 2026-11-16; details go into a plan before implementation.

### Hand-over (pendamping → pemilik)

1. Assistant creates the business (owner has no account yet).
2. Assistant creates an invitation (`target = business`, `businessRole = owner`); the API returns a one-time link;
   only a hash is stored.
3. The link is sent through WhatsApp. The owner opens `/invite/[token]`, sets a password, becomes `owner`.
4. The assistant keeps the `assistant` membership until the owner removes it.

### Self-registration

- Two entry points: a per-village link/QR (`/gabung/<village>`) and an open form where the applicant searches
  their village (Turnstile + rate limit).
- An application has no password. After the village approves it, a WhatsApp invitation link creates the account.
  Rejected applications are deleted after a retention period.
- This lets the open Better Auth sign-up be closed completely: every account comes from an approved application
  or an invitation.
- New villages apply through an "Ajukan desa" form; the HIMA team verifies them and a super admin activates them.

## Tests

Every new action needs cases in `packages/auth/src/permissions.test.ts`, including a cross-village denial.
