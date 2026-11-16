# Glosarium (istilah ↔ nama di kode)

| Istilah                    | Nama di kode                       | Keterangan                                                                                           |
| -------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Desa                       | `village`                          | Tenant. Satu baris `villages`.                                                                       |
| UMKM                       | `business`                         | Usaha mikro/kecil milik warga desa.                                                                  |
| Produk                     | `product`                          | Barang yang dijual UMKM.                                                                             |
| Pemilik UMKM               | `owner` (business role)            | Pemilik asli usaha.                                                                                  |
| Pendamping UMKM            | `assistant` (business role)        | Mahasiswa/KKN yang mengelola UMKM atas nama pemilik.                                                 |
| Pendamping desa            | `village_assistant` (village role) | Pendamping yang boleh mendaftarkan UMKM baru di desa.                                                |
| Admin desa / BUMDes        | `village_admin` (village role)     | Mengelola desa, memverifikasi UMKM.                                                                  |
| Super admin                | `super_admin` (global role)        | Pengurus HIMA pengelola platform.                                                                    |
| Wilayah                    | `region`                           | Provinsi › kabupaten/kota › kecamatan › desa, kode Kemendagri.                                       |
| Kabupaten/kota             | `regency`                          | Level `regency`.                                                                                     |
| Kecamatan                  | `district`                         | Level `district`.                                                                                    |
| Verifikasi UMKM            | `verificationStatus`               | Dilakukan sekali oleh admin desa.                                                                    |
| Persetujuan publikasi      | `consentAt`                        | Persetujuan pemilik (UU PDP) sebelum data tayang.                                                    |
| Tayang / draf / arsip      | `published` / `draft` / `archived` | `record_status`.                                                                                     |
| Turunkan / pulihkan        | `takenDownAt`, `takedownReason`    | Admin desa menyembunyikan paksa UMKM dengan alasan; UMKM tidak bisa tayang sampai dipulihkan.        |
| Harga coret                | `compareAtPrice`                   | Harga normal sebelum promo; harus lebih tinggi dari `price`. Badge diskon dihitung dari keduanya.    |
| Gratis                     | `price = 0` (`isFree`)             | Produk tanpa harga, misalnya sampel atau layanan sosial. Harga berbayar minimal Rp100.               |
| Foto / logo / banner       | `media` target, `storageKey`       | File di Cloudflare R2; database menyimpan key-nya, bukan URL.                                        |
| Serah-terima akun          | invitation `businessRole = owner`  | Pendamping menyerahkan akun UMKM ke pemilik.                                                         |
| NIB                        | `nib`                              | Nomor Induk Berusaha (OSS), 13 digit.                                                                |
| Data demo                  | `isSeed`                           | Baris dari seed; dihapus dengan `db:seed:reset`.                                                     |
| Tema desa                  | `villages.theme`                   | Warna, font, gaya sudut, template. Draf di `theme_draft`, tayang setelah "Terapkan".                 |
| Template tampilan          | `template`                         | Tata letak halaman desa yang dibuat tim (sekarang: `classic`).                                       |
| Jam buka / tutup sementara | `openingHours` / `closedUntil`     | Status buka/tutup dihitung otomatis dari jadwal; "tutup sementara" menimpa jadwal sampai tanggalnya. |
| Panel pesanan              | `OrderPanel`                       | Jumlah + catatan, lalu tombol Pesan via WhatsApp ke penjual.                                         |
| Cap desa                   | `VillageSeal`                      | Cap bundar desa (logo di tengah) yang menjadi identitas desa di situs.                               |
