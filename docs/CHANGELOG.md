# CHANGELOG

Setiap perubahan dicatat di sini, **entri terbaru di atas**, dalam Bahasa Indonesia.
Wajib ada di commit/PR yang sama dengan perubahannya (dicek CI `changelog-check`).

Format:

```
## YYYY-MM-DD — Judul singkat perubahan
- **Area**: apps/api, packages/db
- **Jenis**: Added | Changed | Fixed | Removed | Security
- Apa yang berubah dan kenapa (1–3 kalimat). Catatan migrasi/env baru bila ada.
- Terkait: PLAN-xxx.md / PR #
```

---

## 2026-11-27 — Web development membaca katalog produksi

- **Area**: apps/web
- **Jenis**: Changed
- Web development memakai API produksi sebagai sumber katalog bawaan. `WEB_API_URL` menyediakan override
  untuk pengujian API lain. Event analitik hanya dikirim di luar development.

## 2026-11-27 — Pratinjau katalog dari repo utama

- **Area**: apps/web
- **Jenis**: Fixed
- Pratinjau lokal memakai direktori build terpisah agar bisa berjalan langsung dari repo yang sama.

## 2026-11-26 — Lokasi toko pada peta Jelajah

- **Area**: apps/web
- **Jenis**: Fixed
- Angka di pusat desa hilang saat desa dipilih. Pin toko memakai koordinat publik yang tersedia.
  UMKM yang belum membagikan lokasi tetap muncul di daftar. Pratinjau menyediakan dua titik fiktif di Baros.

## 2026-11-26 — Pin peta terpecah saat diperbesar

- **Area**: apps/web
- **Jenis**: Changed
- Grup desa langsung diperbesar ke tingkat yang memisahkan pin. Pin yang masih berimpit pada zoom maksimum
  dipisahkan di sekitar titiknya. Saat desa dipilih, penanda UMKM menyebar dari pusat desa dan panel menampilkan
  seluruh UMKM yang cocok dengan filter. Tiga kartu atau lebih bisa digeser mendatar, dan nama toko
  dibatasi dua baris. Ukuran tombol tutup panel disamakan dengan tombol panah slider. Angka pada pin pusat
  tetap terbaca saat pin di sekitarnya terbuka.

## 2026-11-26 — Filter Jelajah yang bisa dicari

- **Area**: apps/web
- **Jenis**: Added
- Kabupaten/kota, desa, dan kategori bisa dicari dari sheet di mode daftar dan peta. Pilihan desa
  mengikuti kabupaten/kota, dan teks pada tombol pilihan diposisikan di tengah secara vertikal.
- Peta pratinjau menampilkan UMKM contoh di 27 desa dengan koordinat pusat desa.
- Pin yang berdekatan bisa diketuk sebagai satu grup untuk memperbesar area. Zoom peta mendukung cubit,
  gulir mouse, dan trackpad.

## 2026-11-26 — Kontrol suara video Cerita UMKM

- **Area**: apps/web
- **Jenis**: Added
- Video contoh Anyaman Pak Ujang punya efek suara gesekan dan ketukan bambu. Tombol suara tersedia pada
  cerita video dalam kedua bahasa situs.

## 2026-11-26 — Video, teks, dan produk di Cerita UMKM

- **Area**: apps/web
- **Jenis**: Added
- Penampil Cerita mendukung foto, video vertikal, dan teks saja. Anyaman Pak Ujang punya video contoh sembilan
  detik dan tautan ke produk besek yang masih tayang. Indikator PO dan toko buka dicontohkan di preview katalog.

## 2026-11-26 — Placeholder foto produk lebih rapi

- **Area**: apps/web
- **Jenis**: Changed
- Produk tanpa foto memakai latar lembut dan ikon kategori di tengah dengan ukuran terbatas. Placeholder mengikuti
  bingkai foto di daftar, galeri, peta, dan saran pencarian.

## 2026-11-26 — Direktori desa mitra

- **Area**: apps/web
- **Jenis**: Added
- Beranda menampilkan maksimal enam desa dan tautan **Lihat semua desa** dengan padding hover seimbang.
  Direktori bilingual menampilkan 12 desa per halaman. Preview katalog berisi 27 desa, termasuk Desa Baros.

## 2026-11-26 — Skeleton mengikuti struktur halaman

- **Area**: apps/web, apps/dashboard, packages/ui
- **Jenis**: Changed
- Skeleton awal mengikuti grid, rasio galeri, baris daftar, dan susunan form yang tampil saat data siap.
  Beranda menampilkan bagian yang sudah siap sambil menunggu tiap bagian katalog. Jelajah memakai bentuk
  daftar atau peta sesuai mode yang dibuka.
- Deret Cerita UMKM mulai dari kiri setelah refresh. Skeleton berukuran sama mengisi deret sampai riwayat
  dilihat siap, sehingga kartu yang muncul pertama sudah sesuai urutan akhir.
- Avatar desa memakai garis tipis. Desa tanpa logo terdaftar dapat memakai lambang kabupaten yang sesuai
  dengan kode wilayahnya, termasuk Garut dan Sumedang.

## 2026-11-26 — Kondisi data di situs publik dan dashboard

- **Area**: apps/web, apps/dashboard, packages/ui
- **Jenis**: Changed
- Situs publik membedakan hasil kosong, gangguan data, halaman yang hilang, dan error tak terduga.
  Beranda dan profil tetap menampilkan bagian yang berhasil dimuat. Pencarian dan peta menyediakan pemulihan sesuai konteks.
- Dashboard menampilkan skeleton, pemulihan daftar dan detail, serta pesan sesi habis dan akses terbatas.
  Gangguan muat ulang atau paginasi mempertahankan data yang sudah tersedia selama akses masih berlaku.
- Kedua aplikasi memakai komponen status dan aset Nara yang sama untuk halaman dan kartu status.
- Indikator koneksi tampil di kedua aplikasi. PWA yang sudah terpasang dapat menampilkan layar offline saat
  navigasi gagal dan memuat ulang URL yang sama setelah tersambung. Terkait [PLAN-ui-states](plan/PLAN-ui-states.md).

## 2026-11-26 — Nara, maskot Desanara untuk halaman status

- **Area**: apps/web, packages/ui
- **Jenis**: Added
- Nara mengambil bentuk tunas padi dengan tas anyaman bambu. Tiga pose memberi konteks pada halaman
  tidak ditemukan, gagal memuat hasil Jelajah, dan katalog atau hasil pencarian kosong.
- Aset WebP transparan digunakan bersama pesan dan aksi dalam bahasa Indonesia dan Inggris.
  Terkait [panduan maskot](brand/mascot.md).

## 2026-11-26 — Jelajah menangani hasil kosong dan gagal muat

- **Area**: apps/web, packages/ui
- **Jenis**: Changed
- Jelajah menampilkan skeleton saat memuat. Katalog kosong, pencarian tanpa hasil, dan halaman di luar
  hasil pencarian punya pesan serta aksi yang sesuai dalam bahasa Indonesia dan Inggris.
- Saat API produk bermasalah, pengguna bisa mencoba lagi tanpa kehilangan pencarian atau filter.
  Dari mode peta, pengguna juga bisa kembali ke daftar. Terkait [PLAN-ui-states](plan/PLAN-ui-states.md).

## 2026-11-26 — Urutan dan kontrol Cerita UMKM di Beranda

- **Area**: apps/web
- **Jenis**: Changed
- Cerita yang belum dilihat tampil lebih dulu. Masing-masing kelompok diurutkan dari pembaruan terbaru,
  dan status dilihat tersimpan di browser.
- Cerita bisa digeser dengan jari atau diseret dengan mouse. Panah di desktop muncul saat penampil
  di-hover atau panah mendapat fokus keyboard. Nama UMKM di kartu dan judul banner di HP lebih ringkas.
- Label navigasi bawah tetap satu baris pada layar 320 px, termasuk label Pengaturan.

## 2026-11-25 — Cerita UMKM berjalan otomatis

- **Area**: apps/web
- **Jenis**: Changed
- Status maju setelah enam detik dan berlanjut ke UMKM berikutnya saat status terakhir satu usaha selesai.
  Pembeli bisa menjeda lewat tombol atau dengan menahan foto. Penampil ditutup saat semua status dalam deret selesai.

## 2026-11-24 — Satu UMKM bisa punya beberapa status

- **Area**: apps/web
- **Jenis**: Changed
- Geser atau gunakan tombol panah untuk berpindah status dari UMKM yang sama. Kartu menyisakan
  titik hijau sampai semua status dibuka.
- Prototipe memuat 17 status untuk 11 UMKM, termasuk tiga status masing-masing untuk Dapur Bu Euis,
  Kopi Baros, dan Anyaman Pak Ujang. Foto contoh memakai aset portrait beresolusi tinggi.

