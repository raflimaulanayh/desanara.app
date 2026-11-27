# PLAN-about-page — Revamp halaman Tentang dengan splash dan cerita interaktif

|         |                                                                                                          |
| ------- | -------------------------------------------------------------------------------------------------------- |
| Status  | In progress                                                                                              |
| Owner   | Tim developer HIMASIF                                                                                    |
| Tanggal | 2026-11-27                                                                                               |
| Terkait | [PLAN-public-structure](PLAN-public-structure.md) §3.2, [DESIGN.md](../../DESIGN.md), ADR 0007, ADR 0008 |

## 1. Tujuan & kondisi saat ini

Halaman `/tentang` adalah tempat pengunjung, desa calon mitra, dan peserta seminar 5 Desember 2026 memahami
Desanara. Isinya sekarang terlalu tipis: hero, tiga paragraf, tiga poin kepercayaan, tiga langkah pesan, dan
kotak ajakan tanpa tombol.

Masalah yang ditemukan saat pemeriksaan di HP 390 px dan desktop 1440 px:

- Belum menjelaskan masalah yang diselesaikan, peran tiap pengguna, cerita Desa Baros, rencana ke depan,
  pembuatnya, dan pertanyaan umum (gratis, potongan, pembayaran, cara desa bergabung, data pribadi).
- Pola yang terasa generik: tiga kartu berikon dalam lingkaran, tiga kartu bernomor yang menumpuk tinggi di HP,
  em-dash di teks, dan semua bagian berupa kotak krem dengan bobot yang sama.
- Judul hero "Karya Desa, untuk Indonesia." berbeda dari tagline resmi "Ragam Karya, Cerita Nusantara.".
- Judul "Tentang Desanara" muncul lagi di bawah hero. Logo HIMASIF dan SATU University terselip di tengah paragraf.
- Bagian `#gabung` tidak punya tombol, dan halaman ini tidak punya interaksi sama sekali.

Tujuan revamp: halaman yang menjelaskan Desanara secara lengkap, terasa premium dan khas desa, dan interaksinya
memperlihatkan cara kerja Desanara, bukan sekadar hiasan.

## 2. Scope & non-goals

**Scope**

- Splash intro saat `/tentang` dibuka (logo tumbuh, lalu membuka ke hero).
- Sepuluh bagian baru (§3.3), dua bahasa, dengan gerak berbasis GSAP.
- Simulasi pesan WhatsApp yang bisa dicoba dan tab lima peran.
- Angka statis yang diambil sekali dari API produksi.

**Non-goals**

- Peta 3D Nusantara dengan three.js. Ditunda ke tahap 2 (§10).
- Angka yang di-fetch setiap kali halaman dibuka.
- Formulir pendaftaran. `#gabung` tetap mengarah ke kontak HIMASIF sampai `/gabung` jadi.
- Splash saat PWA dibuka. Opsi terpisah (§10).
- Mengubah beranda, header, atau footer, kecuali link yang sudah ada tetap berfungsi.

## 3. Keputusan

### 3.1 Konten dan data

- **Judul hero**: "Ragam Karya, Cerita Nusantara." Belum ada tagline resmi berbahasa Inggris, jadi halaman EN
  memakai tagline yang sama sebagai nama brand, dengan kalimat penjelas berbahasa Inggris di bawahnya.
- **Angka** (diambil dari `api.desanara.app` tanggal 27 November 2026, disimpan sebagai konstanta di
  `apps/web/src/components/about/about-facts.ts`): 27 desa, 136 UMKM, 38 produk, 6 kategori, 3 kabupaten
  (Kabupaten Bandung 13 desa, Garut 7, Sumedang 7). Angka tampil seperti data asli, tanpa label "contoh" atau
  tanggal di layar. Sumber dan tanggal pengambilan hanya ada di komentar kode.
- **Desa Baros** (notulensi survei HIMASIF 24 Oktober 2026): Kecamatan Arjasari, Kabupaten Bandung; 78 UMKM
  tercatat di desa; sektor kerajinan, fesyen, dan makanan olahan; komoditas ubi, hanjeli, kopi, jagung, dan
  jamur tiram; arah desa: menjual hasil olahan, bukan bahan mentah.
- **Pembuat**: hanya nama organisasi. HIMA Sistem Informasi dan SATU University, program Pengabdian kepada
  Masyarakat. Tidak ada nama anggota dan tidak ada link ke repositori kode.
