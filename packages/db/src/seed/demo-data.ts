import type { CategorySlug } from './reference-data'

/**
 * DEMO DATA — fictional villages, businesses and people for the seminar demo.
 * Every row inserted from here is flagged `is_seed = true` and removed by `db:seed:reset`.
 * Names are made up; any resemblance to real businesses is coincidental.
 */

export const DEMO_PASSWORD = 'demo12345'
export const DEMO_EMAIL_DOMAIN = 'demo.desanara.test'

export interface DemoProduct {
  slug: string
  name: string
  en?: string
  category: CategorySlug
  price: number
  description: string
}

/** Weekly hours, shape = OpeningHours in @repo/validators. */
export type DemoHours = Partial<
  Record<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun', { open: string; close: string }[]>
>

export interface DemoBusiness {
  hours?: DemoHours
  /** Days from now the business is "tutup sementara" (demo of the override). */
  closedForDays?: { days: number; note: string }
  slug: string
  name: string
  ownerName: string
  description: string
  verified: boolean
  products: DemoProduct[]
}

export interface DemoVillage {
  /** Branding shown at the demo; shape = VillageTheme in @repo/validators. */
  theme: { version: 1; template: 'classic'; accent: string; font: string; radius: string }
  /** Keys under the media base URL (apps/web/public/media locally, R2 in production). */
  logoKey?: string
  bannerKey?: string
  /** True for a real partner village (only its businesses/products are demo). */
  isRealVillage?: boolean
  slug: string
  name: string
  regionCode: string
  description: string
  businesses: DemoBusiness[]
}

const weekdaysOnly = (open: string, close: string): DemoHours => ({
  mon: [{ open, close }],
  tue: [{ open, close }],
  wed: [{ open, close }],
  thu: [{ open, close }],
  fri: [{ open, close }],
  sat: [{ open, close }],
})
const everyDay = (open: string, close: string): DemoHours => ({
  ...weekdaysOnly(open, close),
  sun: [{ open, close }],
})

/** Size and packaging are part of the name, like marketplace titles (no separate unit field). */
const p = (
  slug: string,
  name: string,
  category: CategorySlug,
  price: number,
  description: string,
  en?: string,
): DemoProduct => ({ slug, name, category, price, description, en })

/**
 * Demo promos (product slug → normal price shown struck through), so the seminar shows the
 * "-X%" badge. Only demo data: real UMKM fill this in themselves.
 */
export const demoCompareAtPrices: Record<string, number> = {
  'keripik-singkong-balado': 20000,
  'syal-batik': 120000,
}

