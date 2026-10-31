# PLAN-village-theming — Tampilan custom per desa

|         |                                                                                                                                               |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Status  | Approved (2026-11-01) — fondasi selesai, UI dikerjakan bersama halaman publik                                                                 |
| Owner   | HIMA Sistem Informasi                                                                                                                         |
| Terkait | [ADR 0007](../adr/0007-village-theming.md), [village-theming.md](../architecture/village-theming.md), [PLAN-mvp-seminar](PLAN-mvp-seminar.md) |

## 1. Tujuan

Setiap desa bisa punya identitas visual sendiri (warna, logo, banner, font, template) dengan template default yang disiapkan tim.

## 2. Scope

- **MVP (11 Des):** brand kit (logo, banner, warna dengan cek kontras + preset palet, gaya sudut), 1 template `classic`,
  editor dengan preview di dashboard, terapkan/kembalikan ke default.
- **Fase 2:** template ke-2 dan ke-3, pilihan font di editor (enum sudah ada), subdomain/custom domain per desa.
- **Non-goals:** CSS/HTML bebas, page builder, atur urutan section, tema per UMKM.

## 3. Keputusan

- Berlaku di halaman desa + UMKM + produk desa itu; landing/jelajah nasional dan dashboard tetap brand platform.
- UMKM mengikuti tema desa.
- Data: JSONB `villages.theme` / `theme_draft` divalidasi `villageThemeSchema`; template = kode.
- Izin: `village.customize_theme` (admin desa, super admin).

## 4. Yang terdampak

`packages/validators` (skema + warna), `packages/ui` (atribut tema + CSS), `packages/db` (migrasi `0001_village_theme`),
`packages/auth` (action baru), `apps/api` (detail desa mengembalikan tema; endpoint editor nanti),
`apps/web` (layout desa + template), `apps/dashboard` (editor).

## 5. Langkah

- [x] Skema tema, helper kontras, preset, `parseVillageTheme` + test
- [x] `villageThemeAttributes()` + override variabel turunan HeroUI di `theme.css`
- [x] Kolom DB + migrasi, seed demo dengan 3 tema berbeda
- [x] Izin `village.customize_theme` + test; API detail desa mengirim tema
- [ ] Web: load 4 font `next/font`, layout `/villages/[village]` memakai tema, template `classic`
- [ ] API: endpoint get/patch draft/publish/reset tema + audit log + revalidate web
- [ ] Dashboard: editor brand kit (preset, color picker dengan pesan kontras, upload logo/banner, gaya sudut) + preview
- [ ] Uji visual semua preset di 360 px dan Android murah

## 6. Acceptance criteria

- Admin desa mengubah warna/logo, melihat preview, menekan "Terapkan", dan halaman publik desa berubah tanpa deploy.
- Warna yang tidak terbaca ditolak dengan pesan jelas.
- Tema rusak di database tidak pernah membuat halaman error (fallback default).
- Admin desa lain / pendamping / pemilik tidak bisa mengubah tema (403).

## 7. Risiko

- Upgrade HeroUI mengubah daftar variabel turunan → komentar di `theme.css`, cek visual saat upgrade.
- Waktu MVP sempit → template tambahan dan font di editor ditunda ke fase 2.

## 8. Validasi

Test unit (sudah), test API 403/200 untuk endpoint tema, uji visual per preset, Lighthouse mobile ≥ 80 di halaman desa.

## 9. Rollback

Kolom bersifat tambahan (nullable). Mematikan fitur = abaikan kolom; halaman memakai tema default.

## 10. Revision notes

| Tanggal    | Perubahan                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| 2026-11-01 | Plan dibuat dari diskusi; fondasi selesai. Atur urutan section dikeluarkan dari scope (tidak dipilih). |