- **Garis waktu**: Oktober 2026 survei Desa Baros, November 2026 Desanara dibangun dan tayang di desanara.app,
  5 Desember 2026 seminar dan showcase di Kantor Desa Baros (target 30 sampai 60 UMKM), 2027 perluasan
  (template desa, keranjang ke WhatsApp, aplikasi mobile, pendaftaran desa mandiri), lalu fase transaksi setelah
  ada badan hukum. Sumber: proposal PKM dan [roadmap](../product/roadmap.md).
- Topik perizinan (NIB, PIRT, halal) tidak dibahas di halaman ini.
- Semua teks tanpa em-dash, panah, atau rangkaian titik tengah. Ditulis sebagai kalimat biasa.

### 3.2 Teknologi gerak

- **GSAP + ScrollTrigger** (plus SplitText dan DrawSVG bila perlu; semua plugin GSAP sekarang gratis), dipin ke
  versi pasti. Hanya dimuat oleh komponen klien di `/tentang`, tidak masuk bundle halaman lain.
- Tidak memakai Motion atau three.js di tahap ini. Satu library gerak saja.
- Semua konten dirender di server dan terbaca tanpa JavaScript. Gerak hanya menambah, tidak menyembunyikan
  isi secara permanen.
- `prefers-reduced-motion: reduce` mematikan semua gerak, termasuk splash. GSAP `matchMedia` dipakai agar
  timeline dibersihkan otomatis saat preferensi berubah dan saat komponen dilepas.
- Anggaran: tambahan JavaScript paling banyak sekitar 60 KB gzip untuk halaman ini. LCP tidak boleh
  menunggu GSAP.

### 3.3 Susunan halaman

| No  | Bagian                    | Isi                                                                                                                                                        | Interaksi                                                                                                                    |
| --- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 0   | Splash                    | Latar krem, logo vertikal Desanara                                                                                                                         | Daun tinggi dan daun kecil tumbuh, huruf muncul satu per satu, tagline, lalu tirai terbuka ke hero (±1,6 detik)              |
| 1   | Hero                      | Tagline resmi, satu kalimat posisi, dua jalur ("Saya mencari produk desa", "Saya punya usaha"), ilustrasi desa, baris angka                                | Ilustrasi naik bertahap, angka menghitung naik saat terlihat                                                                 |
| 2   | Masalah                   | Tiga masalah dari [visi](../product/vision.md), ditulis besar sebagai kalimat cerita                                                                       | Kalimat terungkap baris demi baris saat di-scroll                                                                            |
| 3   | Coba cara pesan           | Satu produk Desa Baros, pengatur jumlah, catatan, dan pratinjau chat WhatsApp berisi pesan yang dibuat `buildWhatsAppLink`                                 | Pesan dan total berubah langsung. Tidak membuka WhatsApp, tombolnya mengarah ke `/jelajah`                                   |
| 4   | Satu platform, lima peran | Pembeli, Pemilik UMKM, Pendamping, Admin desa, Tim HIMA, dari [alur pengguna](../product/user-flows.md)                                                    | Tab HeroUI v3. Tiap tab menampilkan cuplikan UI yang dibuat dari komponen asli (kartu produk, badge verifikasi, status buka) |
| 5   | Kenapa bisa dipercaya     | Alur verifikasi (didaftarkan, dicek admin desa, tayang), alamat tidak pernah tampil, status buka dihitung dari jadwal, tanpa potongan, persetujuan pemilik | Garis alur terisi dan tiap langkah menyala saat di-scroll                                                                    |
| 6   | Dimulai dari Desa Baros   | Fakta survei (§3.1), link ke `/desa/baros`, lalu 26 desa lain di Bandung, Garut, dan Sumedang                                                              | Komoditas sebagai chip. Nama desa lain bergerak pelan sebagai pita yang bisa dijeda, tiap nama adalah link                   |
| 7   | Perjalanan                | Garis waktu §3.1                                                                                                                                           | Garis vertikal terisi mengikuti scroll, titik hari ini ditandai                                                              |
| 8   | Dibuat oleh               | Logo HIMASIF dan SATU University dan program PKM                                                                                                           | Statis                                                                                                                       |
| 9   | Tanya jawab               | Gratis, potongan, pembayaran dan pengiriman, cara desa bergabung, bahasa, data pribadi (UU PDP)                                                            | Accordion HeroUI v3                                                                                                          |
| 10  | Penutup (`#gabung`)       | Dua jalur: ke `/jelajah`, atau hubungi HIMASIF untuk mendaftarkan UMKM atau desa                                                                           | Tombol nyata untuk keduanya                                                                                                  |

Anchor `#gabung` dipertahankan karena `JOIN_HREF` di `apps/web/src/lib/paths.ts` dan menu memakainya.

### 3.4 Splash