## 2026-11-24 — Label contoh di Cerita UMKM disederhanakan

- **Area**: apps/web
- **Jenis**: Changed
- Deret dan penampil Cerita UMKM menampilkan foto, nama UMKM, desa, dan keterangan tanpa label contoh.

## 2026-11-24 — Foto produk bisa dibuka layar penuh

- **Area**: apps/web
- **Jenis**: Added
- Galeri detail produk bisa digeser di HP, dipindah lewat tombol panah, dan dibuka layar penuh.
  Penampil mempertahankan proporsi foto dan menyediakan thumbnail untuk langsung memilih foto lain.
- Lingkaran tombol panah berukuran 32 px dengan area ketuk 44 px.

## 2026-11-24 — Cerita UMKM contoh tampil di Beranda publik

- **Area**: apps/web
- **Jenis**: Changed
- Sebelas cerita contoh bisa dibuka di Beranda produksi dalam bahasa Indonesia dan Inggris. Deret
  dan penampil cerita menandai kontennya sebagai contoh. Harga dan tautan produk contoh tampil di
  mode pratinjau katalog.

## 2026-11-24 — Desanara bisa dipasang dari layar utama

- **Area**: apps/web, packages/validators
- **Jenis**: Added
- Web publik bisa dipasang sebagai PWA dalam bahasa Indonesia atau Inggris. Di aplikasi terpasang,
  gestur cubit pada halaman dibatasi dan peta tetap bisa diperbesar.
- Pengaturan memuat pemasangan, izin, dan tes notifikasi sistem ke perangkat sendiri. Tes memakai Web
  Push dan membutuhkan tiga variabel `WEB_PUSH_*` di server web. Terkait [PLAN-public-pwa](plan/PLAN-public-pwa.md).

## 2026-11-24 — Label web publik lebih ringkas di HP

- **Area**: apps/web
- **Jenis**: Changed
- Tombol pindah dari Peta ke Daftar memakai label satu baris dalam bahasa Indonesia dan Inggris.
- Teks pencarian, filter, pemesanan, dan pengenalan Desanara memakai bahasa yang lebih sehari-hari.
- Tautan publik yang salah menampilkan halaman 404 dalam bahasa yang sedang dipakai.
- Alamat tanpa awalan selalu membuka bahasa Indonesia. Bahasa Inggris memakai `/en`, dan pilihan
  bahasa di Pengaturan langsung membuka alamat yang sesuai.

## 2026-11-24 — Saran pencarian dan desa contoh di katalog

- **Area**: apps/web
- **Jenis**: Added
- Pencarian menampilkan saran produk dan UMKM setelah dua karakter, dengan tautan ke halaman masing-masing.
  Pencarian teks bebas dan filter tetap tersedia.
- Pratinjau menampilkan tiga desa contoh dengan tautan ke UMKM dan produknya. Desa Baros tampil pertama
  dengan logo, foto sampul, Kopi Baros, dan besek bambu. Lima produk contoh mendapat foto galeri tambahan.
- Bojongsoang dan Mekarwangi memakai lambang Kabupaten Bandung dari portal Desa Mekarwangi.

## 2026-11-24 — Radius web publik diseragamkan

- **Area**: apps/web
- **Jenis**: Changed
- Kartu, galeri, panel, banner, dan sudut atas filter memakai token radius kartu. Kontrol kotak kecil
  dan thumbnail memakai radius 8 px. Tombol utama, pencarian, dan badge memakai bentuk pil.

## 2026-11-24 — Ukuran judul bagian Beranda diseragamkan

- **Area**: apps/web
- **Jenis**: Fixed
- Judul Produk Desa Terbaru mengikuti skala yang sama dengan judul Cerita UMKM dan Belanja per Kategori.

## 2026-11-24 — Scrollbar web publik disembunyikan

- **Area**: apps/web
- **Jenis**: Changed
- Scrollbar halaman dan area gulir disembunyikan. Gestur sentuh, trackpad, dan navigasi keyboard tetap tersedia.

## 2026-11-24 — Kartu foto portrait untuk Cerita UMKM

- **Area**: apps/web
- **Jenis**: Changed
- Foto memenuhi kartu portrait bersudut lembut. Nama UMKM tampil di atas gradasi di bagian bawah foto.
  Titik hijau dan tanda centang membedakan cerita baru dan cerita yang sudah dibuka.
- Radius kartu cerita dan kartu produk di penampil mengikuti token radius kartu katalog.
- Pratinjau memuat 11 cerita contoh untuk mencoba geser mendatar di HP dan desktop.

## 2026-11-23 — Peta Jelajah untuk katalog publik

- **Area**: apps/web
- **Jenis**: Fixed
- Mode Peta tersedia di produksi. Pin memakai pusat desa dari API wilayah, dan jumlah UMKM mengikuti
  hasil pencarian. Desa dengan kode kabupaten atau koordinat kosong tetap tersedia di daftar.

## 2026-11-23 — Pratinjau web katalog di Vercel

- **Area**: apps/web
- **Jenis**: Changed
- Vercel Preview dapat menampilkan katalog contoh, Cerita UMKM, peta, dan detail produk melalui
  `DESANARA_UI_PREVIEW=1`. Deployment Production selalu mengambil katalog dari API.

## 2026-11-23 — Cerita UMKM di atas Beranda

- **Area**: apps/web
- **Jenis**: Changed
- Deret Cerita UMKM tampil di bawah pencarian dengan foto bulat yang bisa digeser. Cincin putus-putus
  menandai cerita yang sudah dibuka selama halaman aktif.

## 2026-11-23 — Ajakan daftar UMKM di Beranda

- **Area**: apps/web
- **Jenis**: Changed
- Kartu ajakan UMKM memakai permukaan putih, ikon hijau lembut, dan tombol hijau utama HeroUI.

## 2026-11-23 — Skala tipografi halaman publik

- **Area**: apps/web
- **Jenis**: Changed
- Judul halaman, judul bagian, dan petunjuk pencarian memakai ukuran yang konsisten. Banner dan hero
  Tentang memakai skala tersendiri. Judul nama produk, desa, dan UMKM dapat membungkus di layar sempit.

## 2026-11-23 — Tipografi Jelajah lebih ringkas

- **Area**: apps/web
- **Jenis**: Changed
- Judul halaman Daftar dan petunjuk di kolom pencarian Jelajah memakai ukuran teks yang lebih ringkas.

## 2026-11-23 — Ringkasan hasil peta Jelajah lebih rapi

- **Area**: apps/web
- **Jenis**: Changed
- Jumlah produk lebih menonjol dan keterangan pin diringkas. Di HP, keterangan memakai baris sendiri saat
  tombol reset filter tampil.
- Jarak di bawah toolbar memberi ruang untuk indikator fokus pencarian.

## 2026-11-23 — Mode Peta memenuhi layar Jelajah

- **Area**: apps/web
- **Jenis**: Changed | Fixed
- Peta mengisi layar di bawah pencarian dan filter. Tombol Kembali ke daftar membawa pencarian dan filter
  aktif, termasuk saat hasil kosong. Detail desa muncul di bawah peta pada HP dan di samping pada desktop.
- Gesture dua jari di atas peta dan pin mengubah zoom Leaflet. Zoom halaman tetap tersedia di luar area peta.

## 2026-11-23 — Pin desa lebih ringkas di peta Jelajah

- **Area**: apps/web
- **Jenis**: Changed
- Pin menampilkan jumlah UMKM dengan target sentuh 44 px dan warna hijau saat dipilih. Nama desa lengkap
  dan jumlah pasti tetap tersedia di panel detail dan untuk pembaca layar.

## 2026-11-23 — Atribusi peta lebih ringkas

- **Area**: apps/web, apps/dashboard, packages/ui
- **Jenis**: Changed
- Kredit tile bawaan ditampilkan sebagai © OpenStreetMap dan tetap menaut ke halaman lisensi.

## 2026-11-23 — Bottom sheet filter dan fokus input

- **Area**: apps/web, packages/ui, docs
- **Jenis**: Changed | Fixed
- Wilayah, urutan, dan kategori di mode Peta dibuka dari bottom sheet HeroUI selebar layar. Tombol Filter
  menunjukkan jumlah pilihan aktif. Pencarian dan mode tampilan tetap terbawa saat filter diterapkan.
- Gaya fokus bersama menjadi cadangan untuk kontrol bawaan. Grup input HeroUI menampilkan satu indikator fokus
  mengikuti bentuk grup, termasuk pada pencarian dan jumlah pesanan.

## 2026-11-22 — Kontrol HeroUI yang lebih ringkas

