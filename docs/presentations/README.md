# Presentasi

Slide HTML interaktif untuk rapat dan kegiatan HIMASIF. Setiap file berdiri sendiri: cukup dibuka di browser, tanpa
instalasi. Huruf Plus Jakarta Sans dimuat dari Google Fonts; tanpa internet, slide memakai huruf sistem.

| File                                                         | Untuk                                                                                                 |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| [rapat-persiapan-seminar.html](rapat-persiapan-seminar.html) | Rapat internal persiapan Seminar & Showcase Desanara di Desa Baros (Sabtu, 5 Desember 2026), 25 slide |

## Cara memakai

| Tombol                        | Fungsi                                                                     |
| ----------------------------- | -------------------------------------------------------------------------- |
| Panah kanan, Spasi, Page Down | Slide berikutnya (atau klik sisi kanan layar, atau geser di HP)            |
| Panah kiri, Page Up           | Slide sebelumnya                                                           |
| Home / End                    | Slide pertama / terakhir                                                   |
| O                             | Daftar semua slide, klik untuk lompat                                      |
| P                             | Mode presenter di jendela baru: slide sekarang, berikutnya, catatan, timer |
| F                             | Layar penuh                                                                |

- Di slide yang punya pilihan (komoditi, peran, rundown, divisi, timeline), tombol berikutnya membuka item satu per
  satu dulu, baru pindah slide. Tombol sebelumnya juga mundur per item.
- Animasi otomatis dimatikan bila perangkat memakai setelan kurangi animasi (reduce motion).
- Alamat `...html#16` langsung membuka slide 16.
- Mode presenter dan jendela slide saling mengikuti. Taruh jendela slide di proyektor, jendela presenter di laptop.
- Bagian yang bisa diklik: kartu agenda, komoditi, peran pengguna, filter harapan desa, blok rundown, bar timeline,
  divisi panitia, dan checklist keputusan (centang hanya tersimpan di browser yang dipakai).

## Mengubah isi

File HTML di folder ini adalah hasil build. Sumbernya ada di `src/`:

- `src/rapat-persiapan-seminar.template.html`: isi slide, gaya, dan script.
- `src/build.ts`: menyisipkan logo dari `docs/brand/desanara/`, foto dari `apps/web/public/media/seed/`, dan QR.

Edit template, lalu jalankan dari root repo (butuh ImageMagick):

```bash
bun docs/presentations/src/build.ts
bunx prettier --write docs/presentations
```

Build ulang juga setiap kali logo atau foto sumbernya berganti.

## Aturan isi

- Repo ini publik: orang disebut dengan perannya (Ketua Pelaksana, Pemateri, Sekretaris Desa), bukan namanya.
- Tidak ada kata sandi, data pribadi UMKM, atau ID infrastruktur.
- Ikuti warna dan logo di [`DESIGN.md`](../../DESIGN.md); logo diambil dari `docs/brand/desanara/`, tidak diketik ulang.
- Semua foto adalah foto ilustrasi Wikimedia Commons; kreditnya wajib tetap tampil di slide yang memakainya. Daftar
  sumber foto pedesaan ada di `src/img/CREDITS.md`.