export const demoVillages: DemoVillage[] = [
  {
    theme: {
      version: 1,
      template: 'classic',
      accent: '#0e7490',
      font: 'barlow-condensed',
      radius: 'sharp',
    },
    logoKey: 'seed/villages/baros/logo.webp',
    bannerKey: 'seed/villages/baros/banner.webp',
    isRealVillage: true,
    slug: 'baros',
    name: 'Desa Baros',
    /** Real Kemendagri village code: Baros, Kec. Arjasari, Kab. Bandung. */
    regionCode: '32.04.16.2005',
    description:
      'Desa di Kecamatan Arjasari, Kabupaten Bandung, Jawa Barat — desa pilot program Desanara bersama HIMA Sistem Informasi SATU University.',
    businesses: [
      {
        hours: everyDay('07:00', '17:00'),
        slug: 'keripik-bu-ani',
        name: 'Keripik Bu Ani',
        ownerName: 'Ani Suryani',
        description:
          'Keripik singkong renyah dari singkong lokal, digoreng setiap pagi tanpa pengawet.',
        verified: true,
        products: [
          p(
            'keripik-singkong-original',
            'Keripik Singkong Original 250 gr',
            'makanan-camilan',
            15000,
            'Gurih asin, renyah, tanpa MSG.',
            'Original Cassava Chips 250 g',
          ),
          p(
            'keripik-singkong-balado',
            'Keripik Singkong Balado 250 gr',
            'makanan-camilan',
            17000,
            'Bumbu balado pedas manis khas rumahan.',
            'Spicy Balado Cassava Chips 250 g',
          ),
          p(
            'opak-bakar',
            'Opak Bakar (isi 10)',
            'makanan-camilan',
            12000,
            'Opak beras ketan dibakar arang.',
          ),
          p(
            'rengginang-terasi',
            'Rengginang Terasi 300 gr',
            'makanan-camilan',
            20000,
            'Rengginang ketan dengan aroma terasi.',
          ),
        ],
      },
      {
        hours: everyDay('08:00', '21:00'),
        slug: 'kopi-gunung-baros',
        name: 'Kopi Gunung Baros',
        ownerName: 'Dedi Kurnia',
        description: 'Kopi arabika petik merah dari kebun warga, disangrai dalam jumlah kecil.',
        verified: true,
        products: [
          p(
            'arabika-biji-200g',
            'Kopi Arabika Biji 200 gr',
            'minuman',
            65000,
            'Roasting medium, catatan rasa gula aren dan jeruk.',
            'Arabica Coffee Beans 200 g',
          ),
          p(
            'arabika-bubuk-200g',
            'Kopi Arabika Bubuk 200 gr',
            'minuman',
            60000,
            'Giling sedang, cocok untuk tubruk dan V60.',
            'Ground Arabica Coffee 200 g',
          ),
          p(
            'kopi-susu-gula-aren',
            'Kopi Susu Gula Aren 1 Liter',
            'minuman',
            85000,
            'Kopi susu siap minum, tahan 3 hari di kulkas.',
          ),
        ],
      },
      {
        hours: weekdaysOnly('08:00', '16:00'),
        slug: 'anyaman-bambu-pak-ujang',
        name: 'Anyaman Bambu Pak Ujang',
        ownerName: 'Ujang Saepudin',
        description: 'Kerajinan anyaman bambu buatan tangan untuk dapur dan dekorasi rumah.',
        verified: true,
        products: [
          p(
            'besek-bambu-isi-10',
            'Besek Bambu (isi 10)',
            'kerajinan',
            35000,
            'Wadah besek ramah lingkungan untuk hampers dan nasi kotak.',
            'Bamboo Boxes (10 pcs)',
          ),
          p(
            'tudung-saji-bambu',
            'Tudung Saji Bambu',
            'kerajinan',
            75000,
            'Diameter 50 cm, anyaman rapat.',
          ),
          p(
            'lampu-hias-bambu',
            'Lampu Hias Bambu',
            'kerajinan',
            120000,
            'Kap lampu gantung motif anyaman kepang.',
            'Bamboo Pendant Lamp',
          ),
          p(
            'keranjang-bambu',
            'Keranjang Bambu Serbaguna',
            'kerajinan',
            45000,
            'Untuk buah, roti, atau perlengkapan rumah.',
          ),
        ],
      },
      {
        slug: 'madu-hutan-baros',
        name: 'Madu Hutan Baros',
        ownerName: 'Siti Rahmawati',
        description: 'Madu hutan murni dari peternak lebah kelompok tani desa.',
        verified: true,
        products: [
          p(
            'madu-hutan-250ml',
            'Madu Hutan 250 ml',
            'peternakan-perikanan',
            55000,
            'Madu murni, tidak dicampur gula.',
            'Wild Forest Honey 250 ml',
          ),
          p(
            'madu-hutan-500ml',
            'Madu Hutan 500 ml',
            'peternakan-perikanan',
            100000,
            'Ukuran keluarga.',
          ),
        ],
      },
      {
        hours: everyDay('05:00', '10:00'),
        slug: 'sayur-segar-kelompok-tani',
        name: 'Sayur Segar Kelompok Tani',
        ownerName: 'Asep Hidayat',
        description: 'Sayuran organik dipanen sesuai pesanan dari kelompok tani desa.',
        verified: false,
        products: [
          p(
            'paket-sayur-mingguan',
            'Paket Sayur Mingguan ± 3 kg',
            'hasil-tani',
            50000,
            'Isi menyesuaikan musim panen.',
            'Weekly Vegetable Box (about 3 kg)',
          ),
          p('cabai-rawit-1kg', 'Cabai Rawit Merah 1 kg', 'hasil-tani', 45000, 'Dipetik pagi hari.'),
        ],
      },
      {
        hours: everyDay('08:00', '17:00'),
        closedForDays: { days: 3, note: 'Sedang mengikuti pameran di kota' },
        slug: 'dodol-ibu-euis',
        name: 'Dodol Ibu Euis',
        ownerName: 'Euis Komalasari',
        description: 'Dodol ketan resep turun-temurun, diaduk manual selama 8 jam.',
        verified: true,
        products: [
          p(
            'dodol-ketan-original',
            'Dodol Ketan Original 500 gr',
            'makanan-camilan',
            25000,
            'Legit, kenyal, wangi pandan.',
            'Sticky Rice Dodol 500 g',
          ),
          p(
            'dodol-durian',
            'Dodol Durian 500 gr',
            'makanan-camilan',
            35000,
            'Dengan durian lokal asli.',
          ),
          p(
            'wajit-daun-jagung',
            'Wajit Daun Jagung (isi 20)',
            'makanan-camilan',
            22000,
            'Dibungkus daun jagung kering.',
          ),
        ],
      },
      {
        hours: weekdaysOnly('07:00', '15:00'),
        slug: 'telur-asin-mang-oding',
        name: 'Telur Asin Mang Oding',
        ownerName: 'Oding Sobari',
        description: 'Telur bebek asin masir dari peternakan sendiri.',
        verified: true,
        products: [
          p(
            'telur-asin-isi-10',
            'Telur Asin (isi 10)',
            'peternakan-perikanan',
            40000,
            'Masir, tidak terlalu asin.',
            'Salted Duck Eggs (10 pcs)',
          ),
          p(
            'telur-asin-bakar',
            'Telur Asin Bakar (isi 10)',
            'peternakan-perikanan',
            45000,
            'Dipanggang setelah diasinkan, aroma smoky.',
          ),
        ],
      },
    ],
  },
  {
    theme: { version: 1, template: 'classic', accent: '#b23a1e', font: 'bitter', radius: 'sharp' },
    slug: 'mekarwangi',
    name: 'Desa Mekarwangi',
    regionCode: '32.05.04.2010',
    description: '(Data demo) Desa sentra kulit dan dodol dengan banyak perajin rumahan.',
    businesses: [
      {
        hours: weekdaysOnly('09:00', '17:00'),
        slug: 'kulit-mekarwangi',
        name: 'Kulit Mekarwangi',
        ownerName: 'Hendra Gunawan',
        description: 'Produk kulit sapi asli dijahit tangan oleh perajin desa.',
        verified: true,
        products: [
          p(
            'dompet-kulit-pria',
            'Dompet Kulit Pria',
            'fesyen',
            150000,
            'Kulit sapi asli, 6 slot kartu.',
            'Men’s Leather Wallet',
          ),
          p(
            'sabuk-kulit',
            'Sabuk Kulit',
            'fesyen',
            175000,
            'Gesper kuningan, lebar 3,5 cm.',
            'Leather Belt',
          ),
          p(
            'tas-selempang-kulit',
            'Tas Selempang Kulit',
            'fesyen',
            350000,
            'Ukuran 22 × 18 cm, tali bisa diatur.',
          ),
        ],
      },
      {
        hours: everyDay('06:00', '14:00'),
        slug: 'jeruk-garut-pak-darma',
        name: 'Jeruk Pak Darma',
        ownerName: 'Darma Wijaya',
        description: 'Jeruk keprok manis dari kebun keluarga.',
        verified: true,
        products: [
          p(
            'jeruk-keprok-1kg',
            'Jeruk Keprok 1 kg',
            'hasil-tani',
            30000,
            'Manis segar, kulit mudah dikupas.',
            'Tangerines 1 kg',
          ),
          p(
            'jeruk-keprok-5kg',
            'Jeruk Keprok 5 kg',
            'hasil-tani',
            135000,
            'Hemat untuk keluarga atau oleh-oleh.',
          ),
        ],
      },
      {
        hours: weekdaysOnly('09:00', '16:00'),
        slug: 'batik-tulis-mekarwangi',
        name: 'Batik Tulis Mekarwangi',
        ownerName: 'Nining Kartika',
        description: 'Batik tulis motif flora lokal dengan pewarna alam.',
        verified: true,
        products: [
          p(
            'kain-batik-tulis',
            'Kain Batik Tulis 2 m',
            'fesyen',
            450000,
            'Katun primisima, pewarna alam.',
            'Hand-drawn Batik Cloth 2 m',
          ),
          p('syal-batik', 'Syal Batik', 'fesyen', 95000, 'Bahan sutra ATBM.'),
          p(
            'masker-kain-batik',
            'Masker Kain Batik (isi 3)',
            'fesyen',
            30000,
            '3 lapis, bisa dicuci.',
          ),
        ],
      },
      {
        hours: everyDay('08:00', '20:00'),
        slug: 'abon-ikan-mas',
        name: 'Abon Ikan Mas Bu Lilis',
        ownerName: 'Lilis Suryati',
        description: 'Abon dari ikan mas kolam desa, tanpa pengawet.',
        verified: true,
        products: [
          p(
            'abon-ikan-original',
            'Abon Ikan Mas Original 150 gr',
            'peternakan-perikanan',
            35000,
            'Gurih, cocok untuk lauk anak.',
            'Shredded Carp Floss 150 g',
          ),
          p(
            'abon-ikan-pedas',
            'Abon Ikan Mas Pedas 150 gr',
            'peternakan-perikanan',
            37000,
            'Level pedas sedang.',
          ),
        ],
      },
      {
        hours: everyDay('16:00', '23:00'),
        slug: 'bandrek-mekarwangi',
        name: 'Bandrek Mekarwangi',
        ownerName: 'Iwan Setiawan',
        description: 'Minuman rempah hangat khas Sunda dalam bentuk serbuk dan cair.',
        verified: false,
        products: [
          p(
            'bandrek-serbuk',
            'Bandrek Serbuk (isi 10 sachet)',
            'minuman',
            25000,
            'Jahe merah, gula aren, kayu manis.',
            'Instant Bandrek (10 sachets)',
          ),
          p(
            'bajigur-serbuk',
            'Bajigur Serbuk (isi 10 sachet)',
            'minuman',
            25000,
            'Santan dan gula aren.',
          ),
        ],
      },
    ],
  },
  {
    theme: {
      version: 1,
      template: 'classic',
      accent: '#2e7d32',
      font: 'nunito',
      radius: 'rounded',
    },
    slug: 'sindangjaya',
    name: 'Desa Sindangjaya',
    regionCode: '32.03.28.2007',
    description: '(Data demo) Desa penghasil tahu, ubi cilembu, dan kerajinan kayu.',
    businesses: [
      {
        hours: everyDay('06:00', '22:00'),
        slug: 'tahu-sindangjaya',
        name: 'Tahu Sindangjaya',
        ownerName: 'Cecep Supriatna',
        description: 'Tahu kuning dan tahu goreng khas dengan resep keluarga sejak 1985.',
        verified: true,
        products: [
          p(
            'tahu-goreng-isi-20',
            'Tahu Goreng (isi 20)',
            'makanan-camilan',
            25000,
            'Kulit renyah, dalam lembut, plus cabai rawit.',
            'Fried Tofu (20 pcs)',
          ),
          p(
            'tahu-kuning-isi-10',
            'Tahu Kuning Mentah (isi 10)',
            'makanan-camilan',
            15000,
            'Untuk dimasak sendiri di rumah.',
          ),
        ],
      },
      {
        hours: everyDay('07:00', '18:00'),
        slug: 'ubi-madu-pak-endang',
        name: 'Ubi Madu Pak Endang',
        ownerName: 'Endang Sutisna',
        description: 'Ubi madu oven yang manisnya keluar sendiri.',
        verified: true,
        products: [
          p(
            'ubi-mentah-5kg',
            'Ubi Madu Mentah 5 kg',
            'hasil-tani',
            60000,
            'Disimpan 2 minggu agar makin manis.',
            'Sweet Potatoes 5 kg',
          ),
          p(
            'ubi-oven-1kg',
            'Ubi Madu Oven 1 kg',
            'makanan-camilan',
            35000,
            'Siap makan, legit bermadu.',
          ),
          p('keripik-ubi', 'Keripik Ubi Ungu 200 gr', 'makanan-camilan', 18000, 'Tanpa pewarna.'),
        ],
      },
      {
        hours: weekdaysOnly('08:00', '16:00'),
        slug: 'ukir-kayu-sindangjaya',
        name: 'Ukir Kayu Sindangjaya',
        ownerName: 'Yayan Ruhiyat',
        description: 'Ukiran dan peralatan dapur dari kayu mahoni dan jati.',
        verified: true,
        products: [
          p(
            'talenan-kayu-jati',
            'Talenan Kayu Jati',
            'kerajinan',
            85000,
            'Ukuran 35 × 25 cm, finishing food grade.',
            'Teak Cutting Board',
          ),
          p(
            'sendok-kayu-set',
            'Set Sendok Kayu (isi 5)',
            'kerajinan',
            50000,
            'Sendok, spatula, dan centong.',
          ),
          p(
            'hiasan-dinding-ukir',
            'Hiasan Dinding Ukir',
            'kerajinan',
            250000,
            'Motif daun dan burung, 60 × 30 cm.',
          ),
        ],
      },
      {
        hours: everyDay('08:00', '17:00'),
        slug: 'sale-pisang-bu-entin',
        name: 'Sale Pisang Bu Entin',
        ownerName: 'Entin Rostiana',
        description: 'Sale pisang basah dan goreng dari pisang ambon kebun sendiri.',
        verified: true,
        products: [
          p(
            'sale-pisang-basah',
            'Sale Pisang Basah 250 gr',
            'makanan-camilan',
            20000,
            'Dijemur matahari 4 hari.',
            'Dried Banana 250 g',
          ),
          p(
            'sale-pisang-goreng',
            'Sale Pisang Goreng 250 gr',
            'makanan-camilan',
            22000,
            'Dibalut tepung renyah.',
          ),
        ],
      },
    ],
  },
]

