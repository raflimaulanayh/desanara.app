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
- Every response carries `X-Request-Id`; log it with errors.
- Throw `AppError` (or let `assertCan` throw `ForbiddenError`) — `handleError` turns it into the envelope.
- Mutations write an `audit_logs` row in the same transaction.
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
