# File storage — Cloudflare R2

Account: Cloudflare **HIMASIF** (owned by the student association, not a person). Location hint: APAC.

| Bucket             | Access                          | Holds                          |
| ------------------ | ------------------------------- | ------------------------------ |
| `desanara-media`   | public (`R2_PUBLIC_URL`)        | logos, banners, product photos |
| `desanara-backups` | private, no public URL, no CORS | `pg_dump` files                |

- Public access applies to a **whole bucket**, so backups must never live in the media bucket (not even
  under a prefix).
- `R2_PUBLIC_URL` is the custom domain `https://cdn.desanara.app` (since 2026-11-17). The bucket's `r2.dev` URL is
  switched off. Keys are stored, not URLs, so changing the host needs no data migration.
- CORS on `desanara-media`: `PUT`, `GET`, `HEAD` from the dashboard origins
  (`https://dashboard.desanara.app`, `http://localhost:3001`), headers `content-type`,
  `content-length`, exposes `ETag`. Add the new origin when the dashboard moves to its own domain:
  `wrangler r2 bucket cors set desanara-media --file cors.json`.
- S3 credentials (`R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY`) come from an R2 API token with
  **Object Read & Write limited to `desanara-media`**. Create it in the dashboard (R2 → Manage API Tokens);
  the backup job gets its own token limited to `desanara-backups`.
- Upload flow (module `media`, `apps/api/src/modules/media`; browser side `apps/dashboard/src/lib/upload-image.ts`):
  1. The browser re-encodes every image on a canvas (WebP, JPEG where WebP cannot be encoded) to the target's
     `maxEdge`. Re-encoding is mandatory even for small files: it strips EXIF, including the GPS position
     phones store (often the owner's home, UU PDP). HEIC that the browser cannot decode is refused with a message.
  2. `POST /v1/manage/media/presign` `{ target, id, contentType, size }`: `assertCan`, limits, then a 5-minute
     presigned PUT. **Content-Type and Content-Length are signed** (aws4fetch `allHeaders`), so R2 itself
     rejects any other type or size (verified: 403). R2 has no presigned POST with a size range.
  3. The browser PUTs straight to R2 (XHR for progress); the API never carries the bytes (Vercel body limit).
  4. `POST /v1/manage/media` `{ target, id, key }`: the API checks the key belongs to that entity's folder,
     `HEAD`s the object (exists, WebP/JPEG, within `maxBytes`), deletes it if not, then records it in the same
     transaction as the audit row. Single-slot targets replace and delete the old file.
  5. `DELETE /v1/manage/media?target&id&key` removes it; a published product keeps its last photo (409 `LAST_PHOTO`).
- Targets and limits (`mediaRules` in `@repo/validators`, who/where in `media.targets.ts`; add a target in both):

  | Target           | Permission                | Max size | Max files | Max edge |
  | ---------------- | ------------------------- | -------- | --------- | -------- |
  | `product_image`  | `product.update`          | 2 MB     | 10        | 1600 px  |
  | `business_logo`  | `business.update`         | 1 MB     | 1         | 800 px   |
  | `village_logo`   | `village.customize_theme` | 1 MB     | 1         | 800 px   |
  | `village_banner` | `village.customize_theme` | 2 MB     | 1         | 2400 px  |

- Keys: `villages/<villageId>/businesses/<businessId>/products/<productId>/<uuid>.webp`,
  `villages/<villageId>/businesses/<businessId>/logo/<uuid>.webp`, `villages/<villageId>/{logo,banner}/<uuid>.webp`.
  Only keys under `villages/` are ever deleted by the API; demo photos live under `seed/` and are never touched.
- Client: `aws4fetch` (the API runs on the Vercel Node.js runtime, so `Bun.S3Client` is not available; aws4fetch
  only needs `fetch` + Web Crypto and also runs on the VPS). Without the R2 env vars upload endpoints answer 503.
- Orphans (uploaded but never attached, e.g. the tab closed mid-upload):
  `bun run --cwd apps/api media:clean-orphans` lists files under `villages/` older than 24 h that no row points to;
  add `-- --apply` to delete them. Run it now and then (monthly is plenty).
- Demo photos: `bun run --cwd apps/api media:upload-seed` copies `apps/web/public/media/seed/**` to R2 under the
  same keys (idempotent). Done for `desanara-media` on 2026-11-16.
- `next/image` accepts the host of `NEXT_PUBLIC_MEDIA_URL` (`images.remotePatterns` in both Next configs). Changing
  the media domain is an env change plus a redeploy.
- Store keys, not full URLs; build URLs with `R2_PUBLIC_URL` so the domain can change.
- Database backups (`pg_dump`) go to `desanara-backups` with their own token.
- Free tier: 10 GB storage; keep images compressed.