- **Area**: apps/web, apps/dashboard, docs
- **Jenis**: Changed
- Filter Jelajah memakai HeroUI `Select` dan `Disclosure` dengan kontrol lebih ringkas. Pencarian memakai
  `InputGroup`. Pilihan filter tetap dikirim lewat URL dan dipakai bersama oleh Daftar serta Peta.
- Tombol peta dan galeri, drawer menu HP, modal Cerita UMKM, serta jumlah dan catatan pesanan memakai komponen
  HeroUI. Filter UMKM dan kontrol bagian bahasa Inggris di dashboard memakai `Tabs` dan `Button`.

## 2026-11-22 — Hover navigasi bawah

- **Area**: apps/web, docs
- **Jenis**: Fixed
- Sorotan hover mengikuti warna tab aktif dan berada di belakang ikon.

## 2026-11-22 — Peta dasar aktual di Jelajah

- **Area**: apps/web, apps/dashboard, packages/ui, docs, .env.example
- **Jenis**: Changed
- Peta Jelajah memakai Leaflet dan OpenStreetMap. Pembeli bisa menggeser serta memperbesar peta. Titik berisi
  jumlah UMKM contoh pada pusat desa. Web dan dashboard memakai konfigurasi tile dan atribusi yang sama.
- Bingkai awal peta memakai tingkat zoom yang lebih rapat agar titik desa tetap terpisah di layar HP sempit.

## 2026-11-22 — Pratinjau mode Peta di Jelajah

- **Area**: apps/web, docs
- **Jenis**: Added
- Mode Daftar dan Peta memakai pencarian serta filter yang sama dalam pratinjau lokal. Titik ilustrasi menampilkan
  jumlah UMKM per desa. Memilih titik membuka hasil desa dan tautan ke detail produk atau daftar yang sudah difilter.

## 2026-11-22 — Pratinjau Cerita UMKM dengan data mock

- **Area**: apps/web, docs, .env.example
- **Jenis**: Added | Changed
- Pratinjau beranda, Jelajah, Cerita UMKM, dan detail produk memakai data dan foto lokal. Cerita tampil di bawah
  dua kartu produk dan bisa dibuka layar penuh. Pembeli bisa berpindah cerita dan membuka detail produk terkait.
- Detail produk menempatkan tombol WhatsApp setelah asal desa dan penjual. Di pratinjau, tombol menampilkan
  contoh pesan. Jumlah dan catatan pesanan tersedia di bagian yang bisa dibuka.

## 2026-11-22 — Katalog mobile-first

- **Area**: apps/web, docs
- **Jenis**: Changed
- Beranda menempatkan produk terbaru di bawah pencarian dan memakai deret kategori yang bisa digeser di HP.
- Jelajah mempertahankan pencarian dan filter aktif. Detail produk menampilkan asal desa dan penjual sebelum
  pengaturan pesanan, dengan tombol WhatsApp di atas navigasi bawah.

## 2026-11-22 — Draft Cerita UMKM dan mockup Peta

- **Area**: docs
- **Jenis**: Added
- Draft [Cerita UMKM](plan/PLAN-cerita-umkm.md) merinci alur pembeli, penerbitan, dan izin. Mockup
  [mode Daftar dan Peta](plan/assets/peta-umkm-mockup.png) menggambarkan pengelompokan hasil per desa.
- Rencana pilot Peta dan Cerita UMKM menargetkan Rp0 biaya layanan tambahan, dengan sumber tile yang dapat
  dikonfigurasi dan penyimpanan foto kompatibel S3 agar keduanya bisa di-host sendiri.

## 2026-11-22 — Mockup Cerita UMKM

- **Area**: docs
- **Jenis**: Added
- Mockup alur pembeli dari beranda ke cerita dan produk tersedia untuk ditinjau di
  [aset rencana](plan/assets/cerita-umkm-mockup.png).

## 2026-11-22 — Menu kategori dan fokus pencarian

- **Area**: apps/web, docs
- **Jenis**: Changed
- Menu kategori memakai satu panel dengan ikon pada bidang warna lembut dan label di bawah ikon. Fokus pada
  kolom pencarian menggunakan garis di tepi pill.

## 2026-11-22 — Navigasi bawah dan pengaturan bahasa

- **Area**: apps/web, docs
- **Jenis**: Added
- Navigasi HP menyediakan tab Beranda, Produk, Desa, dan Pengaturan. Pilihan bahasa Indonesia dan Inggris ada di
  halaman Pengaturan. Tombol pesan WhatsApp berada tepat di atas navigasi pada halaman produk.
- Foto produk di beranda HP memakai rasio 4:3 agar harga lebih cepat terlihat.
- Enam kategori tampil dalam grid yang seimbang, dengan ikon dan ukuran tombol seragam.

## 2026-11-22 — Latar beranda dan footer lebih terang

- **Area**: apps/web, docs
- **Jenis**: Changed
- Latar beranda dan header memakai krem yang lebih dekat ke putih. Teks petunjuk pencarian dibuat lebih gelap,
  dan ilustrasi desktop memudar lebih awal agar judul lebih mudah dibaca.
- Footer situs publik memakai latar putih dengan garis pemisah tipis.

## 2026-11-22 — Beranda mengikuti mockup Desanara

- **Area**: apps/web, docs
- **Jenis**: Changed
- Beranda memakai ilustrasi sawah dengan susunan banner sesuai mockup HP dan laptop. Pencarian, ikon kategori, dan
  produk dua kolom dipadatkan agar produk desa terlihat lebih cepat di HP.
- Terkait: PLAN-rebranding-v2.md, PLAN-public-structure.md

## 2026-11-21 — Penyegaran visual beranda katalog Desanara

- **Area**: apps/web, docs
- **Jenis**: Changed
- Beranda menampilkan tagline resmi di bidang krem dengan foto desa terpisah. Kategori memakai warna palet Desanara
  dan kartu produk menempatkan asal desa, nama penjual, dan harga pada baris terpisah agar mudah dipindai.
- Terkait: PLAN-rebranding-v2.md

## 2026-11-21 — Beranda berfokus pada katalog pembeli

- **Area**: apps/web, docs
- **Jenis**: Changed
- Beranda menampilkan pencarian, banner desa, kategori berikon, produk terbaru, dan desa mitra. Menu HP membuka
  navigasi dan pilihan bahasa. Hero pengenalan dan cara pesan pindah ke halaman Tentang.
- Tautan Daftarkan UMKM membuka bagian kontak di `/tentang#gabung` selama halaman pendaftaran disiapkan.

## 2026-11-21 — Rencana struktur halaman publik

- **Area**: docs
- **Jenis**: Added
- Rencana baru mengikuti pola marketplace pada umumnya: beranda `desanara.app` fokus ke katalog untuk pembeli
  (pencarian, banner, kategori berikon, produk), pengenalan Desanara pindah ke `/tentang`, dan landing untuk penjual di
  `/gabung` (sekaligus tempat formulir pendaftaran PR 2). Tidak ada subdomain baru.
- Terkait: PLAN-public-structure.md

## 2026-11-21 — Beranda dibuka dengan hero bergaya splash screen

- **Area**: apps/web, docs
- **Jenis**: Changed
- Bagian atas beranda kini mengikuti layar pembuka di mockup papan brand. Di HP: logo vertikal, ilustrasi desa
  (matahari, bukit, sawah berundak, rumah, pohon), judul "Karya Desa, untuk Indonesia.", lalu tombol "Jelajahi
  Sekarang" dan "Daftarkan UMKM". Di layar lebar: teks di kiri, ilustrasi di kanan. Ilustrasinya SVG inline dengan
  warna brand, tanpa file tambahan, dengan satu animasi naik halus saat dibuka (mati bila pengguna memilih gerak
  dikurangi). Splash tidak memblokir halaman, jadi link produk dari WhatsApp tetap langsung ke produk.
- Tombol "Daftarkan UMKM" sementara mengarah ke bagian baru "Punya usaha di desa? Daftarkan UMKM-mu" di halaman Tentang
  (hubungi admin desa atau HIMASIF lewat Instagram), sampai pendaftaran mandiri `/gabung` selesai.
- Terkait: PLAN-rebranding-v2.md

## 2026-11-21 — Font Montserrat di semua aplikasi, panduan brand & UX v1.3

- **Area**: apps/web, apps/dashboard, apps/api, packages/ui, docs
- **Jenis**: Changed
- Font platform berganti dari Plus Jakarta Sans ke Montserrat, satu keluarga dengan wordmark logo. Dimuat lewat
  `next/font` sebagai font variabel (satu file untuk semua ketebalan). Dashboard sebelumnya belum memuat font sama sekali
  dan jatuh ke font sistem; sekarang ikut memuat Montserrat. Halaman login dokumentasi API juga ikut diganti. Font judul
  pilihan desa (ADR 0007) tetap berlaku di halaman desa.
