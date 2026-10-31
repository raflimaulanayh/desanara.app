# Multi-tenancy

**Tenant = village (`villages` row).** One database, one schema, `villageId` on every tenant-owned row.

| Table                                           | Tenant key                                                    |
| ----------------------------------------------- | ------------------------------------------------------------- |
| `villages`                                      | itself                                                        |
| `village_members`                               | `villageId`                                                   |
| `businesses`                                    | `villageId`                                                   |
| `products`                                      | `villageId` (denormalised from the business for fast filters) |
| `invitations`, `analytics_events`, `audit_logs` | `villageId` (nullable where platform-level)                   |

## Rules

1. Repositories filter by tenant **and** `deletedAt IS NULL` for live data.
2. Services authorize with `assertCan(actor, action, { type, villageId, businessId })` before touching data.
   The resource's `villageId` must come from the database row, never from the request body.
3. `products.villageId` must equal its business's `villageId`; set it in the service, never from input.
4. Public endpoints only return `status = 'published'` rows, and businesses only when
   `verificationStatus = 'verified'`.

## Resolving the tenant

- Now: path based — `/villages/[village]` on web, explicit ids on the API.
- Later: subdomains (`sukamaju.<domain>`) via the web `proxy.ts`, mapping host → village slug.
  No schema change needed.

## Optional hardening: Row Level Security

If we add RLS later, use our own session variable (`SET LOCAL app.village_id = '…'` inside a transaction)
and policies on `village_id`. **Do not** use Supabase's `auth.uid()` — it would break portability (ADR 0003).
