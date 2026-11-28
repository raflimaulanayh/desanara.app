# PLAN-product-reviews

|         |                                                                           |
| ------- | ------------------------------------------------------------------------- |
| Status  | Done                                                                      |
| Owner   | Tim web Desanara (HIMA SI)                                                |
| Tanggal | 2026-11-28                                                                |
| Terkait | PLAN-public-structure.md, PLAN-registration-email.md, DESIGN.md, ADR 0003 |

## 1. Tujuan & kondisi saat ini

Halaman detail produk (`/produk/[product]`) perlu terasa seperti toko yang dipercaya pembeli: foto lebih dari
satu, deskripsi yang benar-benar menjelaskan produk, dan ulasan dari orang yang sudah membeli.

Kondisi sekarang:

- Galeri (`product-gallery.tsx`) sudah mendukung banyak foto, carousel, dan layar penuh, tetapi seed hanya
  memberi satu foto per produk (`productPhotos` di `packages/db/src/seed/demo-data.ts`).
- Deskripsi demo hanya satu kalimat, misalnya "Dibalut tepung renyah.", sehingga bagian Deskripsi terlihat kosong.
- Rating di kartu dan detail produk (`product-rating.tsx`) adalah angka buatan dari hash slug untuk data demo.
  Tidak ada tabel ulasan, tidak ada API, tidak ada moderasi.
- Sudut kartu di detail produk belum seragam dengan token DESIGN (`--radius` untuk kartu, `--radius-compact`
  untuk elemen di dalam kartu).
- Pesanan terjadi di WhatsApp, jadi platform tidak bisa membuktikan siapa yang benar-benar membeli.

## 2. Scope & non-goals

Scope:

1. Revamp UI/UX detail produk (mobile dulu, lalu desktop) sesuai DESIGN.md.
2. Data demo lengkap: deskripsi kaya (ID + EN) untuk semua produk demo, minimal 2 foto per produk.
3. Fitur ulasan penuh: pembeli mengirim ulasan dari halaman produk, ulasan masuk antrean moderasi di dashboard,
   tampil di publik setelah disetujui. UMKM bisa membalas satu kali per ulasan.
4. Ringkasan rating asli (rata-rata, jumlah, sebaran bintang) di detail produk dan kartu produk.
5. Ulasan demo di seed (`is_seed = true`), termasuk beberapa yang menunggu moderasi untuk demo dashboard.
6. Perbaikan seed reset yang gagal karena `invitations.created_by` masih merujuk user demo.

Non-goals:

- Verifikasi pembelian (tidak ada data pesanan di platform). Label yang dipakai "Ulasan pembeli", bukan
  "Pembelian terverifikasi".
- Foto atau video di dalam ulasan, like/helpful, dan ulasan untuk UMKM atau desa (bisa menyusul).
- Login pembeli. Pembeli tetap anonim; hanya nama tampilan yang disimpan.
- Notifikasi email ke UMKM saat ada ulasan baru (cukup lencana jumlah antrean di dashboard).

## 3. Keputusan (produk, arsitektur, API)

### 3.1 Siapa memoderasi

UMKM yang menyetujui ulasannya sendiri bisa menyembunyikan ulasan buruk. Karena itu:

- **Pendamping dan admin desa** (serta super admin) menyetujui atau menolak ulasan. Mereka pihak netral.
- **Pemilik dan asisten UMKM** bisa melihat semua ulasan produknya (termasuk yang menunggu) dan menulis satu
  balasan publik per ulasan yang sudah tampil. Mereka tidak bisa menolak ulasan.
- Alasan tolak terbatas: spam, bahasa kasar, data pribadi, tidak terkait produk. Ulasan negatif yang jujur
  tidak boleh ditolak (tertulis di panduan moderasi di dashboard).

### 3.2 Izin baru (`packages/auth/src/permissions.ts`)

| Action            | Resource | Role                                                                   |
| ----------------- | -------- | ---------------------------------------------------------------------- |
| `review.view`     | business | owner, assistant UMKM, village_admin, village_assistant, super_admin   |
| `review.reply`    | business | owner, assistant UMKM (village admins too: they manage every business) |
| `review.moderate` | business | village_admin, village_assistant, super_admin                          |

Setiap action dapat test di `permissions.test.ts`.

### 3.3 Skema (migrasi Drizzle baru)

Enum `review_status`: `pending`, `approved`, `rejected`.

Tabel `product_reviews`:

