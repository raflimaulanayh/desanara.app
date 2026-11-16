# Panduan dashboard (admin desa & pendamping)

Untuk tim lapangan HIMA, pendamping, dan admin desa. Tidak perlu latar belakang teknis.
Gambaran alur dan status: [alur pengguna](../product/user-flows.md).

> Dashboard masih dikembangkan. Bagian bertanda **(belum tersedia)** akan menyusul.
> Nama tombol di panduan ini sama persis dengan yang tampil di layar.

## Masuk

1. Buka **https://desanara-dashboard.vercel.app** di HP atau laptop. Simpan ke layar utama HP agar mudah dibuka lagi.
2. Isi **Email** dan **Kata sandi**, tekan **Masuk**.
3. Lupa kata sandi atau belum punya akun: hubungi pengurus HIMA. Pendaftaran mandiri dan undangan lewat WhatsApp (belum tersedia).

Untuk latihan, minta **akun latihan** ke pengurus HIMA. Akun latihan terhubung ke data contoh, jadi jangan memasukkan
data UMKM asli memakai akun latihan.

## Tampilan dashboard

- **HP**: menu ada di bawah layar (**Beranda**, **UMKM**). Nama akun dan tombol **Keluar** ada di kanan atas.
- **Laptop**: menu ada di kiri.
- Menu yang tampil menyesuaikan peran. Pemilik tidak melihat tombol verifikasi, misalnya.
- **Beranda** menampilkan desa dan UMKM yang kamu pegang, serta jumlah UMKM yang **Menunggu verifikasi**.

## Pendamping: mendaftarkan UMKM baru

Siapkan dulu bersama pemilik: nama usaha, cerita singkat usaha, nomor WhatsApp untuk pesanan, link toko online bila ada,
dan **formulir persetujuan kertas** yang sudah ditandatangani.

1. Buka menu **UMKM**, lalu tekan **Tambah UMKM**.
2. **Langkah 1, Data usaha**
   - **Desa**: pilih desa UMKM.
   - **Nama usaha**: nama yang dikenal pembeli, misalnya "Keripik Bu Ani".
   - **Nama pemilik**.
   - **Cerita singkat usaha**: apa yang dijual dan apa yang membuatnya khas. Ini tampil di situs.
   - **Alamat**: hanya untuk tim desa, tidak pernah tampil di situs.
   - **NIB**: opsional, 13 digit dari OSS.
3. **Langkah 2, Kontak dan toko online**
   - **Nomor WhatsApp**: pesanan pembeli masuk ke nomor ini. Boleh ditulis `0812…`, otomatis diubah ke `62812…`.
   - Link Shopee, Tokopedia, TikTok Shop, Instagram: opsional, tulis lengkap diawali `https://`.
4. **Langkah 3, Persetujuan pemilik**
   - Bacakan teks di layar ke pemilik: apa yang tampil di internet, bahwa alamat tidak pernah tampil, dan bahwa persetujuan bisa ditarik kapan saja.
   - Centang **Pemilik sudah menandatangani formulir persetujuan** hanya bila formulirnya sudah ditandatangani.
5. Tekan **Simpan UMKM**. UMKM masuk dengan status **Draf** dan **Menunggu verifikasi**.

**Isian tersimpan otomatis di HP.** Kalau aplikasi tertutup atau sinyal hilang, buka lagi **Tambah UMKM** dan pilih
**Lanjutkan isian**. Isian yang tersimpan di HP hilang setelah 14 hari atau saat kamu **Keluar**.

**Kalau ada isian yang salah**, form langsung pindah ke langkah tempat isian itu dan menampilkan pesannya
(misalnya "Minimal 3 karakter" atau "Tulis link lengkap, diawali https://").

## Pendamping: setelah UMKM disimpan

- **Ditolak admin desa**: alasan penolakan tampil di halaman UMKM. Tekan **Ubah data**, perbaiki, lalu **Simpan perubahan**.
  UMKM otomatis kembali **Menunggu verifikasi**.
- **Terverifikasi**: kotak **Tayang di Desanara** menampilkan syarat yang sudah dan belum terpenuhi. Bila semuanya
  **Terpenuhi**, tekan **Tayangkan**. Tekan **Lihat halaman publik** untuk mengecek tampilannya.
- **Sembunyikan** menurunkan UMKM dari situs tanpa menghapus datanya.
- (belum tersedia) Mengisi jam buka dan menyerahkan akun ke pemilik.

## Menambah dan mengelola produk

Produk dikelola dari halaman UMKM, di bagian **Produk**.

1. Tekan **Tambah produk**.
2. **Foto produk**: tekan **Tambah foto** dan pilih sampai 10 foto. Foto pertama menjadi **Sampul**. Urutannya bisa diatur
   dengan tombol bintang (**Jadikan sampul**) dan panah kiri/kanan. Foto otomatis diperkecil dan data lokasinya dihapus.
