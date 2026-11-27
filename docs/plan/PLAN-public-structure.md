# PLAN-public-structure — Beranda katalog, halaman Tentang, dan landing Gabung

|         |                                                                                                                                                            |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status  | Dalam pengerjaan. Beranda katalog, menu HP, dan halaman Tentang selesai.                                                                                   |
| Owner   | Tim HIMASIF (dikerjakan dengan agent AI)                                                                                                                   |
| Tanggal | 2026-11-21                                                                                                                                                 |
| Terkait | [PLAN-rebranding-v2](PLAN-rebranding-v2.md), [PLAN-registration-email](PLAN-registration-email.md) (PR 2), [PLAN-public-redesign](PLAN-public-redesign.md) |

## 1. Tujuan & kondisi saat ini

Masalah:

- Beranda `desanara.app` sekarang dibuka dengan hero bergaya splash ("Karya Desa, untuk Indonesia.") dan baru di
  bawahnya ada kategori, desa, dan produk. Untuk pembeli, isi katalog terdorong ke bawah layar.
- Pengenalan Desanara (apa ini, siapa pembuatnya, cara kerjanya) belum punya tempat yang jelas. Halaman `/tentang`
  masih pendek, dan di HP tidak ada menu untuk membukanya (link Jelajah dan Tentang di header hanya tampil di desktop).
- Ajakan untuk penjual ("Daftarkan UMKM") sementara mengarah ke bagian kecil di `/tentang`, karena `/gabung` belum ada.

Pola yang dipakai mengikuti marketplace pada umumnya (Tokopedia, Shopee, Etsy, Airbnb):

| Pola marketplace                      | Desanara                                          |
| ------------------------------------- | ------------------------------------------------- |
| Domain utama = katalog untuk pembeli  | `desanara.app` (beranda katalog)                  |
| Halaman "Tentang" di domain yang sama | `desanara.app/tentang` (pengenalan Desanara)      |
| Landing "Mulai Berjualan"             | `desanara.app/gabung` (ajakan + pendaftaran UMKM) |
| Seller Center di subdomain            | `dashboard.desanara.app` (sudah ada)              |

Tidak ada subdomain baru. Subdomain hanya untuk aplikasi yang terpisah (dashboard, API).

## 2. Scope & non-goals

Scope:

- **Beranda katalog** mengikuti panel beranda pada [mockup mobile](assets/cerita-umkm-mockup.png) dengan pencarian
  dan produk terbaru di bagian atas, diikuti kategori berikon dan banner dari papan brand.
- **Halaman `/tentang`** menjadi pengenalan Desanara, dibuka dengan hero splash yang sekarang ada di beranda.
- **Landing `/gabung`** untuk UMKM dan desa: manfaat, cara kerja, syarat, tanya jawab, lalu formulir. Formulirnya
  adalah PR 2 dari PLAN-registration-email; plan ini hanya mengatur isi dan tata letak halamannya.
- **Menu di HP** (tombol garis tiga seperti di mockup) agar Jelajah, Tentang, dan Daftarkan UMKM bisa dibuka dari HP.

Non-goals:

- Subdomain baru untuk pengenalan.
- Akun pembeli, keranjang, wishlist, atau rekomendasi personal.
- Pengaturan kampanye dari dashboard dan penagihan iklan. Materi kampanye menggunakan aset web.
- Perubahan API, skema database, atau izin.

## 3. Keputusan (produk, arsitektur, API)

### 3.1 Beranda katalog (`/`)

Urutan dari atas, di HP:

1. **Header** menampilkan menu garis tiga dan logo dengan kolom pencarian di bawahnya. Pilihan bahasa ada di halaman
   Pengaturan.
2. **Cerita dan produk** menempatkan deret Cerita UMKM di bawah pencarian saat ada cerita aktif. "Produk desa
   terbaru" mengikuti urutan terbaru dari katalog dan memakai grid 2 kolom di HP dengan "Lihat semua". Dua kartu
   pertama menampilkan foto, nama, asal desa, dan harga.
