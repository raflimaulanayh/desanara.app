# Membuat fitur end-to-end

Contoh: "admin desa bisa memverifikasi UMKM".

1. **Plan** — fitur besar/lintas app: buat `docs/plan/PLAN-<nama>.md` dari `TEMPLATE.md`, minta persetujuan.
2. **Izin** — tambah/cek action di `packages/auth/src/permissions.ts` (`business.verify`) dan test-nya.
3. **Skema** — jika perlu kolom/tabel: ubah `packages/db/src/schema/*`, jalankan `bun run db:generate`,
   commit file di `packages/db/drizzle/` (skill `new-db-migration`).
4. **Validasi** — skema Zod di `packages/validators` (`businessVerifySchema`).
5. **API** — modul di `apps/api/src/modules/<nama>/` (skill `new-api-module`, atau `bun run generate`):
   - `repository`: query Drizzle, selalu di-scope `villageId` dan `deletedAt IS NULL`
   - `service`: `assertCan(...)` → aturan bisnis → tulis `audit_logs`
   - `routes`: `createRoute()` + chain ke `app.ts`
   - test: minimal satu kasus ditolak (403) dan satu berhasil
6. **UI** — halaman di `apps/dashboard` atau `apps/web` (skill `new-page`), panggil API lewat `@repo/api-client`,
   semua teks lewat next-intl (ID dan EN untuk web).
7. **Docs** — update dokumen arsitektur yang terdampak, `docs/product/features-mvp.md`, dan **`docs/CHANGELOG.md`**.
8. **Cek** — `bun run check:all`, jalankan aplikasinya, skill `pre-pr-review`, buka PR.