- Muncul sekali per sesi browser (`sessionStorage`), hanya di `/tentang` dan `/en/tentang`.
- Urutan gerak splash ditulis dengan CSS, bukan GSAP, supaya mulai sejak tampilan pertama dan tetap selesai
  walaupun JavaScript lambat dimuat.
- Sebuah skrip kecil di awal halaman memberi atribut `data-splash` pada `<html>` sebelum tampilan pertama, hanya
  bila splash belum pernah tampil di sesi ini dan pengguna tidak memilih _reduced motion_. Tanpa atribut itu,
  overlay tidak dirender sama sekali, jadi tidak ada kedipan.
- Pengaman: animasi CSS menyembunyikan overlay setelah 2,5 detik walaupun JavaScript gagal dimuat.
- Bisa dilewati dengan sekali tap, klik, atau tombol Escape. Overlay `aria-hidden`, dan fokus langsung ke
  konten utama.
- Konten halaman sudah dirender di bawah overlay, jadi pembaca layar dan mesin pencari membaca halaman seperti
  biasa.

### 3.5 Arah visual

Mengikuti DESIGN.md (Montserrat, hijau Desanara, krem `wash`, palet sekunder hanya untuk dekorasi), dengan
beberapa aturan agar tidak terasa generik:

- Layout desktop tidak simetris. Bagian dibedakan lewat skala huruf, ruang kosong, dan satu bagian berlatar hijau
  tua, bukan deretan kotak krem yang sama.
- Tidak ada kartu ikon-dalam-lingkaran yang diulang, teks bergradasi, atau angka dengan tanda "+".
- Contoh visual memakai komponen asli Desanara (kartu produk, badge, status buka, pratinjau WhatsApp), bukan
  ilustrasi stok.
- Halaman platform, jadi memakai tema Desanara, bukan tema desa (ADR 0007).

Sketsa HP (360 px):

```text
+------------------------------+
| [logo]  Cari produk desa     |
+------------------------------+
|   Ragam Karya,               |
|   Cerita Nusantara.          |
|   kalimat posisi             |
|   [Saya mencari produk desa] |
|   [Saya punya usaha       ]  |
|   ilustrasi desa             |
|   27 desa  136 UMKM  3 kab.  |
+------------------------------+
|   Masalah (teks besar)       |
+------------------------------+
|   Coba cara pesan            |
|   [foto] Nama produk  Rp     |
|   [-] 2 [+]  catatan         |
|   +------------------------+ |
|   | bubble chat WhatsApp   | |
|   +------------------------+ |
+------------------------------+
|   Pembeli | UMKM | ...  (tab)|
|   cuplikan UI peran          |
+------------------------------+
|   ...                        |
+------------------------------+
| navigasi bawah               |
+------------------------------+
```

Sketsa desktop (1440 px), bagian Coba cara pesan:

```text
+-----------------------------------------------------------+
|  Coba cara pesan                 +----------------------+ |
|  penjelasan singkat              | WhatsApp             | |
|                                  |  Halo, saya mau      | |
|  [foto] Nama produk     Rp       |  pesan 2 x ...       | |
|  [-] 2 [+]                       |  Catatan: ...        | |
|  catatan [               ]       |               10.21  | |
|  [Jelajahi produk]               +----------------------+ |
+-----------------------------------------------------------+
```

## 4. Yang terdampak

- `apps/web/src/app/[locale]/tentang/page.tsx`: disusun ulang.
- `apps/web/src/components/about/` (baru): `about-splash.tsx`, `about-hero.tsx`, `order-simulator.tsx`,
  `role-tabs.tsx`, `trust-flow.tsx`, `baros-story.tsx`, `journey-timeline.tsx`, `about-faq.tsx`,
  `about-facts.ts`, dan helper GSAP bersama.
- `apps/web/messages/id.json`, `en.json`: namespace `about` ditulis ulang. Kunci lama yang tidak dipakai dihapus.
- `apps/web/src/app/globals.css`: gaya splash dan pengaman tanpa JavaScript.
- `apps/web/package.json`: dependensi `gsap`.
- `DESIGN.md`: bagian About hero diganti dengan uraian halaman Tentang yang baru.
- `docs/plan/PLAN-public-structure.md` §3.2: menunjuk ke rencana ini.
- `docs/CHANGELOG.md`: entri baru.
- Tidak ada perubahan API, skema, atau izin.

## 5. Langkah implementasi

1. **Teks dan data**: tulis teks ID dan EN, `about-facts.ts`, dan pilih satu produk Desa Baros untuk simulasi.
2. **Layout statis**: semua bagian tanpa gerak, diuji di 320, 360, 390, 768, dan 1440 px, dengan dan tanpa
   JavaScript.