3. **Kategori berikon** memakai deret horizontal yang dapat digeser di HP dan grid enam kolom di layar lebar.
   Ikon diambil dari kolom `categories.icon` dan dipetakan ke ikon Lucide di web. Tab Produk membuka `/jelajah`.
4. **Sorotan** menempati slot banner di bawah kategori. Slot memuat promosi sponsor UMKM atau brand serta
   kampanye Desanara. Banner berbayar menampilkan nama sponsor. Pengunjung berpindah banner dengan geser atau
   tombol navigasi. Varian gambar penuh memuat judul, ajakan, dan nama sponsor (jika ada) di dalam
   gambar sesuai bahasa halaman. Satu kampanye tampil sebagai banner tunggal. Saat slot kosong, ilustrasi sawah mengajak
   pengunjung membuka direktori lewat "Jelajahi desa". Produksi dibuka dengan sorotan Desanara tentang kerajinan,
   kopi, dan direktori desa. Di development dan pratinjau katalog, sorotan produk dapat membuka halaman produknya.
5. **Desa**: maksimal enam kartu dan aksi **Lihat semua desa**. Direktori `/desa` (EN `/en/desa`)
   menampilkan 12 desa per halaman. Preview katalog memakai 27 desa contoh, termasuk Desa Baros, agar tiga
   halaman direktori bisa ditinjau.
6. **Ajakan penjual**: satu kartu kecil "Punya usaha di desa? Daftarkan UMKM" ke `/gabung`, seperti link "Mulai
   Berjualan" di marketplace. Tidak di atas, agar pembeli langsung melihat produk.

Hero splash, panduan pemesanan, dan informasi verifikasi tersedia di `/tentang`.

Desktop menampilkan empat produk terbaru sebelum kategori dan Sorotan. Banner cadangan menampilkan tagline
"Ragam Karya, Cerita Nusantara." dengan ilustrasi dari kanan.

Jelajah memakai kartu hasil berjajar foto dan informasi di HP. Pencarian Beranda dan Jelajah menampilkan saran
produk serta UMKM setelah pengguna mengetik dua karakter. Saran membuka halaman produk atau UMKM.
Pencarian teks bebas tetap membawa filter aktif. Tombol Filter membuka sheet yang berisi pilihan kabupaten/kota,
desa, kategori, dan urutan di mode daftar dan peta. Pengunjung bisa mencari opsi kabupaten/kota, desa, dan
kategori. Pilihan desa mengikuti wilayah yang dipilih. Detail produk di HP memakai judul ringkas di atas foto,
diikuti harga, asal desa, penjual,
dan tombol WhatsApp. Pengaturan jumlah dan catatan bisa dibuka di
bawah tombol. [Pratinjau Cerita UMKM](PLAN-cerita-umkm.md) tampil tepat di atas kartu produk Beranda.

