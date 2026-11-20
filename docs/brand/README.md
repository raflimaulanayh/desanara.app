# Panduan Brand — Desanara

**Desanara** — _Ragam Karya, Cerita Nusantara._
Nama dipilih 2026-11-15, menggantikan Sudut Desa. Domain: `desanara.app` (aktif sejak 2026-11-17). Akun sosial: amankan `@desanara`.

## Cerita

_Desa_ + _Nusantara_. Platform yang menghubungkan karya, produk, dan cerita dari berbagai desa di Nusantara: mendukung
UMKM desa, melestarikan potensi lokal, dan membawa kekayaan alam serta budaya Indonesia ke pasar yang lebih luas.

**Makna logo** (logo baru sejak 2026-11-20, dirancang tim HIMASIF dari sketsa tangan)

| Elemen                    | Arti                                                   |
| ------------------------- | ------------------------------------------------------ |
| Huruf "d" dari dua daun   | Desa sebagai akar: karya yang tumbuh dari alam sekitar |
| Daun tinggi               | Pertumbuhan UMKM desa                                  |
| Tunas kecil               | Usaha baru dan generasi muda desa                      |
| Gradasi hijau muda ke tua | Dari tunas yang segar sampai hasil yang matang         |

## Logo

File master (SVG vektor murni, tulisan sudah jadi outline) ada di [`desanara/`](desanara/), pratinjau di
[`desanara/preview.webp`](desanara/preview.webp).

| Aset            | File master                  | Pakai untuk                                        |
| --------------- | ---------------------------- | -------------------------------------------------- |
| Logo horizontal | `logo-horizontal.svg`        | Header situs dan dashboard, dokumen, slide         |
| Logo + tagline  | `logo-tagline.svg`           | Sampul, banner, gambar share                       |
| Logo vertikal   | `logo-vertical.svg`          | Poster, kemasan, layar pembuka                     |
| Tanda daun "d"  | `mark.svg`                   | Avatar sosial, watermark, ruang sempit             |
| Ikon aplikasi   | `app-icon.svg`               | Favicon, ikon HP (tanda putih di gradasi hijau)    |
| Putih / hitam   | `*-white.svg`, `*-black.svg` | Di atas latar hijau atau foto gelap; cetak 1 warna |

Salinan yang dipakai situs: `apps/web/public/brand/desanara-*.svg`, `apps/*/src/app/icon.svg`, `apple-icon.png`,
`apps/web/public/brand/og-default.png` (1200×630). Di kode pakai komponen `Logo` / `LogoMark`
(`apps/web/src/components/brand/logo.tsx`), jangan mengetik ulang wordmark dengan font.

**Siap untuk motion/animasi.** Setiap huruf dan elemen adalah satu `<path>` dengan id: `#leaf-tall`, `#leaf-small`,
`#letter-d`, `#letter-e`, `#letter-s`, `#letter-a1`, `#letter-n`, `#letter-a2`, `#letter-r`, `#letter-a3`, dan
`#tagline`. Tanpa gambar tertempel.

**Sumber:** ekspor Illustrator dari desainer HIMASIF (2026-11-20). Teks Montserrat di ekspor itu masih berupa teks,
jadi diubah menjadi outline (Montserrat, lisensi OFL) dengan posisi dan jarak huruf yang sama persis, lapisan ganda
dibuang, dan kanvas A4 dipotong pas ke logo. Semua file di `desanara/` dibuat ulang oleh
[`build-logo.py`](build-logo.py); cara menjalankannya ada di kepala file itu. Kalau desainer merevisi logo, perbarui
path di skrip lalu jalankan ulang, jangan mengedit SVG satu per satu.

## Warna

| Nama           | Hex       | Peran                                                         |
| -------------- | --------- | ------------------------------------------------------------- |
| Hijau Desanara | `#387B4C` | Warna utama: tombol utama, tautan, ujung gelap gradasi logo   |
| Tunas          | `#9DD853` | Sorotan dengan teks gelap (10,3:1); ujung terang gradasi logo |
| Daun           | `#6CAC4E` | Warna tulisan logo; dekorasi dan teks besar saja              |
| Mentari        | `#E3A84F` | Aksen kecil: badge promo, catatan draf (teks gelap)           |
| Bata           | `#C2612C` | Pelengkap: penekanan hemat                                    |
| Krem           | `#F9F4E7` | Netral: latar bagian halaman                                  |

Gradasi logo: `#9DD950` (atas) ke `#387B4C` (bawah), dengan bayangan hitam transparan di dalam daun. Kontras: teks
putih di Hijau Desanara 5,1:1 (lolos AA), di krem 4,7:1. Daun hanya untuk bentuk atau teks besar. Tombol **Pesan via
WhatsApp** tetap hijau WhatsApp `#0F7A3F`. Brand sheet desainer menyebut `#109C4F`; warna itu tidak dipakai untuk teks
karena teks putih di atasnya hanya 3,6:1.

## Tipografi

Logo: Montserrat Bold (wordmark) dan SemiBold (tagline), sudah jadi outline sehingga tidak perlu font terpasang.
Situs: Plus Jakarta Sans. Desa boleh memakai font judulnya sendiri di halaman desa (ADR 0007).

## Aturan pakai

- **Ruang kosong** di sekeliling logo minimal setinggi huruf "E" pada wordmark.
- **Ukuran minimum:** logo horizontal tinggi 32 px (di bawah itu pakai tanda daun saja); tanda daun 16 px.
- **Warna yang boleh:** berwarna di atas putih/krem, putih di atas hijau atau foto gelap, hitam untuk cetak satu warna.
- **Jangan** mengubah proporsi, memutar, memberi bayangan tambahan, mengganti huruf, atau menaruh logo berwarna di atas
  foto ramai tanpa blok warna.
- Logo mitra (HIMASIF, SATU University, Pemerintah Desa) selalu ditampilkan **terpisah** dari logo Desanara, tidak digabung.

## Hak penggunaan

Nama, logo, dan identitas visual Desanara milik HIMA Sistem Informasi, SATU University, dan tidak termasuk dalam
lisensi MIT kode sumber. Logo HIMASIF, SATU University, dan Desa Baros milik pemiliknya masing-masing. Rinciannya ada
di bagian Lisensi pada [README](../../README.md#lisensi).

## Suara

Hangat, sederhana, dekat, seperti tetangga yang bercerita tentang hasil desanya. Pakai "kamu", hindari jargon teknis.
Contoh: _"Kenali desanya, pesan langsung ke pembuatnya."_
