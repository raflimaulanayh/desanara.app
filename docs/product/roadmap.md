# Roadmap

| Fase          | Waktu                   | Isi                                                                                                                                                                                                                              |
| ------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 — MVP       | Nov – 11 Des 2026       | Katalog multi-desa, dashboard per role, WA checkout, statistik, edukasi di desa pilot                                                                                                                                            |
| 2 — Perluasan | 2027 S1                 | Template tampilan desa tambahan + pilihan font, import Excel, subdomain/custom domain per desa, keranjang → pesan sekaligus ke WA, modul edukasi di platform, terjemahan EN otomatis, app mobile (Expo), onboarding desa mandiri |
| 3 — Transaksi | setelah ada badan hukum | Midtrans/Xendit (split payment), ongkir, kebijakan refund, Vercel Pro                                                                                                                                                            |

## Jadwal MVP

Rincian per modul dan urutannya: [PLAN-mvp-seminar](../plan/PLAN-mvp-seminar.md). Status fitur terkini: [fitur MVP](features-mvp.md).

| Minggu           | Developer                                                                                                                        | Tim lapangan                                  |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| 1 (1–7 Nov)      | ✅ Fondasi, auth + RBAC, situs publik + tema desa, redesign + URL Indonesia                                                      | Form data UMKM + consent; cek spek VPS kampus |
| 2 (8–14)         | ✅ Rencana deploy. Keputusan hosting (14 Nov): semua di Vercel + Supabase (ADR 0009)                                             | Foto produk, kumpulkan UMKM                   |
| 3 (15–21)        | 🚧 Rebranding Desanara ✅, deploy production ✅, API UMKM/produk/upload ✅, dashboard UMKM ✅; berikutnya halaman produk, lokasi | Materi edukasi                                |
| 4 (22–28)        | Pencarian, tombol WA, SEO/OG, statistik. **Feature freeze 28 Nov**                                                               | Finalisasi data                               |
| 5 (29 Nov–5 Des) | UAT dengan admin desa, uji di Android murah, perbaikan bug                                                                       | Gladi materi                                  |
| 6 (6–11 Des)     | Produksi, backup, gladi demo                                                                                                     | **Seminar 11 Des**                            |
