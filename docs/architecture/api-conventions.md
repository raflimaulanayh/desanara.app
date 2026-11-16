# API conventions

- Base path: `/v1/<resource>` (plural, kebab-case). Auth: `/api/auth/*` (Better Auth).
- OpenAPI 3.1 at `/openapi.json`, interactive docs (Scalar) at `/docs`. Every route is declared with
  `createRoute()` so it is documented and typed.
- JSON field casing: **camelCase** (matches TypeScript; the RPC client needs no mapping).
- Success: `{ "data": … }`, lists add `{ "meta": { "page", "pageSize", "total" } }`.
- Errors (always):

  ```json
  {
    "error": {
      "code": "NOT_FOUND",
      "message": "Village not found",
      "details": null,
      "requestId": "…"
    }
  }
  ```

  | HTTP | code                                                      |
  | ---- | --------------------------------------------------------- |
  | 400  | `BAD_REQUEST`                                             |
  | 401  | `UNAUTHENTICATED`                                         |
  | 403  | `FORBIDDEN`                                               |
  | 404  | `NOT_FOUND`                                               |
  | 409  | `CONFLICT`                                                |
  | 422  | `VALIDATION_FAILED` (`details` = `z.treeifyError` output) |
  | 500  | `INTERNAL`                                                |

- Pagination: `?page=1&pageSize=20`, `pageSize ≤ 50` (`paginationSchema`).
- **Public vs private.** Public, cacheable reads use slugs (`/v1/businesses/{slug}`). Everything the
  dashboard reads or writes lives under **`/v1/manage/*`**, addressed by uuid, behind `requireUser`, and
  answered with `Cache-Control: no-store`. Example: `/v1/manage/businesses` (list, create),
  `/v1/manage/businesses/{id}` (get, `PATCH`, `DELETE`), `/{id}/verify|publish|unpublish|takedown|restore`;
  `/v1/manage/businesses/{id}/products` (list, create), `/v1/manage/products/{id}` (get, `PATCH`, `DELETE`),
  `/v1/manage/products/{id}/publish|unpublish`, `PATCH /v1/manage/products/{id}/images` (photo order);
  `/v1/manage/media/presign`, `POST|DELETE /v1/manage/media` (uploads for every image target, storage.md).
- `PATCH` is partial: a missing field is unchanged, `null` or `""` clears it. Never give update schemas
  defaults (a default silently overwrites stored data on every edit).
- Private responses include `permissions` (booleans from `can()`) so the dashboard can show the right
  buttons without duplicating the rules.
- A broken business rule is `409 CONFLICT` with a stable `details.reason` code (e.g. `NOT_VERIFIED`).
- A field rule the service checks against the stored row (e.g. `compareAtPrice` must stay above the new
  `price`) is `422 VALIDATION_FAILED` in the same `details` shape as request validation
  (`AppError.invalid(field, message)`), so the dashboard shows it next to the field.
- Every response carries `X-Request-Id`; log it with errors.
- Throw `AppError` (or let `assertCan` throw `ForbiddenError`) — `handleError` turns it into the envelope.
- Mutations write an `audit_logs` row in the same transaction (`writeAudit()` in `apps/api/src/lib/audit.ts`;
  updates store a field diff `{ field: { from, to } }`).
- Webhooks (payments, later) must be idempotent and verified by signature.

## Client usage

```ts
import { createApiClient, unwrap } from '@repo/api-client'
const api = createApiClient(process.env.NEXT_PUBLIC_API_URL!)
const { data, meta } = await unwrap(
  await api.v1.villages.$get({ query: { page: '1', pageSize: '12' } }),
)
```

Keep route definitions **chained** in `app.ts` and in each router so the RPC types survive.