3. **Interaksi**: simulasi pesan, tab peran, accordion tanya jawab.
4. **Gerak**: GSAP untuk hero, masalah, alur verifikasi, pita desa, dan garis waktu, dengan `matchMedia` untuk
   _reduced motion_.
5. **Splash**: skrip awal, overlay, timeline logo, pengaman CSS.
6. **QA dan dokumen**: pemeriksaan §8, DESIGN.md, PLAN-public-structure, CHANGELOG, `bun run check:all`.

## 6. Acceptance criteria

- Semua bagian §3.3 tampil di `/tentang` dan `/en/tentang` dengan teks yang sesuai bahasanya.
- Tanpa JavaScript, semua teks dan link terbaca dan tidak ada bagian yang tersembunyi.
- Dengan _reduced motion_, tidak ada splash dan tidak ada gerak.
- Splash tampil sekali per sesi, bisa dilewati, dan hilang sendiri paling lambat 2,5 detik.
- Simulasi pesan menghasilkan teks yang sama dengan pesan di halaman produk untuk jumlah dan catatan yang sama.
- Tidak ada scroll horizontal di 320 px. Target sentuh minimal 44 px.
- Tidak ada label "contoh" atau "demo" di layar.
- Bundle halaman lain tidak bertambah karena GSAP.
- `#gabung` tetap berfungsi dari menu dan link "Daftarkan UMKM".
- `bun run check:all` lulus.

## 7. Risiko & mitigasi

| Risiko                                               | Mitigasi                                                                                      |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Gerak terasa berat di Android murah                  | Animasi hanya `transform` dan `opacity`, tanpa scroll-jacking, tanpa pin panjang di HP        |
| Splash mengganggu pengunjung yang kembali            | Sekali per sesi, bisa dilewati, durasi pendek                                                 |
| Splash menutupi konten bila JavaScript gagal         | Overlay hanya ada bila atribut `data-splash` dipasang, plus pengaman CSS 2,5 detik            |
| Angka statis tidak cocok lagi dengan data asli nanti | Satu file konstanta dengan komentar sumber, dicatat di daftar tugas sebelum peluncuran publik |
| Revamp melewati feature freeze 28 November           | Perubahan hanya di halaman ini, tanpa API dan skema. Bila lewat, dianggap perbaikan konten    |
| Teks EN terdengar seperti terjemahan mesin           | Teks EN ditulis terpisah dan ditinjau, bukan terjemahan kata per kata                         |

## 8. Validasi & skenario test

- Test unit untuk pembentuk pesan simulasi (memakai `buildWhatsAppLink` dengan contoh jumlah dan catatan).
- Screenshot Playwright di 360, 390, dan 1440 px untuk ID dan EN, dengan JavaScript aktif dan nonaktif, serta
  dengan `prefers-reduced-motion`.
- Uji manual di HP Android kelas bawah: splash, scroll, tab, simulasi, accordion.
- Lighthouse mobile untuk `/tentang`: LCP dan CLS tidak lebih buruk dari versi sekarang.

## 9. Rollback

Revert PR. Tidak ada migrasi atau perubahan API.

## 10. Pertanyaan terbuka & catatan persetujuan

Keputusan pengguna 2026-11-27: angka statis dari database dan tampil seperti data asli; fakta survei Baros
boleh dipakai; hanya nama organisasi; judul memakai tagline resmi; three.js ditunda; GSAP, Motion, dan three.js
diizinkan; splash screen ditambahkan.

Masih terbuka:

- **Splash saat PWA dibuka**: Android sudah memakai warna latar dan ikon dari manifest. Versi beranimasi atau
  gambar khusus iOS (`apple-touch-startup-image`) perlu rencana terpisah bila diinginkan.
- **Peta 3D Nusantara (tahap 2)**: peta Indonesia low-poly yang mendekat ke Jawa Barat lalu ke titik desa,
  dimuat belakangan dan hanya untuk perangkat yang mampu, dengan gambar statis sebagai pengganti.

## 11. Revision notes

| Tanggal    | Perubahan                                                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-27 | Draft pertama                                                                                                                                                                   |
| 2026-11-27 | Splash diganti: matahari terbit hijau tua dengan cincin terasering, efek kedalaman mengikuti mouse, dan pembukaan melingkar. Skrip awal splash dipindah ke `<head>` root layout |
| 2026-11-27 | Disetujui dan dikerjakan. Gerak splash memakai CSS (bukan GSAP) agar mulai sejak tampilan pertama                                                                               |
