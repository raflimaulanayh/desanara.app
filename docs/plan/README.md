# Plan

Plan adalah dokumen hidup yang disetujui **sebelum** implementasi dan menjadi bahan serah-terima selama pekerjaan berjalan.

## Kapan wajib

- Fitur besar atau yang menyentuh lebih dari satu app/package
- Perubahan skema database, auth/role, kontrak API, atau komponen bersama
- Sekumpulan fitur kecil yang dikirim bersama

## Aturan

- Nama file: `PLAN-<fitur>.md`, mulai dari [TEMPLATE.md](TEMPLATE.md).
- Persetujuan mencakup app, route, role, perilaku, dan dependensi yang tertulis. Perluasan besar = update plan + persetujuan ulang.
- Perbarui status, keputusan, dan hasil validasi selama pengerjaan. Jangan pakai folder ini untuk catatan acak.
- Agent AI: baca plan terkait sebelum mengubah kode, dan perbarui bagian "Revision notes" saat selesai.

## Daftar plan

| Plan                                               | Status                                                 |
| -------------------------------------------------- | ------------------------------------------------------ |
| [PLAN-mvp-seminar.md](PLAN-mvp-seminar.md)         | Disetujui 2026-11-01 — fondasi selesai, fitur berjalan |
| [PLAN-village-theming.md](PLAN-village-theming.md) | Disetujui 2026-11-01 — fondasi selesai, UI menyusul    |