3. **Data produk**:
   - **Nama produk**: tulis ukuran atau isinya di nama, seperti di marketplace, misalnya "Keripik Singkong Balado 250 gr".
     Ukuran lain (misalnya 500 gr) dibuat sebagai produk terpisah.
   - **Kategori**: wajib dipilih.
   - **Harga (Rp)**: ketik angkanya saja, titik ribuan muncul sendiri. Minimal Rp100. Untuk sampel atau hadiah,
     nyalakan **Gratis**.
   - **Sedang promo**: nyalakan bila ada potongan harga, lalu isi **Harga normal sebelum promo**. Harga normal harus lebih
     tinggi dan memang pernah berlaku. Dashboard menampilkan berapa persen potongannya.
   - **Deskripsi**: rasa, bahan, ukuran, cara pakai, atau berapa lama tahan.
   - **Stok tersedia**: matikan bila stok sedang kosong. Produk tetap tampil dengan tanda **Stok kosong** dan tidak bisa
     dipesan.
   - **Versi bahasa Inggris** (opsional): nama dan deskripsi untuk situs berbahasa Inggris.
4. Tekan **Simpan produk**. Produk tersimpan sebagai draf, lalu foto diunggah satu per satu. Jangan tutup halaman sampai
   halaman produk terbuka. Bila ada foto yang gagal (misalnya sinyal putus), tekan **Coba lagi** pada foto itu, atau
   **Lanjut ke halaman produk** dan unggah lagi nanti.
5. Di halaman produk, kotak **Tayang di Desanara** menunjukkan syaratnya: kategori sudah dipilih dan minimal 1 foto. Tekan
   **Tayangkan**. Produk baru terlihat di situs bila UMKM-nya juga sedang tayang.

Di halaman produk yang sama kamu bisa mengubah data (**Simpan perubahan**), menambah atau menghapus foto,
**Sembunyikan** produk, atau **Hapus produk**. Foto terakhir dari produk yang sedang tayang tidak bisa dihapus;
sembunyikan produknya dulu atau tambah foto lain.

**Logo UMKM** juga diatur di halaman UMKM: tekan **Unggah logo** (gambar persegi paling rapi). Logo baru otomatis
menggantikan logo lama.

## Admin desa: memverifikasi UMKM

1. Buka menu **UMKM**, lalu pilih tab **Perlu dicek**.
2. Buka UMKM, baca **Data UMKM**: nama, pemilik, cerita, alamat (internal), kontak, persetujuan pemilik.
3. Pastikan usaha itu benar ada di desa dan datanya sesuai.
4. Tekan **Setujui**. Atau tekan **Tolak**, tulis alasannya (dibaca pendamping), lalu konfirmasi.

Verifikasi cukup sekali. Perubahan data setelahnya tidak perlu diverifikasi ulang, kecuali UMKM yang ditolak.

## Admin desa: menurunkan dan memulihkan UMKM

Gunakan bila ada masalah, misalnya laporan warga, data palsu, atau usaha sudah tutup.

1. Buka halaman UMKM, cari bagian **Tindakan admin desa**, lalu tekan **Turunkan**.
2. Tulis alasan (minimal 5 karakter; tercatat dan dibaca tim UMKM), lalu konfirmasi.
3. UMKM langsung hilang dari situs dan tidak bisa ditayangkan sampai dipulihkan.
4. Untuk membatalkan, tekan **Pulihkan**. UMKM kembali ke draf; tekan **Tayangkan** lagi bila sudah siap.

## Arti status

| Tanda di layar                 | Artinya                            | Yang perlu dilakukan                      |
| ------------------------------ | ---------------------------------- | ----------------------------------------- |
| **Menunggu verifikasi**        | Belum dicek admin desa             | Admin desa: Setujui atau Tolak            |
| **Ditolak**                    | Admin desa menolak, ada alasannya  | Pendamping: perbaiki lalu simpan          |
| **Terverifikasi** dan **Draf** | Sudah dicek, belum tampil di situs | Lengkapi syarat lalu Tayangkan            |
| **Tayang**                     | Tampil di situs                    | —                                         |
| **Diturunkan**                 | Disembunyikan admin desa           | Admin desa: Pulihkan bila masalah selesai |

## Pesan yang sering muncul

| Pesan                                                         | Artinya                                                                       |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Tidak bisa terhubung. Periksa sinyal internet lalu coba lagi. | Internet putus. Isian form tetap tersimpan di HP.                             |
| Sesi kamu berakhir. Silakan masuk lagi.                       | Sudah lama tidak dipakai; masuk lagi, kamu kembali ke halaman yang sama.      |
| Kamu tidak punya akses untuk melakukan ini.                   | Peranmu tidak mengizinkan tindakan itu (misalnya pendamping menekan Setujui). |
| Pemilik belum memberi persetujuan data (formulir UU PDP).     | Centang persetujuan di **Ubah data** setelah formulir ditandatangani.         |
| Isi nomor WhatsApp dulu agar pembeli bisa memesan.            | Nomor WhatsApp kosong.                                                        |
| UMKM ini sedang diturunkan oleh admin desa.                   | Hubungi admin desa.                                                           |

## Tips di lapangan

- Isi form saat bersama pemilik, supaya data dan tanda tangan persetujuan didapat sekaligus.
- Foto produk di tempat terang, latar polos, dari beberapa sisi. Fitur upload foto (belum tersedia) akan mengecilkan dan membersihkan
  lokasi GPS dari foto secara otomatis.
- Satu HP untuk banyak orang? Selalu tekan **Keluar** setelah selesai.
