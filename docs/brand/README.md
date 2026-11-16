# Panduan Brand — Desanara

**Desanara** — _Ragam Karya, Cerita Nusantara._
Nama dipilih 2026-11-15, menggantikan Sudut Desa. Domain: `desanara.app` (aktif sejak 2026-11-17). Akun sosial: amankan `@desanara`.

## Cerita

_Desa_ + _Nusantara_. Platform yang menghubungkan karya, produk, dan cerita dari berbagai desa di Nusantara: mendukung
UMKM desa, melestarikan potensi lokal, dan membawa kekayaan alam serta budaya Indonesia ke pasar yang lebih luas.

**Makna logo**

| Elemen                   | Arti                                            |
| ------------------------ | ----------------------------------------------- |
| Bukit (oranye, di "d")   | Keragaman alam Nusantara                        |
| Sawah (garis di "d")     | Potensi dan hasil karya desa                    |
| Tunas (di "a")           | Pertumbuhan UMKM dan keberlanjutan              |
| Jalur (oranye, di bawah) | Penghubung produk desa ke pasar yang lebih luas |

## Logo

File master (SVG vektor murni) ada di [`desanara/`](desanara/), pratinjau di [`desanara/preview.webp`](desanara/preview.webp).

| Aset            | File master                                  | Pakai untuk                                |
| --------------- | -------------------------------------------- | ------------------------------------------ |
| Logo horizontal | `logo-horizontal.svg`                        | Header situs, dokumen, slide               |
| Logo + tagline  | `logo-tagline.svg`                           | Sampul, banner, gambar share               |
| Logo vertikal   | `logo-vertical.svg`                          | Poster, kemasan, layar pembuka             |
| Tanda "d"       | `mark.svg`                                   | Avatar sosial, watermark                   |
| Ikon aplikasi   | `app-icon.svg`                               | Favicon, ikon HP                           |
| Satu warna      | `*-green.svg` (hijau), `*-white.svg` (putih) | Cetak satu warna, di atas latar hijau/foto |

Salinan yang dipakai situs: `apps/web/public/brand/desanara-*.svg`, `apps/web/src/app/icon.svg`, `apple-icon.png`,
`apps/web/public/brand/og-default.png` (1200×630). Di kode pakai komponen `Logo` / `LogoMark`
(`apps/web/src/components/brand/logo.tsx`), jangan mengetik ulang wordmark dengan font.

**Siap untuk motion/animasi.** Setiap huruf dan elemen adalah satu `<path>` dengan id: `#letter-d`, `#letter-e`,
`#letter-s`, `#letter-a1`, `#letter-n`, `#letter-a2`, `#letter-r`, `#letter-a3`, `#hill`, `#sprout-leaf-left`,
`#sprout-stem`, `#sprout-leaf-right`, `#swoosh-path`, dan `#tagline-text`. Tanpa gambar tertempel, tanpa `transform`.
Warna diatur lewat kelas `.ink` (hijau) dan `.sun` (oranye) di `<style>` tiap file, jadi gampang diganti.

**Sumber:** di-trace dari brand guideline (gambar 1448×1086, 2026-11-15) dengan kecocokan bentuk ±99%. Huruf berbasis
**Nunito** (OFL); tagline memakai outline Nunito Italic SemiBold. Jika suatu saat logo digambar ulang oleh desainer,
pertahankan id di atas agar animasi yang sudah dibuat tetap jalan.

## Warna

| Nama           | Hex       | Peran                                                             |
| -------------- | --------- | ----------------------------------------------------------------- |
| Hijau Desanara | `#0F5A37` | Warna utama: logo, tombol utama, tautan (identitas & kepercayaan) |
| Daun           | `#5E8F3E` | Sekunder: ilustrasi, dekorasi (pertumbuhan & alam)                |
| Mentari        | `#E3A84F` | Aksen: sorotan, badge dengan teks gelap (energi & kreativitas)    |
| Bata           | `#C2612C` | Pelengkap: penekanan hemat (kehangatan & lokalitas)               |
| Krem           | `#F9F4E7` | Netral: latar bagian halaman (kebersihan & keseimbangan)          |
| Tanah (logo)   | `#CB8B41` | Oranye di dalam logo saja (bukit, tunas, jalur)                   |

Kontras: teks putih di hijau 8,3:1; teks gelap di Mentari 8,3:1. Daun dan Bata hanya untuk teks besar atau bentuk
non-teks. Tombol **Pesan via WhatsApp** tetap hijau WhatsApp `#0F7A3F`.

## Tipografi

Logo: Nunito (sudah jadi outline, tidak perlu font terpasang). Situs: Plus Jakarta Sans. Desa boleh memakai font
judulnya sendiri di halaman desa (ADR 0007).

## Aturan pakai

- **Ruang kosong** di sekeliling logo minimal setinggi huruf "e".
- **Ukuran minimum:** logo horizontal 96 px lebar; tanda "d" 16 px (di bawah 32 px sawahnya tidak terlihat, itu wajar).
- **Warna yang boleh:** berwarna di atas putih/krem, putih di atas hijau atau foto gelap, hijau satu warna di atas terang.
- **Jangan** mengubah proporsi, memutar, memberi bayangan/gradien, mengganti huruf, atau menaruh logo berwarna di atas
  foto ramai tanpa blok warna.
- Logo mitra (HIMASIF, SATU University, Pemerintah Desa) selalu ditampilkan **terpisah** dari logo Desanara, tidak digabung.

## Hak penggunaan

Nama, logo, dan identitas visual Desanara milik HIMA Sistem Informasi, SATU University, dan tidak termasuk dalam
lisensi MIT kode sumber. Logo HIMASIF, SATU University, dan Desa Baros milik pemiliknya masing-masing. Rinciannya ada
di bagian Lisensi pada [README](../../README.md#lisensi).

## Suara

Hangat, sederhana, dekat, seperti tetangga yang bercerita tentang hasil desanya. Pakai "kamu", hindari jargon teknis.
Contoh: _"Kenali desanya, pesan langsung ke pembuatnya."_
