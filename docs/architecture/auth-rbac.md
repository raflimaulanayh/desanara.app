# Authentication and authorization

## Authentication — Better Auth

- Mounted by the API at `/api/auth/*` (`packages/auth/src/server.ts`, created in `apps/api/src/index.ts`).
- Email + password for the MVP. Tables: `users`, `sessions`, `accounts`, `verifications` (Drizzle, plural).
- Extra user fields: `phone`, `globalRole` (server-set only), `isSeed`.
- Web/dashboard: HTTP-only session cookie. In production set `COOKIE_DOMAIN=<parent domain>` so
  `dashboard.<domain>` and `api.<domain>` share it (`crossSubDomainCookies`). `TRUSTED_ORIGINS` lists the apps.
- Dashboard client: `createUmkmAuthClient()` from `@repo/auth/client` (`signIn.email`, `signOut`).
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
| `village.create`, `category.manage`, `user.manage`                                              | ✅          | —                           | —                 | —           | —                    |
| `business.list_all` (dashboard list across villages)                                            | ✅          | —                           | —                 | —           | —                    |
| `village.update`, `village.manage_members`, `village.view_analytics`, `village.customize_theme` | ✅          | ✅                          | —                 | —           | —                    |
| `business.list` (every business of the village, incl. drafts)                                   | ✅          | ✅                          | —                 | —           | —                    |
| `business.create`                                                                               | ✅          | ✅                          | ✅                | —           | —                    |
| `business.verify`, `business.takedown`                                                          | ✅          | ✅                          | —                 | —           | —                    |
| `business.view`, `business.update`, `business.publish`, `business.view_analytics`               | ✅          | ✅                          | via assignment    | ✅          | ✅                   |
| `business.change_slug`, `business.delete` (soft)                                                | ✅          | ✅                          | —                 | —           | —                    |
| `business.manage_members`                                                                       | ✅          | ✅                          | —                 | ✅          | —                    |
| `business.invite_owner` (hand-over)                                                             | ✅          | ✅                          | via assignment    | ✅          | ✅                   |
| `product.create/update/publish/delete`                                                          | ✅          | ✅                          | via assignment    | ✅          | ✅                   |

A village assistant who creates a business becomes its `assistant` (business membership) in the same
transaction. Business rules that are not "who" questions live in services, not in `can()`:

- Publish needs `verificationStatus = verified`, consent (`consentAt`), a WhatsApp number, and no takedown.
  The API answers 409 `CONFLICT` with `details.reason` = `NOT_VERIFIED` | `NO_CONSENT` | `NO_WHATSAPP` |
  `TAKEN_DOWN` so the dashboard can explain what is missing.
- Only a `pending` business can be reviewed; rejection needs a note (`verificationNote`). Editing a rejected
  business puts it back to `pending`.
- Takedown (`takenDownAt`) hides the business and blocks publishing until a village admin restores it.
- Withdrawing consent unpublishes the business immediately.
- Dashboard lists: super admin sees all; a village admin sees their villages; everyone else sees only the
  businesses they are a member of.

## Account hand-over (pendamping → pemilik)

1. Assistant creates the business (owner has no account yet).
2. Assistant creates an invitation (`target = business`, `businessRole = owner`); the API returns a one-time link;
   only a hash is stored.
3. The link is sent through WhatsApp. The owner opens `/invite/[token]`, sets a password, becomes `owner`.
4. The assistant keeps the `assistant` membership until the owner removes it.

## Tests

Every new action needs cases in `packages/auth/src/permissions.test.ts`, including a cross-village denial.
