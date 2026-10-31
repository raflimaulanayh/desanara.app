# File storage — Cloudflare R2

- Bucket: `R2_BUCKET`, served through a custom domain (`R2_PUBLIC_URL`, e.g. `https://cdn.<domain>`).
  `r2.dev` URLs are rate-limited and for development only.
- Upload flow (planned module `uploads`):
  1. Dashboard asks `POST /v1/uploads` with entity + content type + size. The API checks `assertCan` and limits
     (images only, ≤ 2 MB after client compression), then returns a presigned PUT URL and the object key.
  2. Browser compresses (max 1600 px, WebP/JPEG) and PUTs directly to R2 — the VPS never carries the bytes.
  3. Dashboard saves the key on the entity (`product_images.storageKey`).
- Keys: `villages/<villageId>/businesses/<businessId>/products/<productId>/<uuid>.webp`.
- Store keys, not full URLs; build URLs with `R2_PUBLIC_URL` so the domain can change.
- Database backups (`pg_dump`) go to a separate private bucket/prefix.
- Free tier: 10 GB storage; keep images compressed.