/**
 * Sample photos per product slug, in gallery order. Keys are under the media base URL
 * (apps/web/public/media locally, R2 in production): the first photo is the cover. Wikimedia Commons stock
 * photos; source and licence sit in the .json next to each file and in CREDITS.md. `*-detail` files are
 * tighter crops of the photo with the same name. Process shots come from the village stories.
 */
const photo = (name: string) => `seed/products/${name}.webp`
const story = (name: string) => `seed/stories/${name}.webp`

export const productPhotos: Record<string, string[]> = {
  'keripik-singkong-original': [
    photo('chips-a'),
    story('cassava-frying'),
    story('cassava-packing'),
  ],
  'keripik-singkong-balado': [photo('chips-b'), story('cassava-ready'), story('cassava-frying')],
  'opak-bakar': [photo('opak-whole'), photo('opak')],
  'rengginang-terasi': [photo('rengginang'), photo('rengginang-bowl')],
  'arabika-biji-200g': [photo('coffee-beans'), story('coffee-roasting'), story('coffee-brewing')],
  'arabika-bubuk-200g': [photo('coffee-ground'), story('coffee-brewing'), story('coffee-roasting')],
  'kopi-susu-gula-aren': [photo('coffee-iced'), story('coffee-ready')],
  'besek-bambu-isi-10': [photo('besek'), story('bamboo-finished'), story('bamboo-weaving')],
  'tudung-saji-bambu': [photo('besek-trays'), story('bamboo-weaving'), story('bamboo-detail')],
  'lampu-hias-bambu': [photo('lamp'), story('bamboo-detail')],
  'keranjang-bambu': [photo('basket'), story('bamboo-weaving')],
  'paket-sayur-mingguan': [photo('vegetables'), photo('vegetables-market')],
  'cabai-rawit-1kg': [photo('chili'), photo('chili-plant')],
  'madu-hutan-250ml': [photo('honey-a'), story('garden-honey')],
  'madu-hutan-500ml': [photo('honey-b'), story('garden-honey')],
  'dodol-ketan-original': [photo('dodol'), story('dodol')],
  'dodol-durian': [story('dodol'), photo('dodol')],
  'wajit-daun-jagung': [photo('wajit'), photo('wajit-slice')],
  'telur-asin-isi-10': [photo('egg-salted'), story('salted-eggs')],
  'telur-asin-bakar': [photo('egg-brown'), story('salted-eggs')],
  'dompet-kulit-pria': [photo('wallet'), story('leather-wallet')],
  'sabuk-kulit': [photo('belt'), photo('belt-detail')],
  'tas-selempang-kulit': [photo('bag'), photo('bag-detail')],
  'jeruk-keprok-1kg': [photo('tangerine'), photo('tangerine-detail')],
  'jeruk-keprok-5kg': [photo('tangerine-detail'), photo('tangerine')],
  'kain-batik-tulis': [photo('batik'), photo('batik-detail')],
  'syal-batik': [photo('batik-green'), photo('batik-green-detail')],
  'masker-kain-batik': [photo('batik-detail'), photo('batik-green-detail')],
  'abon-ikan-original': [photo('abon-a'), photo('abon-a-detail')],
  'abon-ikan-pedas': [photo('abon-b'), photo('abon-b-detail')],
  'bandrek-serbuk': [photo('bandrek'), story('ginger-bandrek')],
  'bajigur-serbuk': [photo('bajigur'), photo('bajigur-cups')],
  'tahu-goreng-isi-20': [photo('tofu-fried'), photo('tofu-fried-b')],
  'tahu-kuning-isi-10': [photo('tofu-yellow'), photo('tofu-fried-b')],
  'ubi-oven-1kg': [photo('ubi-roasted'), photo('ubi-roasted-detail')],
  'ubi-mentah-5kg': [photo('ubi-raw-b'), photo('ubi-raw')],
  'keripik-ubi': [photo('ubi-chips'), story('sweet-potato-chips')],
  'talenan-kayu-jati': [photo('board'), photo('board-detail')],
  'sendok-kayu-set': [photo('spoons'), story('wooden-spoons')],
  'hiasan-dinding-ukir': [photo('carving'), photo('carving-detail')],
  'sale-pisang-basah': [photo('sale-a'), story('dried-banana')],
  'sale-pisang-goreng': [photo('sale-b'), story('dried-banana')],
}
