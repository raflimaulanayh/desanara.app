# Nara, maskot Desanara

Nara adalah karakter tunas padi dengan dua daun, sepatu warna bata, dan tas anyaman bambu. Padi menghubungkan
karakter dengan desa dan pertanian. Anyaman mengacu pada produk dari perajin seperti pembuat besek di Desa Baros.

| Pose                  | Penggunaan                         | Aset                                                                               |
| --------------------- | ---------------------------------- | ---------------------------------------------------------------------------------- |
| Memegang peta         | Halaman tidak ditemukan            | [nara-not-found.webp](../../packages/ui/src/assets/mascot/nara-not-found.webp)     |
| Mengecek ponsel       | Halaman atau daftar gagal dimuat   | [nara-unavailable.webp](../../packages/ui/src/assets/mascot/nara-unavailable.webp) |
| Memegang bakul kosong | Daftar atau hasil pencarian kosong | [nara-empty.webp](../../packages/ui/src/assets/mascot/nara-empty.webp)             |

Ketiga pose berbentuk WebP 384 × 384 px dengan latar transparan. Komponen `StatusMascot` di situs publik dan dashboard menampilkan
gambar di samping pesan dan aksi yang bisa dibaca pembaca layar. Gunakan pose di layar yang membutuhkan pemulihan
atau langkah berikutnya. Untuk layar peta, simpan ruang bagi peta dan navigasinya.

## Pembuatan aset

Aset dibuat dengan ImageGen bawaan. Pose peta menjadi referensi karakter untuk kedua pose berikutnya.

### Halaman tidak ditemukan

```text
Use case: illustration-story. Create the first production pose of an original Desanara mascot named Nara, for an Indonesian village marketplace's 404 screen. On genuinely transparent background. Nara is a small, sturdy rice-sprout character with a single warm cream rice-grain-shaped head and torso, round dark forest-green eyes, a simple small mouth, two broad asymmetric green leaf blades growing from the crown (one tall curved left leaf and one short sweeping right leaf), mitten-like cream hands, short terracotta boots, and a warm woven-bamboo crossbody pouch. The distinctive rice shape, leaves, and pouch are the identity. Nara holds a small opened ivory trail map at belly height, glancing down with lifted eyebrows and a gently puzzled, confident expression, taking a small step. Render as a crisp modern editorial mascot, with softly rounded geometry, precise dark-green linework, mostly flat color, controlled very subtle shadow only within the character, tasteful basket crosshatch and nothing tiny or noisy. Inspired by the warm Desanara brand palette of forest green #235239, brand green #387B4C, leaf #6CAC4E, warm cream #F9F4E7, golden straw #E3A84F, and terracotta #C2612C. Full body, centered in square, with tidy narrow equal transparent margin, compact silhouette legible at 100px. Single isolated character, no external scenery, floor, cast shadows, halo, captions, text, numbers, logos, border, or watermark.
```

### Gagal memuat

```text
Use case: identity-preserve. Draw a matching new pose of the exact Desanara rice-sprout mascot in the reference image, for a temporarily unavailable screen. Keep both asymmetrical green leaves, warm cream rice-grain body, dark forest green precise outlines and dark oval eyes, terracotta boots, and the straw-colored woven crossbody pouch recognizable, with the same style and proportions. Replace the trail map with a small dark forest green smartphone held in one hand, bearing a single bold cream Wi-Fi line glyph crossed by a small warm clay slash. Nara looks at the phone with gentle concern and raises the free mitten hand in a small reassuring gesture. Both boots grounded, character stays full body in square crop with a little transparent margin and one clear readable silhouette. Isolated sprite on genuinely transparent background. No words, numerals, halo, scene, external floating icons, cast shadow, or watermark.
```

### Data kosong

```text
Use case: identity-preserve. Draw a matching new pose of the exact Desanara rice-sprout mascot in the reference image, for an empty marketplace catalogue. Match the two asymmetric green leaves, the cream rice grain body, dark green fine graphic outline and dark oval eyes, terracotta boots, and golden woven crossbody pouch, with the same style and proportions. Replace the map with a small open, simply woven bamboo market basket held in both mitten hands at waist height, tilted towards us so the empty interior is clearly visible. Add a calm slightly curious expression with one raised eyebrow. Full body from leaves to boots, square framing with a little transparent margin, crisp at 96px. Single character isolated on a genuinely transparent background, with no loose objects, scenery, halo, lettering, numerals, cast shadow, or watermark.
```