| Kolom                                     | Tipe                       | Catatan                                                           |
| ----------------------------------------- | -------------------------- | ----------------------------------------------------------------- |
| `id`                                      | uuid pk                    |                                                                   |
| `product_id`, `business_id`, `village_id` | uuid fk                    | `village_id` dan `business_id` denormalisasi untuk scoping tenant |
| `reviewer_name`                           | text                       | 2 sampai 40 karakter, nama tampilan bebas                         |
| `rating`                                  | smallint                   | check 1 sampai 5                                                  |
| `body`                                    | text                       | 10 sampai 1000 karakter                                           |
| `locale`                                  | locale                     | bahasa saat menulis                                               |
| `status`                                  | review_status              | default `pending`                                                 |
| `rejection_reason`                        | text null                  | salah satu alasan di 3.1                                          |
| `moderated_by`, `moderated_at`            | fk users, timestamptz      |                                                                   |
| `reply`, `replied_by`, `replied_at`       | text null, fk, timestamptz | balasan UMKM, maksimal 600 karakter                               |
| `is_seed`, `deleted_at`, timestamps       |                            | pola standar                                                      |

Index: `(product_id, status, created_at)`, `(village_id, status)`, `(business_id, status)`.

Tidak menyimpan IP, nomor HP, atau email pembeli. Rate limit memakai tabel `rate_limits` yang sudah ada dengan
kunci hash (`review:<sha256(ip + salt)>`), jadi IP asli tidak tersimpan.

### 3.4 Kontrak API

Publik (tanpa login):

- `GET /v1/products/:slug/reviews?page&pageSize` mengembalikan ulasan `approved` terbaru dan
  `meta.summary = { average, count, distribution: {1..5} }`.
- `POST /v1/products/:slug/reviews` dengan `{ reviewerName, rating, body, locale, website }`. `website` adalah
  honeypot: jika terisi, balas 202 tanpa menyimpan. Rate limit 3 ulasan per jam per alamat dan 1 ulasan per
  produk per hari per alamat (429 `RATE_LIMITED`). Balasan 202 `{ data: { status: 'pending' } }`.
- Ringkasan produk dan detail produk di katalog mendapat `ratingAverage` (1 desimal) dan `ratingCount` dari
  ulasan `approved`.

Dashboard (login, lewat `assertCan()` di service):

- `GET /v1/manage/reviews?villageId|businessId&status&page`.
- `PATCH /v1/manage/reviews/:id` dengan `{ status: 'approved' | 'rejected', rejectionReason? }`.
- `PUT /v1/manage/reviews/:id/reply` dengan `{ reply }`, `DELETE` untuk menghapus balasan.

Validator bersama di `packages/validators` (`productReviewCreateSchema`, `reviewModerationSchema`,
`reviewReplySchema`). Konvensi error dan OpenAPI mengikuti `docs/architecture/api-conventions.md`.

### 3.5 Desain halaman detail produk

Urutan di mobile (desktop: galeri kiri, info kanan, ulasan dan produk lain di bawah lebar penuh):

1. Galeri: foto utama 1:1 dengan penanda posisi dan thumbnail di desktop, geser di mobile, ketuk untuk layar
   penuh (komponen yang ada).
2. Judul, ringkasan rating (bintang, rata-rata, "12 ulasan" yang menggulir ke bagian ulasan), kategori, harga.
3. Kartu asal: desa dan UMKM dalam satu kartu `rounded-(--radius)` dengan baris di dalamnya.
4. Panel pesan WhatsApp (yang ada), tetap jadi aksi utama.
5. Detail produk: deskripsi yang dipecah per paragraf, plus daftar singkat fakta (kategori, isi atau ukuran dari
   nama, dikirim dari desa).
6. Ulasan pembeli: angka rata-rata besar, bintang, bar sebaran 5 sampai 1, lalu daftar ulasan (inisial avatar,
   nama, bintang, tanggal relatif, teks, balasan UMKM dalam blok terindentasi). "Lihat semua ulasan" memuat
   halaman berikutnya. Tombol "Tulis ulasan" membuka Sheet di mobile dan Modal di desktop (HeroUI v3) berisi
   pilihan bintang, nama, dan teks dengan hitungan karakter. Setelah kirim: pesan "Terima kasih, ulasanmu
   tampil setelah diperiksa pendamping desa."
7. Produk lain dari UMKM yang sama (yang ada).

Kondisi kosong: belum ada ulasan menampilkan ajakan "Jadi yang pertama mengulas". Kartu produk menampilkan
bintang hanya jika `ratingCount > 0`.

### 3.6 Data demo

- Deskripsi 2 sampai 4 paragraf per produk (bahan, cara buat, rasa atau ukuran, saran simpan atau pakai), ditulis
  dalam suara pemilik UMKM, ID dan EN, tanpa label "contoh".