- Semua hex brand mengikuti file SVG desainer. Token `sprout` (Tunas) berubah dari `#9dd853` ke `#9dd950`, ujung terang
  gradasi logo, dengan teks gelap 10,4:1. Label `#109C4F` di brand sheet tidak dipakai karena warna kotaknya dan gradasi
  logo sama-sama `#387b4c`.
- Panduan brand dan UX lintas generasi (`docs/plan/PLAN-rebranding-v2.md`, versi 1.3) disesuaikan dengan logo daun,
  palet dari SVG, dan Montserrat. Dua segmen pengguna (penjual dan pengurus desa, serta pembeli) dan prinsip "familiar
  dulu" dari versi 1.2 tetap.
- Terkait: PLAN-rebranding-v2.md

## 2026-11-20 — Logo baru Desanara dan warna utama mengikuti logo

- **Area**: apps/web, apps/dashboard, apps/api, packages/ui, packages/email, docs
- **Jenis**: Changed
- Logo diganti ke rancangan baru dari tim HIMASIF: huruf "d" dari dua daun dengan gradasi hijau, wordmark Montserrat.
  Teks di file desainer diubah jadi outline (posisi sama persis), lapisan ganda dibuang, dan kanvas dipotong. Semua
  varian (horizontal, dengan tagline, vertikal, tanda daun, putih, hitam, ikon aplikasi) dibuat ulang oleh
  `docs/brand/build-logo.py`. Favicon, ikon Apple, gambar share, dan tanda di halaman API ikut diganti.
- Warna utama platform berubah dari `#0f5a37` ke `#387b4c` (ujung gelap gradasi logo; teks putih 5,1:1), token `leaf`
  menjadi `#6cac4e`, dan token baru `sprout` `#9dd853` untuk sorotan dengan teks gelap. Oranye logo lama dihapus.
  Warna email dan pin peta ikut disesuaikan.
- Logo di header situs kini 44 px dan di dashboard 36 sampai 48 px, karena tanda daun lebih tinggi dari logo lama.

## 2026-11-20 — Akun lewat undangan, verifikasi email dengan kode, dan lupa kata sandi

- **Area**: apps/api, apps/dashboard, packages/auth, packages/db, packages/email, packages/validators, docs
- **Jenis**: Added, Security
- Pendaftaran terbuka Better Auth ditutup. Akun baru hanya dibuat dari **undangan**: tautan sekali pakai, berlaku 7 hari,
  bisa dibatalkan, dengan peran yang terkunci. Admin desa mengundang pendamping, pemilik dan asisten UMKM; pendamping
  mengundang pemilik UMKM yang ia daftarkan; pemilik mengundang asistennya. Tidak ada yang bisa memberi peran di atas
  perannya sendiri, dan satu orang maksimal 30 undangan per hari. Tombol undang ada di halaman UMKM (Akses UMKM) dan
  Pengaturan desa (Tim desa), dengan kirim lewat WhatsApp atau email.
- Email wajib terverifikasi sebelum bisa masuk, memakai **kode 6 angka** yang diketik di halaman yang sama (kode ada di
  judul email). Undangan yang dibuka dari email langsung terverifikasi. **Lupa kata sandi** juga memakai kode, lalu
  langsung masuk.
- Paket baru `packages/email` (Resend lewat fetch; tanpa key, email dicetak di terminal). Rate limit login dan kode
  disimpan di database (tabel baru `rate_limits`) supaya berlaku di semua instance Vercel.
- Izin baru `village.invite_members` dan `business.invite_members`. `business.invite_owner` untuk asisten UMKM kini
  hanya berlaku bila ia juga pendamping desa (asisten bantuan pemilik tidak bisa membuat pemilik baru).
- Email kode dikirim di latar belakang (`waitUntil` Vercel) dan kegagalannya hanya dicatat di log, jadi respons lupa
  kata sandi sama cepat dan sama isinya untuk email terdaftar maupun tidak. API production menolak start tanpa
  `RESEND_API_KEY`; preview Vercel boleh tanpa key (email dicetak di log).
- Undangan untuk orang yang sudah anggota menaikkan perannya; bila perannya sudah sama atau lebih tinggi, undangan
  ditolak (`ALREADY_MEMBER`) dan tetap bisa dipakai orang lain. Undangan ke UMKM atau desa yang sudah dihapus tidak bisa
  dipakai. Daftar undangan hanya terlihat oleh yang boleh mengundang.
- Perbaikan: pengecekan duplikat (`23505`) kini mengenali error yang dibungkus drizzle, sehingga percobaan ulang slug
  UMKM dan produk saat bentrok benar-benar berjalan.
- Migrasi `0008_accounts_email` (hanya menambah): tabel `rate_limits`, kolom `invitee_name` dan `invitee_email` di
  `invitations`. Env baru API: `DASHBOARD_URL`, `EMAIL_FROM`, `EMAIL_REPLY_TO` (opsional), `RESEND_API_KEY` (wajib di
  production).

## 2026-11-17 — sitemap.xml dan robots.txt untuk situs publik

- **Area**: apps/web, apps/api, apps/dashboard, packages/config, docs
- **Jenis**: Added, Security
- `desanara.app/sitemap.xml` berisi semua halaman publik (beranda, jelajah, tentang, desa, UMKM, produk) dengan alternatif
  bahasa `id`/`en` dan tanggal perubahan terakhir, dari endpoint baru `GET /v1/sitemap` (satu query per jenis halaman,
  aturan tampil sama dengan endpoint publik, cache CDN 1 jam). Sebelumnya `robots.txt` dan `sitemap.xml` 404.
- Perbaikan hreflang: sebelumnya semua halaman menunjuk beranda sebagai versi bahasa lainnya. Sekarang tiap halaman punya
  canonical sendiri dan alternatif `id`, `en`, `x-default` untuk halaman yang sama.
- `robots.txt` mengizinkan mesin pencari hanya di situs production (Vercel production, atau `NEXT_PUBLIC_WEB_URL`
  bukan localhost di luar Vercel); preview Vercel dan dashboard menolak semua crawler.
- Next.js 16.4.3 ke 16.4.5 (juga `eslint-config-next`) untuk advisory GHSA-mfr8-8qww-v76h (tingkat moderate). Kode kita
  tidak memakai `use cache`/`unstable_cache`, tetapi build Next menolak versi yang terdampak.

## 2026-11-17 — Pindah ke domain desanara.app

- **Area**: docs, .env.example, komentar di apps/web, apps/dashboard, packages/auth, docker
- **Jenis**: Changed
- Production sekarang di `desanara.app` (web), `dashboard.desanara.app`, `api.desanara.app`, dan foto di
  `cdn.desanara.app` (custom domain R2; URL `r2.dev` dimatikan). Alamat lama `*.vercel.app` dialihkan 308 ke alamat
  baru. DNS di Cloudflare akun HIMASIF; domain `desanara.app` terverifikasi di Resend untuk email.
- Env Vercel diperbarui: `API_URL`, `AUTH_BASE_URL`, `TRUSTED_ORIGINS`, `API_PROXY_TARGET`, `R2_PUBLIC_URL`, dan semua
  `NEXT_PUBLIC_*` URL. Env baru `RESEND_API_KEY` (API, _Sending access_ saja) untuk modul email berikutnya. CORS bucket
  media hanya `https://dashboard.desanara.app` dan `http://localhost:3001`. Semua pengguna perlu login ulang sekali.
- Repositori GitHub berganti nama menjadi `desanara.app`; README dan dokumen di `docs/` memakai alamat baru.

## 2026-11-16 — Lokasi UMKM di peta dan menu Pengaturan desa

- **Area**: apps/dashboard, apps/api, packages/db, packages/validators, packages/auth, docs, .env.example
- **Jenis**: Added | Fixed
- Form UMKM kini 4 langkah. Langkah baru **Lokasi** (hanya untuk tim desa): jalan atau patokan, RT/RW (tersimpan 3 digit), dan titik peta Leaflet + OpenStreetMap yang terbuka di sekitar desa. Pin bisa ditaruh dengan ketukan, digeser, atau diambil dari GPS HP (izin diminta saat tombol ditekan; akurasi rendah dan lokasi di luar Indonesia diberi tahu). Halaman UMKM menampilkan lokasi internal dengan tautan Google Maps. API publik tetap tidak pernah mengirim alamat, RT/RW, atau koordinat (diuji).
- Menu baru **Pengaturan desa** untuk admin desa: titik desa di peta (titik awal dari data wilayah resmi, bisa digeser dan dikembalikan) dan profil serta kontak kantor desa. Endpoint baru `GET`/`PATCH /v1/manage/villages/{id}`, hak akses baru `village.view` (admin dan pendamping desa), setiap perubahan tercatat di jejak audit.
- Performa: Leaflet (42 KB gzip) dimuat terpisah hanya saat peta tampil; halaman form UMKM bertambah sekitar 5 KB gzip, halaman lain tidak berubah. Alamat tile peta bisa diganti lewat `NEXT_PUBLIC_MAP_TILE_URL` dan `NEXT_PUBLIC_MAP_ATTRIBUTION`.
- **Migrasi `0007_business_location`** (hanya menambah kolom `rt`, `rw`, `lat`, `lng` di `businesses`).
- Perbaikan panduan dashboard: letak isian NIB dan alamat kini sesuai form.

