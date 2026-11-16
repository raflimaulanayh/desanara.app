# Security and privacy

How Desanara protects accounts, tenant data and the personal data of business owners, and which gaps are still
open. Indonesian context: the platform processes personal data under **UU No. 27/2022 (UU PDP)**.

Related: [Auth & RBAC](auth-rbac.md), [Multi-tenancy](multi-tenancy.md), [Storage](storage.md),
[Data model (personal data on public pages)](data-model.md), [Deployment](deployment.md).

## Threat model in one table

| Who                         | What could go wrong                                        | Main control                                                                                                     |
| --------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Anonymous visitor           | Reads private data (addresses, drafts, NIB)                | Public endpoints select an explicit allow-list of columns and only `published`, non-deleted, non-taken-down rows |
| Logged-in user of village A | Reads or edits village B's businesses                      | `can()` on every private endpoint; repositories scope by `villageId`; tests cover cross-village denial           |
| Assistant or owner          | Escalates to admin actions (verify, takedown, slug change) | Role matrix in `can()`; the dashboard hides buttons, the API still rejects (403)                                 |
| Anyone with a presigned URL | Uploads a huge file or a non-image                         | Content-Type and Content-Length are part of the signature; 5-minute expiry; key confined to the entity's folder  |
| A phone photo               | Leaks the owner's home GPS position                        | Browser re-encodes every image (EXIF stripped) before upload                                                     |
| A developer or AI agent     | Changes production data or schema by hand                  | Migrations only (ADR 0003); integration tests refuse non-local databases; no write-capable MCP on production     |
| A leaked repository         | Exposes credentials                                        | No secrets in the repo; `.env` is git-ignored; keys live in Vercel and local `.env` only                         |

## Authentication

- **Better Auth** (email + password), mounted by the API at `/api/auth/*`. Passwords are hashed by Better Auth;
  minimum length 8.
- Sessions are HttpOnly cookies. Without a shared parent domain the dashboard proxies `/api/auth/*` and `/v1/*` to
  the API, so the cookie is first-party for the browser (no third-party cookie, works in Safari).
  See [Deployment, Login across hosts](deployment.md#login-across-hosts).
- `TRUSTED_ORIGINS` limits which origins may call auth endpoints with credentials; CORS uses the same list.
- `/v1/me` and every `/v1/manage/*` response is `Cache-Control: no-store`.
- The API reference (`/docs`, `/openapi.json`) is behind its own login in production and not served at all without
  `DOCS_PASSWORD`. It hides the reference only; every endpoint is still protected on its own.

## Authorization

- One function decides access: `can(actor, action, resource)` in `packages/auth/src/permissions.ts`.
  Services call `assertCan()` before any read of private data or any write. Ad-hoc role checks are forbidden
  (AGENTS.md rule 1), and every action has tests in `permissions.test.ts`.
- The actor is built server-side from the membership tables on every request (`apps/api/src/lib/actor.ts`).
  `globalRole` cannot be set by the client.
- Resource ids used for permission checks come from the database row, never from the request body
  (for example a product's `businessId` and `villageId`).
- Business rules that are not "who" questions (publish needs verification + consent + WhatsApp, takedown blocks
  publishing) live in services and answer `409` with a machine-readable `details.reason`.

## Tenant isolation

A village is the tenant. Every query on tenant data filters by `villageId` (or a business inside it) and
`deletedAt IS NULL`. Postgres row-level security is not used: the database is accessed only by the API with one role,
and isolation is enforced and tested in the service and repository layers. See [multi-tenancy](multi-tenancy.md).

## Personal data (UU PDP)

| Data                                                                    | Where it may appear                                      |
| ----------------------------------------------------------------------- | -------------------------------------------------------- |
| Business name, owner name, story, products, WhatsApp number, shop links | Public, only after the owner's consent                   |
| Village, district, regency                                              | Public                                                   |
| Street address, RT/RW, map pin, NIB                                     | Dashboard only (village team and the business's members) |
| Account email, phone, password hash                                     | Never public                                             |

- **Consent before publishing.** `consentAt`, `consentMethod` and `consentRecordedBy` are stored. The dashboard reads a
  consent text to the owner and requires a signed paper form. Publishing is refused without consent.
- **Withdrawal** of consent unpublishes the business immediately.
- **No address on public pages** (decision 2026-11-16): public location stops at village level, with no opt-in,
  demo data included. Coordinates (planned) follow the same rule.
- **Photos**: re-encoded on a canvas in the browser, which drops EXIF metadata including GPS.
- **Analytics events** (`POST /v1/events`) store the event type, the entity ids resolved on the server, and the locale.
  No IP address, user agent or cookie id is stored (the `referrer` column exists but the endpoint does not fill it).
- **Demo data** is flagged `is_seed = true`, uses the team's WhatsApp number, and is removed with `db:seed:reset`
  before the site goes public ([deploy guide](../guides/deploy.md)).

## Uploads

Flow and limits: [storage](storage.md). Security-relevant points:

- `POST /v1/manage/media/presign` checks `can()` for the target entity and the per-target limits (size, count) first.
- The presigned PUT signs `Content-Type` and `Content-Length`; R2 rejects any other type or size (verified: 403).
- The URL expires after 5 minutes and is bound to a key inside the entity's folder (`villages/<id>/…`);
  `POST /v1/manage/media` refuses keys outside that folder.
- The API never receives file bytes. Orphaned objects are found with `media:clean-orphans` (dry run by default).

## Audit trail

State changes write a row to `audit_logs` in the same transaction: who, what entity, which action, and a field-level
diff. Examples: `business.create`, `business.update`, `business.delete`, verification and takedown,
`product.create`, `product.update`, `product.delete`, `product.reorder_images`, `media.attach`, `media.remove`.
Action names are stable so a future notification service can subscribe to them.

## HTTP hardening

- `secureHeaders()` on every API response; CORS restricted to `TRUSTED_ORIGINS` with credentials.
- Errors use one envelope with a `requestId`. Unexpected errors are logged on the server with that id and answered
  with a generic `500 INTERNAL`; stack traces are never returned.
- Inputs are validated with Zod at the route (OpenAPI) and again in shared validators used by the forms.
- User content is rendered as text. Village branding is tokens + code templates only; no user CSS or HTML (ADR 0007).

## Secrets and environments

- Real values live in local `.env` (git-ignored) and Vercel project settings. `.env.example` documents names only.
- The R2 token can read and write only the `desanara-media` bucket; backups will use a separate token.
- Supabase is reached through the poolers only; the Supabase Data API is disabled.
- Integration tests run only against a local database (`TEST_DATABASE_URL`, non-local hosts are refused).

## Planned hardening

These are scheduled with the modules that need them and tracked in [features-mvp](../product/features-mvp.md):

- Accounts are created only from an approved registration or an invitation (invitations module).
- Public forms use Turnstile, and login and registration use a persistent rate limit store.
- Analytics events are filtered for bots and repeated hits before statistics are used in reports.
- Scheduled `pg_dump` backups to a private bucket ([deployment](deployment.md#backups)).
- A separate development database for preview deployments.
- Media served from a custom domain once the domain is bought.
