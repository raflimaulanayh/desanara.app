# PLAN-registration-email

|         |                                                                                       |
| ------- | ------------------------------------------------------------------------------------- |
| Status  | Approved 2026-11-20                                                                   |
| Owner   | Tim HIMASIF (dikerjakan dengan agent AI)                                              |
| Tanggal | 2026-11-20                                                                            |
| Terkait | PLAN-mvp-seminar, `docs/architecture/auth-rbac.md`, `docs/architecture/deployment.md` |

## 1. Tujuan & kondisi saat ini

Masalah:

- Sign-up Better Auth (`POST /api/auth/sign-up/email`) masih terbuka: siapa saja bisa membuat akun.
- Belum ada cara masuk untuk akun baru selain dibuat manual, belum ada lupa password, dan belum ada email.
- Pemilik UMKM tidak bisa mendaftar sendiri; semua UMKM dimasukkan pendamping.

Yang sudah ada:

- Verifikasi UMKM oleh admin desa di API (`verificationStatus` pending/verified/rejected; UMKM baru tampil publik
  setelah terverifikasi).
- Tabel `invitations` (token disimpan sebagai hash) yang belum dipakai.
- Domain `desanara.app` terverifikasi di Resend; `RESEND_API_KEY` ada di Vercel (production) dan `.env` lokal.

## 2. Scope & non-goals

Scope:

- Paket `packages/email`: kirim email lewat Resend (tanpa SDK) atau console di lokal, template HTML sederhana.
- Better Auth: sign-up ditutup, verifikasi email wajib sebelum login, lupa password, rate limit di database.
- Undangan akun (WhatsApp dan email), halaman terima undangan di dashboard.
- Pendaftaran mandiri UMKM di web (`/gabung`, `/gabung/<desa>`), Turnstile, batas per IP.
- Menu "Verifikasi" di dashboard untuk pengajuan mandiri dan UMKM yang menunggu verifikasi.
- Halaman kebijakan privasi dan syarat & ketentuan (ID dan EN).
- Job harian (Vercel Cron): ringkasan untuk admin desa, hapus pengajuan ditolak setelah 30 hari, hapus undangan kedaluwarsa.

Non-goals (sesudah seminar): login dengan nomor WhatsApp/OTP, notifikasi push (PWA), pengajuan desa baru
(modul terpisah), aplikasi mobile.

## 3. Keputusan (produk, arsitektur, API)

### Undangan: berjenjang, dengan pagar pengaman

Tujuan: pendamping di lapangan tidak perlu menunggu admin, tetapi tidak ada yang bisa menaikkan hak aksesnya sendiri.

| Pengundang   | Boleh mengundang                                           |
| ------------ | ---------------------------------------------------------- |
| Super admin  | Admin desa, pendamping desa, pemilik/asisten UMKM mana pun |
| Admin desa   | Pendamping desanya, pemilik/asisten UMKM di desanya        |
| Pendamping   | Pemilik UMKM yang ia buat (aksi `business.invite_owner`)   |
| Pemilik UMKM | Asisten UMKM-nya                                           |

Pagar pengaman:

- Tidak bisa mengundang peran yang lebih tinggi dari peran sendiri; target dan peran terkunci di undangan.
- Link sekali pakai, berlaku 7 hari, bisa dicabut, tercatat di audit log (siapa mengundang siapa).
- Maksimal 30 undangan per pengundang per hari.
- Admin desa melihat semua undangan dan anggota di desanya dan bisa mencabutnya.
- UMKM tetap tidak tampil publik sebelum diverifikasi admin desa, jadi undangan dari pendamping tidak membuka celah
  ke katalog publik.

Izin baru di `can()`: `village.invite_members` (admin desa), `business.invite_members` (pemilik, untuk asisten).
`business.invite_owner` yang sudah ada dipakai pendamping dan asisten UMKM.

### Akun

- `emailAndPassword.disableSignUp = true`. Akun dibuat server saat undangan diterima (internal adapter Better Auth,
  password di-hash oleh Better Auth).
- `requireEmailVerification = true`. Undangan yang dibuka dari email menandai email terverifikasi; undangan dari
  WhatsApp meminta **kode 6 angka** yang dikirim ke email dan diketik di halaman yang sama (plugin `emailOTP` Better
  Auth), lalu pengguna langsung masuk. Kode berlaku 10 menit, maksimal 5 percobaan, bisa dikirim ulang.
- Lupa password: respons selalu sama (tidak membocorkan email terdaftar); token berlaku 1 jam; semua sesi dicabut
  setelah password diganti.
- Rate limit Better Auth disimpan di database (tabel `rate_limits`), karena memori tidak dibagi antar-instance Vercel.

### Prinsip "tidak ribet"

- Pengguna langsung masuk setelah membuat akun atau memasukkan kode; tidak diminta login ulang.
- Password minimal 8 karakter tanpa aturan simbol, dengan tombol lihat/sembunyikan.
- Data yang sudah diketahui terisi otomatis (desa dari QR, nama dan email dari undangan).
- Form tersimpan di perangkat (draft), nomor WhatsApp boleh `08…`, Turnstile mode otomatis tanpa teka-teki.
- Pesan error dalam bahasa sehari-hari; setiap layar tunggu menjelaskan langkah berikutnya.

### Pendaftaran mandiri

- Form singkat: nama pemilik, WhatsApp, email, nama usaha, kategori, deskripsi singkat, desa, centang persetujuan
  (link ke kebijakan privasi). Logo, produk dan lokasi diisi di dashboard setelah disetujui.
