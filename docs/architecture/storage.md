# File storage — Cloudflare R2

Account: Cloudflare **HIMASIF** (owned by the student association, not a person). Location hint: APAC.

| Bucket             | Access                          | Holds                          |
| ------------------ | ------------------------------- | ------------------------------ |
| `desanara-media`   | public (`R2_PUBLIC_URL`)        | logos, banners, product photos |
| `desanara-backups` | private, no public URL, no CORS | `pg_dump` files                |

- Public access applies to a **whole bucket**, so backups must never live in the media bucket (not even
  under a prefix).
- `R2_PUBLIC_URL` is the `r2.dev` URL for now. Cloudflare rate-limits it and calls it development-only;
  it is acceptable for the pilot and demo. Move to a custom domain (`https://cdn.<domain>`) after the
  domain is bought — keys are stored, not URLs, so no data migration is needed.
- CORS on `desanara-media`: `PUT`, `GET`, `HEAD` from the dashboard origins
  (`https://desanara-dashboard.vercel.app`, `http://localhost:3001`), headers `content-type`,
  `content-length`, exposes `ETag`. Add the new origin when the dashboard moves to its own domain:
  `wrangler r2 bucket cors set desanara-media --file cors.json`.
- S3 credentials (`R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY`) come from an R2 API token with
  **Object Read & Write limited to `desanara-media`**. Create it in the dashboard (R2 → Manage API Tokens);
  the backup job gets its own token limited to `desanara-backups`.
- Upload flow (planned module `uploads`):
  1. Dashboard asks `POST /v1/uploads` with entity + content type + size. The API checks `assertCan` and limits
     (images only, ≤ 2 MB after client compression), then returns a presigned PUT URL and the object key.
  2. Browser compresses (max 1600 px, WebP/JPEG) and PUTs directly to R2 — the VPS never carries the bytes.
  3. Dashboard saves the key on the entity (`product_images.storageKey`).
- Keys: `villages/<villageId>/businesses/<businessId>/products/<productId>/<uuid>.webp`.
- Store keys, not full URLs; build URLs with `R2_PUBLIC_URL` so the domain can change.
- Database backups (`pg_dump`) go to `desanara-backups` with their own token.
- Free tier: 10 GB storage; keep images compressed.