- Foto: `productPhotos` menjadi daftar. Foto kedua dan seterusnya diambil dari foto yang sudah ada dan cocok
  (pasangan seperti `coffee-beans` dan `coffee-ground`, foto proses di `media/seed/stories`), atau potongan
  detail dari foto utama yang dibuat sekali dengan skrip lokal dan disimpan sebagai file baru. Kredit dan
  lisensi tetap di `CREDITS.md`.
- Ulasan: 3 sampai 8 ulasan disetujui per produk, rating kebanyakan 4 sampai 5 dengan beberapa 3, nama
  Indonesia yang wajar, sebagian punya balasan UMKM. Ditambah 4 ulasan `pending` untuk demo moderasi.
- Data demo katalog preview (`catalogue-preview.ts`) diperbarui dengan bentuk yang sama.

## 4. Yang terdampak

- `packages/db`: skema, migrasi, seed (demo data, perbaikan reset).
- `packages/auth`: action baru dan test.
- `packages/validators`: skema ulasan.
- `apps/api`: modul baru `reviews` (publik) dan `manage-reviews` (dashboard), field rating di `catalog`.
- `apps/web`: detail produk, kartu produk, komponen ulasan, pesan i18n.
- `apps/dashboard`: halaman antrean ulasan (desa) dan tab ulasan di produk (UMKM).
- Docs: `data-model.md`, `auth-rbac.md`, `security-privacy.md` (data ulasan), DESIGN.md, CHANGELOG.

## 5. Langkah implementasi / milestone

1. Seed reset fix, deskripsi kaya, dan foto ganda (bisa tampil tanpa fitur ulasan).
2. Revamp UI detail produk dengan data yang ada, rapikan radius.
3. Skema, migrasi, izin, validator, test.
4. API publik dan dashboard, test service.
5. Section ulasan dan form di web, rating asli di kartu, hapus rating buatan.
6. Halaman moderasi dan balasan di dashboard.
7. Seed ulasan demo, docs, `check:all`, review.

## 6. Acceptance criteria

- Setiap produk demo punya minimal 2 foto dan deskripsi lebih dari satu paragraf di ID dan EN.
- Ulasan baru tidak tampil di publik sebelum disetujui pendamping atau admin desa.
- UMKM tidak bisa menolak ulasan, hanya membalas.
- Rating di kartu dan detail dihitung dari ulasan yang disetujui; tidak ada lagi angka buatan.
- Honeypot dan rate limit bekerja (test API).
- Semua query ulasan difilter `village_id` atau `business_id` dan `deleted_at IS NULL`.
- Sudut kartu di detail produk memakai token DESIGN.
- `bun run check:all` lolos.

## 7. Risiko & mitigasi

| Risiko                               | Mitigasi                                                               |
| ------------------------------------ | ---------------------------------------------------------------------- |
| Spam atau ulasan palsu               | Moderasi wajib, honeypot, rate limit per alamat, alasan tolak tercatat |
| UMKM menyembunyikan ulasan buruk     | Moderasi oleh pendamping desa, bukan UMKM                              |
| Data pribadi di teks ulasan          | Alasan tolak "data pribadi", panduan singkat di form                   |
| Antrean menumpuk dan tidak diperiksa | Lencana jumlah antrean di dashboard desa                               |
| Waktu mepet (freeze 2026-11-28)      | Milestone 1 dan 2 bisa dirilis sendiri; fitur ulasan setelahnya        |

## 8. Validasi & skenario test

- Test izin untuk tiga action baru di semua role.
- Test service: kirim ulasan (valid, honeypot, rate limit, produk draft atau terhapus ditolak), moderasi lintas
  desa ditolak, balasan hanya untuk ulasan `approved`, ringkasan rating benar.
- Test validator untuk batas panjang dan rating.
- Manual: kirim ulasan dari HP Android murah, setujui di dashboard sebagai pendamping, cek tampil di produk
  dan ringkasan berubah setelah revalidate.

## 9. Rollback

Revert PR. Migrasi hanya menambah tabel dan enum, jadi bisa ditinggal atau di-drop dengan migrasi turun.
Web tetap berjalan tanpa ulasan (section disembunyikan jika API ulasan gagal).

## 10. Pertanyaan terbuka & catatan persetujuan

- Moderasi oleh pendamping dan admin desa, bukan UMKM (rekomendasi). Perlu persetujuan.
- Apakah ulasan perlu nomor WhatsApp pembeli (tidak ditampilkan) untuk menekan spam? Rekomendasi: tidak, demi
  privasi dan karena moderasi sudah cukup.

## 11. Revision notes

| Tanggal    | Perubahan                                                                                                                                             |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-28 | Draft awal                                                                                                                                            |
| 2026-11-28 | Disetujui. Implementasi: modul `reviews` dan `manage-reviews`, halaman Ulasan di dashboard, halaman produk memakai radius platform (`radius={false}`) |
