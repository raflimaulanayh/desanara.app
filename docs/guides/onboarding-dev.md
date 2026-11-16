# Onboarding developer baru

Tujuan minggu pertama: bisa menjalankan semua aplikasi di laptop, paham aturan repo, dan membuka PR kecil pertama.

## Hari 1: paham produknya

1. [README](../../README.md): apa itu Desanara, peran pengguna, status fitur.
2. [Alur pengguna](../product/user-flows.md): cara pembeli, pendamping, dan admin desa memakai sistem; status UMKM.
3. [`AGENTS.md`](../../AGENTS.md): aturan yang tidak bisa ditawar (hak akses lewat `can()`, scoping desa, migrasi, CHANGELOG).
4. [Glosarium](../product/glossary.md): istilah di lapangan ↔ nama di kode (desa = `village`, UMKM = `business`, pendamping = `assistant`).

## Hari 2: jalankan di laptop

1. Ikuti [setup lokal](local-setup.md) sampai web (:3000), dashboard (:3001), dan API (:8787) jalan.
2. Masuk dashboard dengan akun contoh ([seed-data.md](seed-data.md)), coba sebagai pendamping lalu sebagai admin desa:
   tambah UMKM, setujui, tayangkan, lihat halaman publiknya.
3. Buka `http://localhost:8787/docs` dan coba beberapa endpoint.
4. Siapkan database test lokal dan jalankan `bun run check:all` sampai hijau.

## Hari 3: paham kodenya

1. [Arsitektur](../architecture/overview.md) dan [struktur repo](../architecture/structure.md).
2. Baca satu modul API dari atas ke bawah: `apps/api/src/modules/manage-businesses/`
   (`routes` → `service` → `repository`, plus test-nya).
3. Baca `packages/auth/src/permissions.ts` dan test-nya: semua aturan "siapa boleh apa".
4. Baca satu halaman dashboard: `apps/dashboard/src/components/business/business-detail.tsx`.
5. [ADR](../adr/README.md), terutama 0002 (Hono), 0003 (Supabase sebagai Postgres biasa), 0004 (HeroUI v3), 0009 (Vercel).
6. [Keamanan & privasi](../architecture/security-privacy.md): data apa yang boleh tampil publik.

## Hari 4–5: PR pertama

1. Ambil tugas kecil dari pengurus (misalnya teks, test tambahan, atau perbaikan tampilan).
2. Ikuti [membuat fitur end-to-end](feature-end-to-end.md).
3. Branch dari `main` (`fix/…`, `feat/…`), commit dengan Conventional Commits, tambah entri CHANGELOG.
4. Jalankan skill `pre-pr-review` (atau baca checklist-nya di `.agents/skills/pre-pr-review/SKILL.md`), lalu buka PR.

## Kebiasaan yang dipegang tim

- **Diskusi sebelum membangun.** Modul baru dikritisi dan disepakati dulu; fitur besar ditulis sebagai plan.
- **Server yang memutuskan.** Tombol yang disembunyikan di dashboard hanya kenyamanan; API tetap menolak dengan `can()`.
- **Jangan sentuh production dengan tangan.** Tidak mengubah tabel lewat dashboard Supabase, tidak menjalankan test ke Supabase.
  Migrasi ke production butuh persetujuan pengurus.
- **Data contoh tetap ditandai** `is_seed = true` dan memakai nomor WhatsApp tim.
- **Teks untuk pengguna** ditulis dalam bahasa Indonesia sehari-hari yang mudah dipahami pemilik UMKM; situs publik juga dalam bahasa Inggris.

## Memakai AI

- Pasang tooling: restart Claude Code di repo ini lalu `/mcp` (HeroUI, Supabase read-only, Vercel), dan HeroUI skills:
  `curl -fsSL https://heroui.com/install | bash -s heroui-react`.
- Minta agent membaca `AGENTS.md` dulu. HeroUI di repo ini **v3**; jangan menyalin contoh v2/NextUI.
- Review setiap diff seperti kode buatan orang lain. Jangan merge tanpa test dan CHANGELOG.