- Tabel baru `business_applications`; disetujui menjadi UMKM (draft, terverifikasi, persetujuan `in_app`) plus
  undangan pemilik; ditolak dengan alasan, dihapus otomatis setelah 30 hari.
- Satu email pengajuan aktif per desa (mencegah dobel). Turnstile wajib; maksimal 5 pengajuan per IP per jam (IP
  disimpan sebagai hash).
- Endpoint publik `POST /v1/applications`; endpoint dashboard `GET /v1/manage/applications`,
  `POST /v1/manage/applications/{id}/approve`, `.../reject`.

### Email

- `packages/email`: `sendEmail({ to, subject, html, text })` dengan adapter Resend (`fetch`) atau console.
  Pengirim `Desanara <noreply@desanara.app>`, balasan ke alamat HIMASIF.
- Template: verifikasi email, reset password, undangan, pengajuan diterima, disetujui, ditolak, ringkasan harian.
- Notifikasi admin desa: satu ringkasan per hari pukul 07.00 WIB bila ada pengajuan baru, plus angka di menu
  Verifikasi.

## 4. Yang terdampak

- `packages/email` (baru), `packages/auth` (server, permissions + test), `packages/db` (migrasi: `rate_limits`,
  `business_applications`, kolom tambahan `invitations`), `packages/validators`.
- `apps/api`: modul `invitations`, `applications`, `manage-applications`, `cron`; konfigurasi Better Auth.
- `apps/dashboard`: lupa password, atur ulang password, verifikasi email, terima undangan, menu Verifikasi, tombol undang.
- `apps/web`: `/gabung`, `/gabung/[village]`, `/kebijakan-privasi`, `/syarat-ketentuan`.
- Env baru: `EMAIL_FROM`, `EMAIL_REPLY_TO`, `TURNSTILE_SITE_KEY`/`NEXT_PUBLIC_TURNSTILE_SITE_KEY`,
  `TURNSTILE_SECRET_KEY`, `CRON_SECRET` (Vercel dan `.env` lokal).

## 5. Langkah implementasi / milestone

PR 1 (akun dan email):

1. `packages/email` + test template.
2. Better Auth: tutup sign-up, verifikasi email, lupa password, rate limit database (migrasi).
3. Undangan: izin, API, halaman terima undangan, tombol undang (WhatsApp dan email).
4. Halaman dashboard: lupa password, atur ulang, email terverifikasi, pesan "cek email" saat login belum terverifikasi.

PR 2 (pendaftaran dan verifikasi):

5. Migrasi `business_applications`, endpoint publik + Turnstile + batas per IP.
6. Halaman `/gabung` dan `/gabung/[village]` (QR desa di Pengaturan desa), kebijakan privasi, S&K.
7. Menu Verifikasi (pengajuan + UMKM pending), setujui/tolak.
8. Vercel Cron harian.

## 6. Acceptance criteria

- `POST /api/auth/sign-up/email` ditolak di production.
- Akun dari undangan WhatsApp tidak bisa login sebelum email diverifikasi; dari undangan email bisa langsung.
- Lupa password berfungsi end-to-end dan tidak membedakan email terdaftar atau tidak.
- Pendamping bisa mengundang pemilik UMKM yang ia buat, tetapi tidak bisa mengundang pendamping atau admin.
- Pengajuan mandiri tanpa Turnstile valid ditolak; pengajuan disetujui menghasilkan UMKM dan undangan pemilik.
- Semua akun demo tetap bisa login.

## 7. Risiko & mitigasi

| Risiko                                            | Mitigasi                                                          |
| ------------------------------------------------- | ----------------------------------------------------------------- |
| Email masuk spam saat demo                        | SPF/DKIM/DMARC sudah aktif; akun demo terverifikasi; uji ke Gmail |
| Akun asli lama belum terverifikasi lalu terkunci  | Cek data production sebelum deploy, tandai manual bila perlu      |
| Fungsi serverless berhenti sebelum email terkirim | Kirim email dengan `await` di jalur server yang aman              |
| Kuota Resend 100/hari                             | Ringkasan harian, batas undangan dan pengajuan                    |
| Spam pengajuan                                    | Turnstile, batas per IP, satu pengajuan aktif per email per desa  |

## 8. Validasi & skenario test

- Test izin baru di `packages/auth/src/permissions.test.ts`.
- Test integrasi API (DB lokal): sign-up ditolak, undangan (buat, terima, kedaluwarsa, dicabut, peran tidak boleh naik),
  pengajuan (Turnstile palsu ditolak, setujui, tolak), rate limit.
- Uji manual di build production pada lebar HP: undangan dari WhatsApp sampai login, lupa password, pendaftaran
  lewat QR desa.

## 9. Rollback

Migrasi hanya menambah tabel/kolom (aman). Menutup sign-up bisa dibuka lagi dengan revert konfigurasi. Endpoint baru
bisa dimatikan tanpa menyentuh data.

## 10. Pertanyaan terbuka & catatan persetujuan

- 2026-11-20: disetujui. Form singkat, ringkasan harian, 2 PR, undangan berjenjang dengan pagar pengaman, verifikasi
  email undangan WhatsApp dengan kode 6 angka (bukan link) agar alurnya tidak ribet.

## 11. Revision notes

| Tanggal    | Perubahan                                                                                                                                                |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-20 | Draft awal; disetujui dengan verifikasi kode 6 angka                                                                                                     |
| 2026-11-20 | PR 1 selesai: lupa kata sandi memakai kode (bukan tautan) agar alurnya sama; asisten UMKM tidak lagi boleh mengundang pemilik kecuali ia pendamping desa |