Pratinjau menampilkan UMKM dan produk contoh di 27 desa di Kabupaten Bandung, Garut, dan Sumedang. Baros memakai
aset desa yang sudah tersedia. Bojongsoang dan Mekarwangi memakai lambang
Kabupaten Bandung sebagai identitas wilayah. Aset bersumber dari [portal Desa Mekarwangi](https://www.mekarwangi-ibun.desa.id/index.php/).

Mode Peta memakai ruang layar di bawah pencarian dan filter. Tombol Daftar tersedia di bagian
bawah peta dan membawa pencarian serta filter yang sama. Cubit dengan dua jari atau gulir di area peta untuk
mengubah tingkat zoom. Ketuk jumlah desa untuk memperbesar peta sampai pin terpecah ke grup yang lebih kecil
atau muncul sendiri. Angka pada penanda satu desa menghitung lokasi toko yang bisa ditampilkan. Desa yang
belum punya koordinat toko publik ditandai dengan ikon pin. Saat desa dipilih, pin toko memakai koordinat yang boleh
ditampilkan ke publik. Hasil desa muncul dalam sheet dari bawah dan menampilkan semua UMKM yang cocok dengan
filter, termasuk yang belum membagikan lokasi. Sheet bisa ditutup dengan menggeser pegangan ke bawah,
mengetuk area di luar sheet, atau menekan Escape. Tiga kartu atau lebih bisa digeser mendatar.
Nama toko tampil maksimal dua baris.
Peta publik memakai pusat desa dari API publik. Pratinjau memakai titik pusat desa dari dataset wilayah
dan dua titik toko fiktif untuk menguji perincian pin. Sumber titik toko publik dibahas di
[Rencana lokasi toko publik](PLAN-public-business-locations.md).

Halaman publik memakai skala judul dan teks pendukung yang sama, dengan judul lebih besar khusus banner
dan hero Tentang. Ukuran dan peran teks mengikuti [DESIGN.md](../../DESIGN.md#typography).

Instalasi dari layar utama, gestur di aplikasi terpasang, dan notifikasi uji dibahas di
[PLAN-public-pwa](PLAN-public-pwa.md).

### 3.2 Halaman Tentang (`/tentang`)

Susunan ini sudah digantikan oleh [PLAN-about-page](PLAN-about-page.md) (revamp 2026-11-27).

Pengenalan Desanara untuk publik, mitra, dan pengunjung yang penasaran:

1. Hero splash: logo vertikal, ilustrasi desa, "Karya Desa, untuk Indonesia.", tombol "Jelajahi produk" dan
   "Daftarkan UMKM" (komponen yang sudah dibuat, dipindah dari beranda).
2. Apa itu Desanara: teks yang sudah ada (`lead`, `how`, `pilot`).
3. Cara pesan (3 langkah, dipindah dari beranda).
4. Kenapa bisa dipercaya (3 poin, sudah ada).
5. Dibuat oleh HIMASIF dan SATU University (logo, sudah ada), desa percontohan.
6. Ajakan ke `/gabung`.

Bagian `#gabung` sementara di `/tentang` dihapus setelah `/gabung` ada.

### 3.3 Landing Gabung (`/gabung`)

Untuk pemilik UMKM dan perangkat desa. Bahasa sehari-hari, huruf besar, tombol jelas (pengguna lanjut usia):

1. Judul untuk penjual, misalnya "Bawa produk desamu ke lebih banyak pembeli", dengan ilustrasi desa.
2. Manfaat: gratis, pesanan langsung masuk ke WhatsApp tanpa potongan, toko online dengan nama desa, dibantu
   pendamping desa.
3. Cara kerja: daftar, diverifikasi admin desa, masukkan produk, terima pesanan.
4. Yang perlu disiapkan: nomor WhatsApp, email, nama usaha, foto produk.
5. Tanya jawab singkat.
6. Formulir pendaftaran (PR 2). `/gabung/[village]` memakai halaman yang sama dengan desa sudah terisi (dari QR desa).

Jika halaman ini selesai sebelum formulirnya, bagian formulir sementara berisi kontak admin desa dan Instagram
HIMASIF (isi yang sekarang ada di `/tentang#gabung`). Tidak ada tombol yang mengarah ke formulir yang belum ada.

### 3.4 Navigasi

- **HP** menampilkan navigasi bawah berisi Beranda, Produk, Desa, dan Pengaturan. Tombol menu di header membuka
  Tentang dan Daftarkan UMKM. Tombol pesan WhatsApp pada halaman produk ditempatkan setelah informasi penjual.
- **Desktop** menampilkan Beranda, Produk, Desa, Tentang, dan Pengaturan di header. Layar lebar juga menampilkan
  Daftarkan UMKM.
- **Pengaturan** di `/pengaturan` dan `/en/pengaturan` menampilkan pilihan bahasa untuk situs publik.
- **Footer**: tambah link "Daftarkan UMKM", kebijakan privasi, dan S&K (yang dua terakhir ikut PR 2).
- Link produk dari WhatsApp tetap langsung ke halaman produk; tidak ada splash yang memblokir.

## 4. Yang terdampak

- `apps/web`: `app/[locale]/page.tsx`, `app/[locale]/tentang/page.tsx`, `app/[locale]/gabung/` (baru),
  `components/site-header.tsx`, `components/site-footer.tsx`, komponen baru (banner beranda, grid kategori berikon,
  menu HP), `messages/id.json` dan `en.json`, sitemap.
- `DESIGN.md` (pola beranda, menu HP), `docs/product/user-flows.md` (alur calon penjual), `docs/CHANGELOG.md`.
- Tidak ada perubahan API, database, izin, atau env.

## 5. Langkah implementasi / milestone

1. **Beranda katalog + menu HP** (branch `feat/brand-montserrat` atau branch baru dari situ): banner, kategori
   berikon, produk, desa, kartu ajakan penjual; hero splash dipindah ke `/tentang`.
2. **`/tentang` diperbesar**: susunan di §3.2.
3. **`/gabung` landing**: isi §3.3 dengan bagian kontak sementara; semua tombol "Daftarkan UMKM" diarahkan ke sini.
4. **PR 2 PLAN-registration-email**: formulir, `/gabung/[village]`, kebijakan privasi, S&K, menu Verifikasi.

Langkah 1 sampai 3 hanya mengubah `apps/web` dan bisa selesai sebelum freeze 2026-11-28. Langkah 4 mengikuti
jadwal PLAN-registration-email.

## 6. Acceptance criteria

- Di HP lebar 360 px, pencarian dan produk terbaru tampil di awal beranda dan kategori bisa digeser.
- Setiap kategori punya ikon dan label teks; mengetuknya membuka `/jelajah` dengan filter kategori itu.
- `/tentang` dan `/gabung` bisa dibuka dari menu HP, header desktop, dan footer.
- Tidak ada tombol yang mengarah ke halaman atau formulir yang belum ada.
- Link lama `/tentang#gabung` tetap membuka halaman (tidak 404).
- Lighthouse (HP) beranda: performa tidak turun dibanding sekarang; aksesibilitas 95 ke atas.
- ID dan EN lengkap; `bun run check:all` lulus.

## 7. Risiko & mitigasi

| Risiko                                                       | Mitigasi                                                                               |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Pengunjung pertama tidak paham Desanara itu apa              | Produk langsung di bawah pencarian; tautan "Tentang" di menu                           |
| Ilustrasi banner berat di HP murah                           | WebP dengan ukuran sesuai layar dari `next/image`, dimuat saat mendekati layar         |
| Daftar desa kosong                                           | Tombol banner membuka katalog                                                          |
| Judul "Produk unggulan" tidak sesuai isinya (produk terbaru) | Pakai judul "Produk desa terbaru" sampai ada penanda unggulan                          |
| Waktu sebelum freeze sempit                                  | Langkah 1 sampai 3 kecil dan hanya di `apps/web`; PR 2 tetap mengikuti plannya sendiri |

## 8. Validasi & skenario test

- `bun run check:all`.
- Build production, cek di lebar 360, 390, 768, 1024, dan 1440 px: beranda, `/tentang`, `/gabung`, menu HP (buka,
  tutup, fokus keyboard, tombol Esc).
- Bahasa EN: teks tidak terpotong di grid kategori dan tombol.
- Uji manual di HP Android murah: waktu muat beranda, ukuran ketuk ikon kategori (minimal 44 px).

## 9. Rollback

Hanya perubahan tampilan di `apps/web`; revert commit mengembalikan beranda dan `/tentang` seperti sebelumnya.

## 10. Pertanyaan terbuka & catatan persetujuan

- 2026-11-21: arah disetujui ("samakan aja polanya seperti pada umumnya"): katalog di domain utama, pengenalan di
  `/tentang`, landing penjual di `/gabung`, tanpa subdomain baru.
- 2026-11-21: beranda katalog dikerjakan lebih dulu sesuai arahan pengguna. CTA penjual sementara membuka kontak
  di `/tentang#gabung`.
- 2026-11-22: layar katalog HP dan contoh laptop di papan brand menjadi acuan langsung untuk komposisi beranda.
- 2026-11-22: navigasi HP ditempatkan di bawah layar dan pilihan bahasa dipindahkan ke Pengaturan.

## 11. Revision notes

| Tanggal    | Perubahan                                                    |
| ---------- | ------------------------------------------------------------ |
| 2026-11-21 | Draft awal                                                   |
| 2026-11-22 | Banner ilustrasi dan susunan katalog mengikuti mockup brand. |
