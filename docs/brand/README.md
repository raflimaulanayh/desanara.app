# Panduan Brand — Sudut Desa

**Sudut Desa** — _oleh-oleh khas desa, langsung dari pembuatnya._
Nama dipilih 2026-11-01. Domain rencana: `sudutdesa.id` (dan `sudutdesa.com`). Akun sosial: amankan `@sudutdesa`.

## Cerita

_Sudut_ = pojok. Setiap desa punya sudut yang belum banyak dikenal: pembuat keripik di ujung gang, perajin bambu di tepi
sawah. Sudut Desa membawa produk dari sudut-sudut itu ke pembeli, lengkap dengan cap desanya.

## Logo

| Aset                    | File                                                                                              | Pakai untuk                             |
| ----------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Tanda (mark)            | `apps/web/public/brand/sudut-desa-mark.svg` · `-mark-white.svg`                                   | Ikon, avatar sosial, watermark          |
| Logo horizontal         | `apps/web/public/brand/sudut-desa-logo.png` (latar transparan) · `-logo-white.png` (di atas ungu) | Header, dokumen, slide                  |
| Logo stempel            | `apps/web/public/brand/sudut-desa-stamp.png`                                                      | Kemasan, stiker, banner, footer         |
| Ikon aplikasi / favicon | `apps/web/src/app/icon.svg`, `apple-icon.png`                                                     | Browser, layar utama HP                 |
| Gambar berbagi (OG)     | `apps/web/public/brand/og-default.png` (1200×630)                                                 | Preview link di WhatsApp & media sosial |
| Komponen kode           | `LogoMark`, `Logo`, `LogoStamp` di `apps/web/src/components/brand/logo.tsx`                       | Di dalam situs                          |

**Tanda:** siku tebal + siku tipis = pojok bingkai cap karet (garis ganda), titik di pojok seberang = desa yang ditemukan di
sudutnya. Geometri murni (viewBox 48: siku `M5 33V5h28` tebal 7, siku dalam `M15.5 33V15.5H33` tebal 2.5, titik r 7 di 35,35).

**Wordmark:** "SUDUT DESA" — Barlow Condensed Bold, huruf kapital, tracking +0.02em.

## Warna

| Nama         | Hex       | Peran                                                |
| ------------ | --------- | ---------------------------------------------------- |
| Ungu Stempel | `#5b21b6` | Warna utama brand (logo, tombol utama)               |
| Navy Nota    | `#1f3a8a` | Warna sekunder; versi logo satu warna di atas kertas |
| Putih Kertas | `#ffffff` | Latar                                                |
| Tinta Hitam  | `#141a2b` | Teks                                                 |

## Tipografi

Barlow Condensed (judul, label, cap) + Barlow (teks bacaan). Keduanya gratis di Google Fonts.

## Aturan pakai

- **Ruang kosong** di sekeliling logo minimal setinggi titik pada tanda.
- **Ukuran minimum:** tanda 16 px; logo horizontal 96 px lebar.
- **Warna yang boleh:** ungu di atas putih, putih di atas ungu, navy di atas putih.
- **Jangan** memutar logo horizontal (hanya logo stempel yang boleh miring), mengubah proporsi, memberi bayangan/gradien,
  mengganti huruf, atau menaruh di atas foto ramai tanpa blok warna.
- Logo mitra (HIMASIF, SATU University, Pemerintah Desa) selalu ditampilkan **terpisah** dari logo Sudut Desa, tidak digabung.

## Suara

Hangat, sederhana, dekat — seperti tetangga yang menawarkan oleh-oleh. Pakai "kamu", hindari jargon teknis. Contoh:
_"Tulis notamu, kirim ke pembuatnya."_
