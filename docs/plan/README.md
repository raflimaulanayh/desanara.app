# Plan

Plan adalah dokumen hidup yang disetujui **sebelum** implementasi dan menjadi bahan serah-terima selama pekerjaan berjalan.

## Kapan wajib

- Fitur besar atau yang menyentuh lebih dari satu app/package
- Perubahan skema database, auth/role, kontrak API, atau komponen bersama
- Sekumpulan fitur kecil yang dikirim bersama

## Aturan

- Nama file: `PLAN-<fitur>.md`, mulai dari [TEMPLATE.md](TEMPLATE.md).
- Persetujuan mencakup app, route, role, perilaku, dan dependensi yang tertulis. Perluasan besar = update plan + persetujuan ulang.
- Perbarui status, keputusan, dan hasil validasi selama pengerjaan. Jangan pakai folder ini untuk catatan acak.
- Agent AI: baca plan terkait sebelum mengubah kode, dan perbarui bagian "Revision notes" saat selesai.

## Daftar plan

| Plan                                                     | Status                                                                                   |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [PLAN-mvp-seminar.md](PLAN-mvp-seminar.md)               | Disetujui 2026-11-01 — fondasi selesai, fitur berjalan                                   |
| [PLAN-village-theming.md](PLAN-village-theming.md)       | Disetujui 2026-11-01 — fondasi selesai, UI menyusul                                      |
| [PLAN-public-redesign.md](PLAN-public-redesign.md)       | Disetujui 2026-11-03 — dalam pengerjaan                                                  |
| [PLAN-registration-email.md](PLAN-registration-email.md) | Disetujui 2026-11-20 — PR 1 selesai, PR 2 berikutnya                                     |
| [PLAN-rebranding-v2.md](PLAN-rebranding-v2.md)           | Disetujui 2026-11-21 — panduan brand & UX lintas generasi; font Montserrat sudah dipakai |
| [PLAN-public-structure.md](PLAN-public-structure.md)     | Beranda katalog, menu HP, dan Tentang selesai. Landing penjual menyusul.                 |
| [PLAN-cerita-umkm.md](PLAN-cerita-umkm.md)               | Draft. Mockup pembeli sudah disetujui.                                                   |

## Mockup eksplorasi

[Jelajah UMKM dengan mode Daftar dan Peta](assets/peta-umkm-mockup.png) menampilkan hasil pencarian yang sama dalam
dua tampilan. Di Peta, hasil dikelompokkan per desa dan pemilihan desa membuka daftar UMKM. Ilustrasi dan jumlah
UMKM di mockup adalah contoh. Cakupan lokasi publik mengikuti [aturan privasi](../architecture/security-privacy.md).

Pratinjau UI tersedia lewat `DESANARA_UI_PREVIEW=1 bun run --cwd apps/web dev`, lalu buka `/jelajah?view=map`.
Peta dasar memakai Leaflet dengan tile OpenStreetMap. Data UMKM masih contoh dan titik memakai pusat desa dari
[dataset wilayah](../../packages/db/data/regions/SOURCE.md). Pencarian dan filter dipakai bersama oleh Daftar dan Peta.
Ketuk titik desa untuk melihat UMKM yang cocok, membuka produk, atau melihat hasil desa di Daftar.

Pilot menargetkan Rp0 biaya layanan tambahan. Tile dimuat saat mode Peta dibuka, dengan atribusi di dalam peta.
Atur `NEXT_PUBLIC_MAP_TILE_URL` dan `NEXT_PUBLIC_MAP_ATTRIBUTION` bersama, lalu mulai ulang server lokal atau
bangun ulang aplikasi. URL memakai pola `{z}/{x}/{y}`. Pilih gaya tile dari penyedia atau host sendiri untuk
mengubah warna jalan, sungai, dan label. Warna titik di web memakai `--map-marker-color` dan `--map-marker-text`.
Pencarian UMKM tetap memakai katalog Desanara. Penggunaan tile publik mengikuti
[kebijakan OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/).