## 2026-11-16 — Data wilayah Kepmendagri lengkap dan pencarian wilayah

- **Area**: packages/db, packages/validators, apps/api, docs
- **Jenis**: Added | Changed
- Seluruh 91.599 wilayah Kepmendagri 2025 (38 provinsi, 514 kabupaten/kota, 7.285 kecamatan, 83.762 desa/kelurahan) beserta titik tengahnya kini ada di database. Sumber: dataset terbuka cahyadsn/wilayah dan cahyadsn/wilayah_boundaries (MIT), disimpan di `packages/db/data/regions` beserta sumber, versi, dan lisensinya. Perintah baru `bun run db:regions:import` (aman diulang, dilewati bila versinya sama, wilayah tidak pernah dihapus melainkan ditandai tidak berlaku); `db:seed` menjalankannya otomatis.
- API publik baru: `GET /v1/regions/search` (setiap kata harus cocok, misalnya "baros arjasari"), `GET /v1/regions?parent=` (wilayah di bawahnya), dan `GET /v1/regions/{code}`, dengan cache satu hari di CDN.
- **Migrasi `0006_region_dataset`**: mengaktifkan `pg_trgm`, menambah kolom nama lengkap, titik tengah, versi sumber, dan tanda tidak berlaku di `regions`, titik tengah di `villages`, serta aturan satu tenant aktif per kode desa. Setelah migrasi, jalankan `bun run db:regions:import`.
- Desa Baros kini menunjuk kode desanya yang resmi (`32.04.16.2005`).

## 2026-11-16 — Halaman produk dan foto di dashboard, isian satuan dihapus

- **Area**: apps/dashboard, apps/api, apps/web, packages/db, packages/validators, docs
- **Jenis**: Added | Changed | Fixed
- Dashboard: daftar produk di halaman UMKM (foto sampul, harga, status, stok kosong), halaman **Tambah produk** dan halaman produk (`/products/[id]`) berisi syarat tayang, foto, data, dan hapus. Form: harga dengan titik ribuan (hanya angka), **Gratis**, **Sedang promo** dengan pratinjau persen potongan, stok tersedia, versi Inggris, draf otomatis di perangkat.
- Foto: sampai 10 per produk, dipilih langsung di form tambah produk lalu diunggah satu per satu setelah produk tersimpan, dengan progres, **Coba lagi**, peringatan saat menutup halaman, **Jadikan sampul**, geser kiri/kanan, dan hapus dengan konfirmasi. Logo UMKM bisa diunggah, diganti, dan dihapus dari halaman UMKM.
- Isian satuan dihapus (keputusan 2026-11-16): seperti judul di marketplace, ukuran ditulis di nama produk. API, validator, situs publik, dan pesan WhatsApp tidak lagi memakai `unit`; nama produk demo diperbarui. **Migrasi `0005_product_unit_into_name`** hanya memindahkan isi `unit` ke nama dan mengosongkan kolomnya (aman dijalankan sebelum merge); kolomnya dihapus di rilis berikutnya.
- Perbaikan: draf form yang ditulis tertunda setelah tombol simpan ditekan tidak lagi memunculkan "Ada isian yang belum tersimpan" (juga berlaku untuk form UMKM); draf yang isinya sama dengan data tersimpan dibuang. Menu UMKM tetap aktif di halaman produk.

## 2026-11-16 — Dokumentasi dirapikan untuk repositori publik

- **Area**: README.md, LICENSE, docs, .env.example
- **Jenis**: Added | Changed | Security
- Email dan kata sandi akun contoh dihapus dari README, panduan dashboard, dan panduan seed; panduan kini menyebut perannya saja dan merujuk ke kode seed serta `SEED_DEMO_PASSWORD`. URL bucket R2 yang persis diganti placeholder. Daftar celah keamanan diganti rencana penguatan yang umum.
- README diperdalam: latar belakang, peran, fitur per halaman, prinsip arsitektur, tabel data utama, teknologi beserta alasannya, variabel lingkungan, alur kontribusi, deploy, serta kontak HIMASIF (Instagram @himasif.su).
- Emoji status diganti teks (Selesai, Dikerjakan, Direncanakan, Yes/No di matriks hak akses), dan panah serta titik tengah diganti kalimat biasa.
- Kode sumber kini berlisensi MIT (`LICENSE`, hak cipta HIMA Sistem Informasi, SATU University). Nama dan logo Desanara, logo HIMASIF, SATU University, dan Desa Baros, serta foto contoh dikecualikan; rinciannya di bagian Lisensi README dan panduan brand.

## 2026-11-16 — README dan dokumentasi untuk dibagikan ke tim

- **Area**: README.md, AGENTS.md, docs
- **Jenis**: Added | Changed
- README ditulis ulang sebagai pintu masuk untuk tiga pembaca (tim non-teknis HIMA, developer baru, dosen/penguji): masalah, peran, cara kerja, status fitur, arsitektur, keamanan, setup, alur kerja tim, peta dokumentasi. `docs/README.md` kini dikelompokkan menurut pembaca.
- Dokumen baru: `docs/product/user-flows.md` (alur per peran, status UMKM/produk, data pribadi), `docs/guides/dashboard-user-guide.md` (panduan admin desa dan pendamping), `docs/architecture/security-privacy.md` (threat model, UU PDP, upload, audit, celah yang masih direncanakan).
- Fakta basi diperbaiki: API berjalan di Vercel (bukan VPS) di AGENTS.md dan diagram arsitektur, ADR 0009 berstatus Accepted, alur upload yang sebenarnya, rute dashboard, status fitur MVP dan progres roadmap, rencana undangan + pendaftaran mandiri di auth-rbac, kata sandi akun contoh di production, variabel R2 di setup lokal, istilah baru di glosarium.

## 2026-11-16 — Halaman UMKM di dashboard

- **Area**: apps/dashboard, docs
- **Jenis**: Added
- Menu **UMKM**: daftar dengan pencarian dan tab (Semua, Perlu dicek, Tayang, Draf, Ditolak), dibatasi API sesuai peran, plus tombol "Muat lagi".
- **Tambah/ubah UMKM** dalam 3 langkah pendek untuk HP (data usaha → kontak dan toko online → persetujuan pemilik). Validasi memakai skema bersama dengan pesan bahasa Indonesia, isian tersimpan otomatis di HP, dan saat mengubah data hanya kolom yang berubah yang dikirim. Langkah persetujuan berisi teks yang dibacakan ke pemilik (apa yang tampil, alamat tidak pernah tampil, persetujuan bisa ditarik).
- **Halaman detail**: checklist syarat tayang (sama dengan aturan API), tombol Tayangkan/Sembunyikan, Setujui/Tolak (alasan wajib) untuk admin desa, Turunkan (alasan wajib)/Pulihkan, dan Hapus, masing-masing hanya muncul bila `permissions` dari API mengizinkan. Alamat ditandai "internal".
- Kartu UMKM di beranda kini menuju halaman detailnya.

## 2026-11-16 — Kerangka dashboard: menu sesuai peran, beranda, dan sesi

- **Area**: apps/dashboard, apps/api, docs
- **Jenis**: Added
- Dashboard kini punya kerangka untuk semua halaman berikutnya: sidebar di desktop, bar atas dan tab bawah di HP, menu yang tampil sesuai peran (lewat `can()`), serta menu akun untuk keluar. Membuka dashboard tanpa sesi diarahkan ke `/login?next=…`, dan setelah masuk kembali ke halaman semula (hanya alamat dalam situs yang diterima).
- Beranda menyesuaikan peran: kartu desa dengan jumlah UMKM dan yang menunggu verifikasi (admin desa), "Semua desa" untuk super admin, dan daftar UMKM yang didampingi atau dimiliki.
- Fondasi untuk form: pesan error API dalam bahasa Indonesia sederhana (alasan 409 seperti `NO_PHOTO`, error per kolom dari 422, sesi habis, sinyal putus) dan draft form yang tersimpan otomatis di HP. Draft disimpan per pengguna dan dihapus saat keluar, karena HP di desa sering dipakai bergantian.
- `GET /v1/me` kini menyertakan `memberships` (nama desa dan UMKM tempat pengguna punya peran) dan `Cache-Control: no-store`.
- `apps/dashboard` kini punya `bun test`.

