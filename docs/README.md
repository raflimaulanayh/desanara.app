# Dokumentasi Desanara

Gambaran singkat proyek ada di [README](../README.md). Halaman ini adalah indeks semua dokumen, dikelompokkan menurut pembacanya.

Bahasa: dokumen produk, panduan, dan CHANGELOG ditulis dalam **Bahasa Indonesia**. Dokumen arsitektur dan ADR
ditulis dalam **bahasa Inggris** agar konsisten dengan kode.

## Mulai dari sini

| Kamu adalah…                                        | Baca berurutan                                                                                                                                                                     |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tim HIMA non-teknis** (lapangan, humas, pengurus) | [Visi & masalah](product/vision.md), [Alur pengguna](product/user-flows.md), [Panduan dashboard](guides/dashboard-user-guide.md), [Fitur MVP](product/features-mvp.md)             |
| **Admin desa / pendamping**                         | [Panduan dashboard](guides/dashboard-user-guide.md)                                                                                                                                |
| **Developer baru**                                  | [Onboarding developer](guides/onboarding-dev.md), [Setup lokal](guides/local-setup.md), [`AGENTS.md`](../AGENTS.md), [Membuat fitur end-to-end](guides/feature-end-to-end.md)      |
| **Dosen / penguji**                                 | [README](../README.md), [Arsitektur](architecture/overview.md), [Keamanan & privasi](architecture/security-privacy.md), [ADR](adr/README.md), [Plan MVP](plan/PLAN-mvp-seminar.md) |

## Produk (Bahasa Indonesia)

| Dokumen                                                    | Isi                                                                      |
| ---------------------------------------------------------- | ------------------------------------------------------------------------ |
| [Visi & masalah](product/vision.md)                        | Masalah, solusi, persona, ukuran keberhasilan MVP                        |
| [Alur pengguna](product/user-flows.md)                     | Cara setiap peran memakai Desanara, status UMKM dan produk, data pribadi |
| [Fitur MVP](product/features-mvp.md)                       | Scope MVP dan status setiap fitur                                        |
| [Roadmap](product/roadmap.md)                              | Fase 1–3 dan jadwal mingguan sampai seminar                              |
| [Glosarium](product/glossary.md)                           | Istilah sehari-hari ↔ nama di kode                                       |
| [`PRODUCT.md`](../PRODUCT.md), [`DESIGN.md`](../DESIGN.md) | Konteks produk dan sistem visual (dibaca sebelum membuat tampilan)       |

## Panduan (Bahasa Indonesia)

| Dokumen                                                         | Untuk                                                                    |
| --------------------------------------------------------------- | ------------------------------------------------------------------------ |
| [Panduan dashboard](guides/dashboard-user-guide.md)             | Admin desa dan pendamping: mendaftarkan, memverifikasi, menayangkan UMKM |
| [Onboarding developer](guides/onboarding-dev.md)                | Minggu pertama developer baru                                            |
| [Setup lokal](guides/local-setup.md)                            | Menjalankan semua aplikasi di laptop, test integrasi, masalah umum       |
| [Data seed & demo](guides/seed-data.md)                         | Isi data contoh, akun contoh, cara menghapusnya                          |
| [Membuat fitur end-to-end](guides/feature-end-to-end.md)        | Urutan kerja dari izin, database, API, sampai layar                      |
| [Deploy](guides/deploy.md)                                      | Supabase, Vercel, domain, rilis, sebelum situs dibuka untuk umum         |
| [Checklist serah-terima pengurus](guides/handover-checklist.md) | Akun dan akses yang harus diserahkan saat pergantian pengurus HIMA       |

## Arsitektur (English)

| Document                                                                         | About                                                        |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| [Overview](architecture/overview.md)                                             | System diagram, API layers, data flow                        |
| [Structure](architecture/structure.md)                                           | Folders and naming                                           |
| [Multi-tenancy](architecture/multi-tenancy.md)                                   | Village as tenant, scoping rules                             |
| [Auth & RBAC](architecture/auth-rbac.md)                                         | Better Auth, `can()`, role matrix, business rules, hand-over |
| [Security & privacy](architecture/security-privacy.md)                           | Threat model, UU PDP, uploads, audit trail, known gaps       |
| [Data model](architecture/data-model.md)                                         | Tables, conventions, personal data on public pages           |
| [API conventions](architecture/api-conventions.md)                               | Envelope, errors, pagination, OpenAPI                        |
| [Storage](architecture/storage.md)                                               | Cloudflare R2 buckets, upload flow, limits                   |
| [Deployment](architecture/deployment.md)                                         | Vercel, Supabase connections, domains, backups               |
| [i18n](architecture/i18n.md), [Village theming](architecture/village-theming.md) | Two languages; per-village branding                          |

## Keputusan (ADR, English)

[ADR index](adr/README.md): why Turborepo + Bun, Hono, Supabase as plain Postgres, HeroUI v3, WhatsApp checkout,
Indonesian URLs, village theming, and the API on Vercel.

## Brand

[Panduan brand Desanara](brand/README.md): logo, warna, tipografi, aturan pakai, aset.

## Rencana & riwayat

- [Plan](plan/README.md): aturan dan [template](plan/TEMPLATE.md) rencana implementasi. Rencana utama: [PLAN-mvp-seminar](plan/PLAN-mvp-seminar.md).
- [CHANGELOG](CHANGELOG.md): setiap perubahan tercatat, terbaru di atas.

## Merawat dokumentasi

- Perubahan kontrak API atau skema database wajib memperbarui dokumen arsitektur yang terkait di PR yang sama.
- Fitur yang selesai: perbarui status di [Fitur MVP](product/features-mvp.md) dan, bila mengubah cara pakai,
  [Alur pengguna](product/user-flows.md) serta [Panduan dashboard](guides/dashboard-user-guide.md).
- Keputusan teknis besar: tulis ADR baru (salin ADR yang ada, pertahankan judul bagiannya).

## Kontak

Desanara dikembangkan oleh HIMA Sistem Informasi, SATU University. Instagram: [@himasif.su](https://www.instagram.com/himasif.su/).