## 2026-11-16 — Halaman kredit foto contoh

- **Area**: apps/web
- **Jenis**: Added | Fixed
- Halaman baru `/tentang/kredit-foto` (tautan di footer) mencantumkan judul, pembuat, lisensi, dan sumber setiap foto contoh dari Wikimedia Commons, sesuai kewajiban atribusi CC BY/BY-SA. Datanya dibaca dari file `*.webp.json` saat build, jadi halaman sepenuhnya statis.
- Perbaikan: foto lampu (CC BY-SA 4.0) tidak punya nama pembuat; diisi `Valenzuela400` sesuai halaman Commons-nya. Test baru memastikan setiap foto berlisensi punya pembuat, sumber, dan lisensi yang dikenali.

## 2026-11-16 — Upload foto ke R2 dan slider foto produk

- **Area**: apps/api, apps/web, apps/dashboard, packages/validators, docs, .env.example
- **Jenis**: Added | Security
- Endpoint baru `/v1/manage/media` untuk semua jenis gambar: foto produk (maks. 10), logo UMKM, logo dan banner desa. Alurnya: minta URL upload (berlaku 5 menit, tipe dan ukuran file ikut ditandatangani sehingga R2 sendiri menolak file yang lebih besar), browser mengunggah langsung ke R2, lalu API mengecek file di R2 sebelum menyimpannya. File yang tidak lolos langsung dihapus. Urutan foto (sampul = foto pertama) lewat `PATCH /v1/manage/products/{id}/images`. Produk yang sedang tayang tidak bisa kehilangan foto terakhirnya.
- Dashboard: helper `uploadImage()` selalu meng-encode ulang foto (WebP/JPEG, maks. 1600 px) sehingga data EXIF termasuk **lokasi GPS** dari HP ikut terbuang (UU PDP).
- Web publik: halaman produk memakai slider foto (geser di HP, panah dan thumbnail di desktop, penanda "2/5"), tanpa library tambahan. `next/image` kini mengizinkan domain `NEXT_PUBLIC_MEDIA_URL`.
- API memakai `aws4fetch` karena di Vercel API berjalan di runtime Node.js (`Bun.S3Client` tidak tersedia). Env API: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`; tanpa itu endpoint upload menjawab 503.
- Script baru: `media:upload-seed` (32 foto demo sudah disalin ke R2) dan `media:clean-orphans` (menghapus file yang terunggah tapi tidak pernah disimpan, lebih dari 24 jam; default dry run).
- Setelah merge: isi `NEXT_PUBLIC_MEDIA_URL` (= URL `r2.dev`) di Vercel web **dan** dashboard, lalu redeploy.
- Terkait: docs/architecture/storage.md

## 2026-11-16 — API kelola produk, produk gratis, dan harga coret

- **Area**: apps/api, apps/web, packages/db, packages/validators, docs
- **Jenis**: Added | Fixed
- Endpoint baru (login wajib, tidak di-cache): `/v1/manage/businesses/{id}/products` (daftar, buat) dan `/v1/manage/products/{id}` (lihat, ubah, hapus soft, publish/unpublish). Slug dibuat otomatis dari nama; bila sudah dipakai, ditambah nama UMKM lalu angka. Kategori wajib. Publish ditolak bila belum ada foto (`NO_PHOTO`) atau kategori. Desa produk selalu diambil dari UMKM-nya. Setiap perubahan tercatat di `audit_logs`.
- Harga: `0` = **Gratis**, selain itu minimal Rp100 (mencegah salah ketik; teks seperti `"15000"` tidak lagi diterima). Kolom baru **harga coret** (`compareAtPrice`) untuk diskon dan promo gratis, harus lebih tinggi dari harga jual. Web publik menampilkan badge **Gratis** / **-X%** dan harga normal dicoret di kartu, halaman produk, panel pesan, dan nota WhatsApp (nota menyebut harga normal agar penjual menghormati promo). Dua produk demo diberi harga coret.
- **Migrasi `0004_product_compare_at_price`** (aditif): kolom `compare_at_price` dan dua check constraint (harga tidak negatif, harga coret > harga). Jalankan `bun run db:migrate`.
- Perbaikan: skema ubah produk lama menandai produk "stok habis" kembali tersedia di setiap edit (nilai bawaan `isAvailable: true`). Skema baru tidak punya nilai bawaan.
- `apps/web` kini punya `bun test` (test nota WhatsApp).

## 2026-11-16 — Alamat UMKM tidak lagi tampil di halaman publik

- **Area**: apps/api, apps/web, docs
- **Jenis**: Security
- Halaman UMKM publik dan `GET /v1/businesses/{slug}` tidak lagi menampilkan alamat UMKM. Lokasi publik berhenti di level desa (nama desa dan wilayahnya), seperti marketplace yang hanya menampilkan kota penjual. Alamat jalan dan RT/RW sering kali alamat rumah pemilik (UU PDP), jadi hanya dipakai di dashboard.

## 2026-11-15 — Keputusan: domain gratis selama development

- **Area**: docs
- **Jenis**: Changed
- Selama development aplikasi tetap di `*.vercel.app` dan foto di URL `r2.dev`; domain sendiri dibeli nanti. Langkah pindah domain dicatat di `docs/architecture/deployment.md`. Domain sebaiknya dibeli sebelum materi seminar (QR, brosur) dicetak.

## 2026-11-15 — Penyimpanan Cloudflare R2 disiapkan

- **Area**: docs, .env.example
- **Jenis**: Added | Security
- R2 diaktifkan di akun Cloudflare **HIMASIF** (bukan akun pribadi) dengan dua bucket di APAC: `desanara-media` (publik lewat URL `r2.dev` untuk sementara, CORS hanya untuk dashboard) dan `desanara-backups` (privat). Backup dipisah bucket karena akses publik R2 berlaku untuk seluruh bucket; dokumen lama yang menyebut "bucket/prefix" diperbaiki.
- Env: `R2_BUCKET=desanara-media`, `R2_ACCOUNT_ID`, `R2_PUBLIC_URL` (URL `r2.dev`). Kunci S3 dibuat lewat R2 API token yang dibatasi ke satu bucket. Pindah ke domain sendiri nanti tanpa migrasi data.
- Terkait: PLAN-mvp-seminar.md, docs/architecture/storage.md

## 2026-11-15 — API kelola UMKM untuk dashboard

- **Area**: apps/api, packages/db, packages/auth, packages/validators, .github, docs
- **Jenis**: Added | Fixed
- Endpoint baru `/v1/manage/businesses` (login wajib, tidak di-cache): daftar sesuai hak akses, buat UMKM (slug dibuat otomatis dari nama), ubah, verifikasi/tolak oleh admin desa (penolakan wajib beralasan, setelah diedit otomatis kembali menunggu), publish/unpublish, takedown/pulihkan, dan hapus (soft delete, khusus admin desa). Publish ditolak bila belum diverifikasi, belum ada persetujuan, tanpa nomor WA, atau sedang ditakedown. Setiap perubahan tercatat di `audit_logs`, termasuk penggantian nomor WA.
- **Migrasi `0003_business_management`** (hanya menambah kolom): bukti persetujuan UU PDP (`consent_method`, `consent_recorded_by`), alasan verifikasi (`verification_note`), dan takedown (`taken_down_at`, `taken_down_by`, `takedown_reason`). UMKM yang ditakedown otomatis hilang dari halaman publik. Jalankan `bun run db:migrate`.
- Action izin baru: `business.list_all`, `business.list`, `business.view`, `business.change_slug`, `business.delete`.
- Perbaikan: skema ubah UMKM lama mencabut persetujuan pemilik di setiap edit (nilai bawaan `consentGiven: false`). Skema baru tidak punya nilai bawaan; field kosong berarti dihapus, field tidak dikirim berarti tidak berubah.
- Test integrasi API memakai Postgres lokal lewat `TEST_DATABASE_URL` (ditolak bila bukan localhost); CI kini memigrasi database sebelum test.
- Terkait: PLAN-mvp-seminar.md

## 2026-11-15 — Halaman login bermerek untuk dokumentasi API

- **Area**: apps/api, docs
- **Jenis**: Changed | Security
- Dialog login bawaan browser (Basic Auth) diganti halaman `/docs/login` bergaya Desanara: logo, warna hijau/krem, tombol lihat kata sandi, pesan salah yang jelas. Setelah masuk, browser menyimpan cookie bertanda tangan (HttpOnly, Secure, SameSite=Strict) selama 8 jam; `/docs/logout` untuk keluar; mengganti `DOCS_PASSWORD` mengeluarkan semua sesi. Percobaan salah diberi jeda singkat.
- Catatan "lupa kata sandi" dihapus agar tidak menyebut tempat hosting, dan seluruh teks halaman login memakai bahasa Inggris.
- Terkait: ADR 0009

## 2026-11-15 — Dokumentasi API dikunci di production

- **Area**: apps/api, docs
- **Jenis**: Security
- `/docs` dan `/openapi.json` sekarang memakai HTTP Basic Auth bila `DOCS_PASSWORD` diisi, dan tidak tersedia sama sekali di production tanpa `DOCS_PASSWORD`. Lokal tetap terbuka. Env baru: `DOCS_USERNAME` (bawaan `desanara`), `DOCS_PASSWORD` (min. 12 karakter).
- Perbaikan: penangan error API sempat membuang header `WWW-Authenticate`, sehingga browser menampilkan JSON `BAD_REQUEST` alih-alih kotak login. Header dari middleware kini dipertahankan dan 401 berkode `UNAUTHENTICATED`.
- Perbaikan kedua: halaman `/docs` menanam dokumen OpenAPI langsung di halaman, karena Scalar mengambil `/openapi.json` tanpa membawa login sehingga browser terus meminta login ulang.
- Terkait: ADR 0009

## 2026-11-15 — API siap di-deploy ke Vercel, database Supabase

- **Area**: apps/api, apps/dashboard, apps/web, packages/db (seed), packages/config, docs
- **Jenis**: Added | Changed
- API dibundel Bun menjadi satu Vercel Function (Node 22, Build Output API, region Singapura) lewat `bun run build:vercel`; entry lokal (Bun) dan Vercel memakai `src/bootstrap.ts` yang sama. Endpoint baru `/health/ready` (ping database) dipanggil cron harian agar Supabase gratis tidak dijeda.
- Dashboard meneruskan `/api/auth/*` dan `/v1/*` ke API bila `API_PROXY_TARGET` diisi, sehingga cookie login tetap milik domain dashboard di `*.vercel.app`. Env baru: `DB_POOL_MAX`, `AUTH_BASE_URL`, `API_PROXY_TARGET`, `SEED_DEMO_PASSWORD` (lihat `.env.example`).
- Seed menolak database non-lokal tanpa `SEED_DEMO_PASSWORD`, karena kata sandi demo bawaan tertulis di repo publik. ADR 0009 diterima; panduan deploy dan setup lokal diperbarui.
- Live 2026-11-15: https://desanara-web.vercel.app, https://desanara-dashboard.vercel.app, https://desanara-api.vercel.app (Supabase `ap-southeast-1`, sudah dimigrasi dan di-seed).
- Terkait: PLAN-deploy-vercel-supabase.md, ADR 0009

## 2026-11-15 — Rebranding: Sudut Desa menjadi Desanara

- **Area**: apps/web, apps/dashboard, apps/api, packages/ui, packages/i18n, packages/db (seed), docs
- **Jenis**: Changed
- Nama platform menjadi **Desanara** ("Ragam Karya, Cerita Nusantara."). Logo baru berupa SVG vektor murni (satu path per huruf/elemen dengan id, siap animasi) di `docs/brand/desanara/`, dipasang sebagai logo header/footer, favicon, ikon aplikasi, dan gambar share. Aset Sudut Desa dihapus.
- Warna utama platform berubah dari ungu `#5b21b6` ke hijau `#0f5a37`, latar krem `#f9f4e7`, plus token sekunder `leaf`, `sun`, `clay`. Tombol WhatsApp tetap hijau WhatsApp; halaman desa tetap memakai warna desanya.
- Akun demo pindah ke `@demo.desanara.test`: jalankan `bun run db:seed` agar akun lama diganti. Tata letak dari mockup brand guideline belum dikerjakan (fase 2, perlu diskusi).
- Terkait: PLAN-rebranding.md

## 2026-11-14 — Rencana deploy ke Vercel dan Supabase

- **Area**: docs (plan, ADR)
- **Jenis**: Added
- Draft rencana menaruh web, dashboard, dan API di Vercel dengan database Supabase (dev + production, Singapura), karena VPS kampus belum siap sampai batas 14 November. ADR 0009 (Proposed) menjadikan VPS sebagai cadangan. Belum ada perubahan kode atau deploy.
- Terkait: PLAN-deploy-vercel-supabase.md, ADR 0009

## 2026-11-03 — Foto contoh produk dan perbaikan logo desa yang rusak

- **Area**: apps/web, packages/db (seed), docs
- **Jenis**: Added | Fixed
- Fix: `NEXT_PUBLIC_MEDIA_URL` yang dikosongkan di `.env` membuat URL media menjadi `/seed/...` (404), sehingga logo Desa Baros rusak. `mediaUrl()` sekarang memakai `||` agar string kosong jatuh ke `/media`.
- Seed: 32 produk contoh kini punya foto asli (stok Wikimedia Commons, 800 px WebP) di `apps/web/public/media/seed/products/`, dengan sumber + lisensi di file `.json` dan `CREDITS.md`. Produk tanpa foto tetap memakai ubin kategori. Jalankan `bun run db:seed` untuk mengisi `product_images`. Sebelum rilis publik, foto ini ikut hilang lewat `db:seed:reset` atau perlu halaman kredit bila dipertahankan.
- Terkait: PLAN-public-redesign.md

## 2026-11-03 — Perbaikan: pesan kosong beranda hilang setelah redesign

- **Area**: apps/web (messages)
- **Jenis**: Fixed
- Kunci `home.villagesEmpty` dan `home.latestEmpty` ikut terhapus saat pesan beranda ditulis ulang, sehingga muncul `MISSING_MESSAGE` ketika daftar desa/produk kosong. Dikembalikan di ID dan EN.
- Terkait: PLAN-public-redesign.md

## 2026-11-03 — Redesign halaman publik: gaya e-commerce ramah dengan desa sebagai pembeda

- **Area**: apps/web, packages/ui, docs (DESIGN.md, PRODUCT.md, guides)
- **Jenis**: Changed | Removed
- Konsep "Buku Nota & Stempel" diganti tampilan marketplace yang ramah: header dengan pencarian, grid kartu produk (foto atau ubin kategori berwarna desa), halaman desa bergaya destinasi (sampul, lambang, lencana "Diverifikasi desa"), halaman produk dengan tombol **Pesan via WhatsApp** yang menempel di bawah layar HP, dan kartu "Dari desa …". Font platform Plus Jakarta Sans; token warna baru di `theme.css`; tema per desa (ADR 0007) tetap berlaku.
- Komponen nota/stempel/kop/seal dihapus; komponen baru: `product-card`, `village-card`, `village-logo`, `order-panel`, `open-status` (badge), `verified-badge`. Label "data demo" dihapus dari UI (`is_seed` tetap di database); langkah `db:seed:reset` sebelum rilis publik ditambahkan di `docs/guides/deploy.md`. Foto contoh produk tidak dibuat: produk tanpa foto memakai ubin kategori.
- Terkait: PLAN-public-redesign.md

## 2026-11-03 — URL publik berbahasa Indonesia tanpa awalan `/id`

- **Area**: apps/web, docs/adr
- **Jenis**: Changed
- Rute publik dipindah sesuai ADR 0008: `/jelajah`, `/desa/[desa]`, `/desa/[desa]/[umkm]`, `/produk/[produk]`, `/tentang`. Bahasa Indonesia tanpa awalan, Inggris di bawah `/en`. URL lama (`/id/...`, `/explore`, `/villages/...`, dst.) di-redirect permanen. ADR 0006 menjadi Superseded, plan redesign berstatus Approved.
- Terkait: PLAN-public-redesign.md, ADR 0008

## 2026-11-03 — Plan redesign halaman publik + URL berbahasa Indonesia

- **Area**: docs/plan, docs/adr
- **Jenis**: Added
- Plan `PLAN-public-redesign.md` (draft): tampilan publik diganti dari konsep nota/stempel menjadi gaya e-commerce yang ramah dengan desa sebagai pembeda, label demo dihapus dari UI (`is_seed` tetap), dan foto contoh ditambahkan. ADR 0008 (proposed) mengganti URL publik menjadi bahasa Indonesia tanpa awalan `/id` (`/desa/baros`, `/produk/...`, `/jelajah`) dengan redirect dari URL lama.
- Terkait: PLAN-public-redesign.md, ADR 0008

## 2026-11-01 — Brand baru: Sudut Desa

- **Area**: seluruh repo (`@repo/i18n` `BRAND_NAME`, pesan ID/EN, apps/web, apps/dashboard, apps/api, docs, PRODUCT.md, DESIGN.md)
- **Jenis**: Changed / Added
- Nama platform diganti dari placeholder "UMKM Desa" menjadi **Sudut Desa** (domain rencana `sudutdesa.id`). Email akun demo
  kini `*@demo.sudutdesa.test` — **jalankan `bun run db:seed`** untuk membuat ulang akun demo.
- Identitas visual pertama: tanda "sudut" (siku bingkai cap + titik desa), wordmark Barlow Condensed, logo stempel,
  favicon & ikon aplikasi (web + dashboard), gambar OG default 1200×630, dan aset PNG/SVG di `apps/web/public/brand/`.
- Panduan brand: `docs/brand/README.md`.

## 2026-11-01 — Logo resmi HIMASIF, SATU University, dan Desa Baros

- **Area**: apps/web (public/brand, public/media, komponen `BrandMark`, `VillageSeal`), docs, PRODUCT.md, DESIGN.md
- **Jenis**: Changed
- Slot "logo menyusul" diganti logo resmi HIMASIF dan SATU University (versi putih/mono dari folder `copyright` repo Desa
  Baros), dicetak dalam tinta navy nota lewat CSS mask di footer dan halaman Tentang.
- Cap Desa Baros kini memakai lambang resmi Pemerintah Desa Baros (perisai + pita motto) menggantikan logo KIM.
- Tinta logo di dalam cap desa kini mengikuti kecerahan (bagian gelap tebal, putih tidak tercetak), sehingga detail
  lambang tetap terbaca dalam satu warna tinta desa.

## 2026-11-01 — Halaman publik "Buku Nota & Stempel" + jam buka UMKM

- **Area**: apps/web, apps/api, packages/validators, packages/ui, packages/db, packages/i18n, docs, PRODUCT.md
- **Jenis**: Added / Changed
- Situs publik dibangun dengan arah desain **Buku Nota & Stempel** (dipilih lewat skill impeccable): cap desa bundar,
  stempel karet untuk status, daftar produk sebagai baris nota, tinta platform ungu dan tinta tiap desa sesuai temanya.
  Halaman: beranda, jelajah (cari + filter kabupaten/kategori + urutan + paginasi, tetap jalan tanpa JavaScript),
  desa (bertema), UMKM (kop, jam buka, chat WA, marketplace), produk (nota pesanan → WhatsApp dengan animasi cap
  "TERKIRIM"), tentang, 404. Semua teks ID/EN.
- API publik baru: `GET /v1/products` (cari), `GET /v1/products/:slug`, `GET /v1/categories`, `GET /v1/businesses/:slug`,
  `GET /v1/villages/:slug/businesses`, `GET /v1/regions/regencies`, `POST /v1/events` (view & klik WA). Aturan visibilitas
  publik terpusat di `apps/api/src/lib/visibility.ts`.
- Status buka/tutup: jadwal mingguan + "tutup sementara", dihitung otomatis di browser (`computeOpenStatus`, + test).
  Migrasi `0002_opening_hours` (kolom `opening_hours`, `closed_until`, `closed_note`, `villages.timezone`).
  **Jalankan `bun run db:migrate` lalu `bun run db:seed`.**
- Desa demo pertama kini **Desa Baros** (desa pilot asli) dengan logo KIM dan foto wisatanya; UMKM/produknya tetap demo.
  Akun demo berganti ke `admin.baros@…` dan `pendamping.baros@…`.
- Daftar font tema desa diganti: barlow-condensed (default), bitter, nunito, poppins. Konstanta `BRAND_NAME` di
  `@repo/i18n` (nama brand masih placeholder). Env baru: `NEXT_PUBLIC_MEDIA_URL`.
- `PRODUCT.md` ditambahkan (konteks produk untuk skill desain).
- Perbaikan hasil review desain: label DATA DEMO di beranda dan halaman desa demo; slot logo HIMA SI & SATU University
  (kosong, menunggu aset resmi); status buka/tutup dirender dari server (terlihat sebelum JavaScript termuat); label kecil
  di atas judul dihapus; bagian "Kenapa pesan di sini" dipindah menjadi cap di kaki "Nota hari ini"; nota pesanan naik ke
  atas di HP (foto kosong jadi strip label); tombol pesan untuk barang kosong benar-benar nonaktif; logo desa dicetak
  satu warna tinta di dalam cap; tinta Desa Baros diganti teal `#0e7490`.
- `DESIGN.md` + `.impeccable/design.json`: sistem desain "Buku Nota & Stempel" (token warna, tipografi, aturan, komponen)
  dicatat dari hasil build; jadi acuan untuk halaman baru (dashboard, editor tema, dll).
- **Desa Baros kini disimpan sebagai desa asli** (`is_seed = false`), tidak terhapus oleh `db:seed:reset`; hanya UMKM
  dan produknya yang demo.
- Terkait: [PLAN-mvp-seminar.md](plan/PLAN-mvp-seminar.md), [ADR 0007](adr/0007-village-theming.md)

## 2026-11-01 — Aturan commit (Conventional Commits)

- **Area**: root (`commitlint.config.mjs`, `.husky/commit-msg`), AGENTS.md
- **Jenis**: Added
- Pesan commit wajib format `<type>(<scope>): <subject>` (feat, fix, chore, docs, refactor, test, …) dan dicek otomatis oleh
  commitlint saat commit. Nama branch mengikuti `<type>/<deskripsi>`. Aturan lengkap di bagian "Git" `AGENTS.md`.

## 2026-11-01 — Fondasi tampilan custom per desa (tema)

- **Area**: packages/validators, packages/ui, packages/db, packages/auth, apps/api, docs
- **Jenis**: Added
- Desa bisa punya branding sendiri: warna utama (wajib kontras ≥ 3:1 di latar putih), font dan gaya sudut dari daftar
  pilihan, serta template tampilan (sekarang `classic`). Tanpa CSS/HTML bebas demi keamanan dan konsistensi (ADR 0007).
- `villageThemeSchema`, 6 preset palet, `parseVillageTheme()` (tema rusak otomatis kembali ke default per field),
  `villageThemeAttributes()` + override variabel turunan HeroUI di `theme.css` agar hover/soft/focus ikut warna desa.
- Migrasi `0001_village_theme`: kolom `villages.theme`, `theme_draft`, `theme_published_at` (nullable, aman untuk data lama).
  **Jalankan `bun run db:migrate`.** Seed demo memberi tema berbeda untuk tiap desa.
- Izin baru `village.customize_theme` (admin desa, super admin) + test. `GET /v1/villages/:slug` kini mengirim `theme`.
- Editor tema di dashboard dan template di halaman desa menyusul.
- Terkait: [PLAN-village-theming.md](plan/PLAN-village-theming.md), [ADR 0007](adr/0007-village-theming.md)

## 2026-11-01 — Fondasi monorepo & dokumentasi

- **Area**: seluruh repo (`apps/*`, `packages/*`, `docs/`, `.github/`, `.agents/`, `docker/`)
- **Jenis**: Added
- Monorepo Turborepo + Bun berisi `apps/web` (Next.js 16, next-intl `/id` `/en`, HeroUI v3, Tailwind v4),
  `apps/dashboard` (login Better Auth, beranda sesuai role), dan `apps/api` (Hono: `/health`, `/v1/villages`,
  `/v1/me`, Better Auth `/api/auth/*`, OpenAPI `/openapi.json` + `/docs`).
- `packages/db`: skema Drizzle 17 tabel + migrasi `0000_init`, seed referensi (Jawa Barat + 27 kab/kota, 6 kategori)
  dan data demo (3 desa, 16 UMKM, 42 produk, akun per role, statistik dummy) yang bisa dihapus dengan `db:seed:reset`.
- `packages/auth`: `can()`/`assertCan()` dengan matriks role + 8 test; Better Auth server/client.
- Aturan lint batas import (frontend dilarang mengimpor `@repo/db` / `@repo/auth/server`).
- Dokumentasi: `AGENTS.md`, arsitektur, ADR 0001–0006, panduan, template plan, checklist serah-terima;
  `.mcp.json` (HeroUI React, Supabase read-only, Vercel), skill agent, CI + `changelog-check`, PR template.
- Env baru: lihat `.env.example` (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `TRUSTED_ORIGINS`, `COOKIE_DOMAIN`, `R2_*`,
  `SEED_WHATSAPP_NUMBER`).
- Terkait: [PLAN-mvp-seminar.md](plan/PLAN-mvp-seminar.md)
