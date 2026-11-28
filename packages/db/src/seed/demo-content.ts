/**
 * Long product descriptions (ID + EN) and buyer reviews for the seeded products.
 * Keyed by the full public product slug `${business.slug}-${product.slug}`.
 */

export interface DemoReview {
  name: string
  rating: 1 | 2 | 3 | 4 | 5
  body: string
  locale: 'id' | 'en'
  daysAgo: number
  reply?: string
  status?: 'pending'
}

export interface DemoProductContent {
  description: string
  descriptionEn: string
  reviews: DemoReview[]
}

/** Keyed by the full public product slug `${business.slug}-${product.slug}`. */
export const demoProductContent: Record<string, DemoProductContent> = {
  // Desa Baros: Keripik Bu Ani
  'keripik-bu-ani-keripik-singkong-original': {
    description:
      'Keripik singkong original ini kami buat dari singkong yang dicabut dari kebun warga Baros, lalu dikupas, diiris tipis, dan digoreng setiap pagi di dapur kami. Bumbunya cuma garam dan bawang putih, tanpa MSG dan tanpa pengawet.\n\nRasanya gurih asin yang pas, teksturnya renyah dan tidak keras. Satu kemasan berisi 250 gram, cukup untuk camilan keluarga atau teman ngopi sore.\n\nSetelah dibuka, simpan di toples tertutup supaya tetap renyah. Paling enak dihabiskan dalam dua minggu. Kalau mau pesan banyak untuk acara atau oleh-oleh, tanya stok dulu lewat WhatsApp ya.',
    descriptionEn:
      "These original cassava chips are made from cassava pulled from Baros villagers' gardens, then peeled, thinly sliced and fried every morning in our kitchen. The seasoning is just salt and garlic, with no MSG and no preservatives.\n\nThey taste nicely salty and savoury, crunchy without being hard. Each pack holds 250 grams, enough as a family snack or alongside afternoon coffee.\n\nOnce opened, keep them in an airtight jar so they stay crisp. They are best finished within two weeks. For larger orders for events or gifts, please check stock with us on WhatsApp first.",
    reviews: [
      {
        name: 'Rina Septiani',
        rating: 5,
        body: 'Renyah banget dan asinnya pas, nggak bikin seret. Anak saya habis satu bungkus sendirian.',
        locale: 'id',
        daysAgo: 12,
        reply: 'Terima kasih Teh Rina, salam buat si kecil ya.',
      },
      {
        name: 'Agus Pratama',
        rating: 5,
        body: 'Rasa singkongnya masih kerasa, beda sama keripik pabrikan. Pengiriman ke Bandung cuma sehari.',
        locale: 'id',
        daysAgo: 25,
      },
      {
        name: 'Dewi Lestiani',
        rating: 4,
        body: 'Enak dan gurih. Ada beberapa keping yang agak tebal, tapi tetap renyah.',
        locale: 'id',
        daysAgo: 40,
      },
      {
        name: 'Hannah W.',
        rating: 5,
        body: 'Simple and really crunchy, not greasy at all. Bu Ani replied on WhatsApp within minutes.',
        locale: 'en',
        daysAgo: 63,
      },
      {
        name: 'Ujang Firmansyah',
        rating: 4,
        body: 'Cocok buat teman ngopi. Kemasannya standar plastik, semoga nanti ada ziplock biar gampang disimpan.',
        locale: 'id',
        daysAgo: 88,
        reply: 'Masukannya kami catat, Kang. Sedang kami coba kemasan ziplock.',
      },
    ],
  },
  'keripik-bu-ani-keripik-singkong-balado': {
    description:
      'Ini keripik singkong yang sama dengan varian original, lalu kami balur bumbu balado buatan sendiri. Bumbunya dari cabai merah, bawang merah, sedikit gula, dan garam yang ditumis sampai kental, jadi rasanya pedas manis khas rumahan.\n\nPedasnya sedang, masih bisa dinikmati yang tidak terlalu kuat makan pedas. Isi 250 gram per kemasan, bumbunya menempel rata di setiap keping.\n\nSimpan di tempat kering dan tertutup, jauhkan dari sinar matahari langsung. Kalau ingin versi lebih pedas untuk pesanan banyak, bisa diobrolkan lewat WhatsApp.',
    descriptionEn:
      'These are the same cassava chips as our original, coated in balado seasoning we make ourselves. The paste is red chilli, shallots, a little sugar and salt, cooked down until thick, so the taste is a homestyle sweet and spicy.\n\nThe heat is medium, still easy for people who do not eat very spicy food. Each pack holds 250 grams and the seasoning sticks evenly to every chip.\n\nKeep the pack dry and closed, away from direct sunlight. If you would like an extra spicy batch for a large order, just talk to us on WhatsApp.',
    reviews: [
      {
        name: 'Siti Nurjanah',
        rating: 5,
        body: 'Baladonya juara, pedas manisnya seimbang. Sekarang jadi stok wajib di rumah.',
        locale: 'id',
        daysAgo: 6,
      },
      {
        name: 'Rudi Hermawan',
        rating: 4,
        body: 'Enak, bumbunya banyak. Buat saya kurang pedas sedikit, mungkin lain kali minta yang lebih pedas.',
        locale: 'id',
        daysAgo: 19,
        reply: 'Siap Kang Rudi, nanti pesan lewat WA saja, kami buatkan level lebih pedas.',
      },
      {
        name: 'Neng Yuli',
        rating: 5,
        body: 'Pas lagi promo jadi beli tiga bungkus. Renyah, bumbunya nggak cuma di permukaan.',
        locale: 'id',
        daysAgo: 33,
      },
      {
        name: 'Fajar Nugraha',
        rating: 3,
        body: 'Rasanya enak, tapi satu bungkus yang saya terima agak lembek di bagian bawah. Mungkin kena udara saat pengiriman.',
        locale: 'id',
        daysAgo: 57,
        reply: 'Mohon maaf Kang Fajar. Kemasan sekarang kami tambah lapisan supaya lebih rapat.',
      },
      {
        name: 'Tini Suhartini',
        rating: 5,
        body: 'Beli buat oleh-oleh ke Jakarta, saudara pada suka. Packing rapi pakai kardus.',
        locale: 'id',
        daysAgo: 4,
        status: 'pending',
      },
      {
        name: 'Mark T.',
        rating: 4,
        body: 'Sweet and spicy in a good way. A bit messy on the fingers, but worth it.',
        locale: 'en',
        daysAgo: 102,
      },
    ],
  },
  'keripik-bu-ani-opak-bakar': {
    description:
      'Opak bakar kami terbuat dari beras ketan yang dikukus, ditumbuk, dibentuk bulat tipis, lalu dijemur sampai kering. Setelah itu opak dibakar di atas arang satu per satu, jadi ada aroma bakaran yang khas dan rasanya gurih ringan.\n\nSatu bungkus berisi 10 lembar opak dengan diameter kurang lebih sejengkal tangan. Teksturnya renyah dan sedikit mengembang setelah dibakar.\n\nSimpan di wadah kedap udara karena opak cepat melempem kalau kena angin. Enak dimakan langsung atau dicocol sambal oncom.',
    descriptionEn:
      'Our grilled opak is made from glutinous rice that is steamed, pounded, shaped into thin rounds and sun dried. Each piece is then grilled over charcoal one at a time, which gives it a distinct smoky aroma and a light savoury taste.\n\nEach bag holds 10 pieces, roughly a hand span across. They are crisp and puff up a little after grilling.\n\nKeep them in an airtight container, as opak goes soft quickly when exposed to air. Eat them straight away or dip them in oncom sambal.',
    reviews: [
      {
        name: 'Euis Rohaeti',
        rating: 5,
        body: 'Aroma arangnya kerasa, persis opak jaman kecil di kampung. Renyah sekali.',
        locale: 'id',
        daysAgo: 15,
      },
      {
        name: 'Dadan Ramdani',
        rating: 4,
        body: 'Enak dan gurih. Ada dua lembar yang patah waktu sampai, tapi masih bisa dimakan.',
        locale: 'id',
        daysAgo: 46,
        reply: 'Hatur nuhun Kang Dadan, ke depan kami bungkus pakai kardus supaya tidak patah.',
      },
      {
        name: 'Lina Marlina',
        rating: 5,
        body: 'Murah dan isinya banyak. Cocok buat cemilan pas hujan.',
        locale: 'id',
        daysAgo: 71,
      },
      {
        name: 'Andri Kusuma',
        rating: 4,
        body: 'Rasanya polos gurih, pas dicocol sambal. Harus cepat dihabiskan karena gampang melempem.',
        locale: 'id',
        daysAgo: 120,
      },
    ],
  },
  'keripik-bu-ani-rengginang-terasi': {
    description:
      'Rengginang terasi ini dibuat dari beras ketan pilihan yang dikukus, dibumbui terasi, bawang putih, dan garam, lalu dicetak bulat dan dijemur dua sampai tiga hari sampai benar-benar kering.\n\nKemasan 300 gram berisi rengginang mentah yang siap Anda goreng sendiri. Begitu digoreng, rengginang mengembang, renyah, dan wangi terasinya keluar.\n\nGoreng dengan minyak panas dan api sedang sebentar saja, angkat begitu mengembang. Rengginang mentah tahan lama asal disimpan di tempat kering dan tertutup.',
    descriptionEn:
      'This shrimp paste rengginang is made from selected glutinous rice that is steamed, seasoned with terasi, garlic and salt, shaped into rounds and sun dried for two to three days until fully dry.\n\nThe 300 gram pack contains uncooked rengginang for you to fry at home. Once fried they puff up, turn crunchy and release their terasi aroma.\n\nFry briefly in hot oil over medium heat and lift them out as soon as they puff. Uncooked rengginang keeps for a long time if stored somewhere dry and closed.',
    reviews: [
      {
        name: 'Bu Nenden',
        rating: 5,
        body: 'Mengembangnya bagus, wangi terasinya pas tidak menyengat. Langsung pesan lagi buat lebaran.',
        locale: 'id',
        daysAgo: 9,
        reply: 'Hatur nuhun Bu Nenden, untuk lebaran kabari dari jauh hari ya supaya stoknya aman.',
      },
      {
        name: 'Yogi Saputra',
        rating: 4,
        body: 'Enak, tapi saya kira sudah matang ternyata mentah. Untung digorengnya gampang.',
        locale: 'id',
        daysAgo: 37,
      },
      {
        name: 'Rahmat Hidayat',
        rating: 5,
        body: 'Rengginang paling enak yang pernah saya beli online. Keringnya merata.',
        locale: 'id',
        daysAgo: 52,
      },
      {
        name: 'Sarah L.',
        rating: 4,
        body: 'Fried them at home and they puffed up nicely. Strong shrimp paste smell while frying, tasty though.',
        locale: 'en',
        daysAgo: 95,
      },
      {
        name: 'Ai Kurniasih',
        rating: 5,
        body: 'Ukurannya seragam, renyah setelah digoreng. Admin ramah jawab pertanyaan cara menggoreng.',
        locale: 'id',
        daysAgo: 140,
      },
    ],
  },

  // Desa Baros: Kopi Gunung Baros
  'kopi-gunung-baros-arabika-biji-200g': {
    description:
      'Biji kopi arabika ini berasal dari kebun warga di lereng gunung sekitar Baros. Kami hanya memetik buah yang sudah merah, lalu diproses dan dijemur sendiri sebelum disangrai dalam jumlah kecil supaya tingkat sangrainya terjaga.\n\nTingkat sangrai medium, dengan catatan rasa gula aren dan sedikit asam segar seperti jeruk. Satu kemasan berisi 200 gram biji utuh dalam kantong ber-valve.\n\nGiling sesaat sebelum diseduh supaya aromanya maksimal. Simpan di tempat sejuk dan kering, tutup rapat kantongnya setelah dipakai. Kalau butuh dalam jumlah banyak untuk kedai, hubungi kami lewat WhatsApp.',
    descriptionEn:
      "These arabica beans come from villagers' gardens on the mountain slopes around Baros. We only pick ripe red cherries, then process and dry them ourselves before roasting in small batches so the roast stays consistent.\n\nThe roast is medium, with notes of palm sugar and a fresh, citrusy acidity. Each pack holds 200 grams of whole beans in a valved bag.\n\nGrind just before brewing for the best aroma. Store in a cool, dry place and seal the bag after each use. If you need larger amounts for a coffee shop, contact us on WhatsApp.",
    reviews: [
      {
        name: 'Galih Prasetyo',
        rating: 5,
        body: 'Diseduh V60, manis gula arennya muncul pas agak dingin. Tanggal sangrainya juga ditulis, mantap.',
        locale: 'id',
        daysAgo: 8,
        reply:
          'Terima kasih Kang Galih. Kami memang selalu tulis tanggal sangrai supaya pembeli tahu kesegarannya.',
      },
      {
        name: 'Daniel K.',
        rating: 5,
        body: 'Clean cup, bright acidity, very fresh beans. Easily as good as what I buy in Bandung cafes.',
        locale: 'en',
        daysAgo: 22,
      },
      {
        name: 'Wawan Setiadi',
        rating: 4,
        body: 'Rasanya enak dan seimbang. Untuk espresso menurut saya agak terlalu terang, lebih cocok manual brew.',
        locale: 'id',
        daysAgo: 49,
      },
      {
        name: 'Mega Puspita',
        rating: 5,
        body: 'Pertama kali coba kopi Baros, ternyata wangi banget. Pengiriman cepat dan kantongnya tebal.',
        locale: 'id',
        daysAgo: 77,
      },
      {
        name: 'Irfan Maulana',
        rating: 4,
        body: 'Biji rata, tidak banyak yang pecah. Semoga nanti ada pilihan kemasan 500 gram.',
        locale: 'id',
        daysAgo: 3,
        status: 'pending',
      },
      {
        name: 'Pak Haris',
        rating: 5,
        body: 'Sudah langganan tiga bulan, rasanya konsisten. Pak Dedi juga sering kasih tips seduh.',
        locale: 'id',
        daysAgo: 110,
      },
      {
        name: 'Nadia Rahma',
        rating: 3,
        body: 'Kopinya enak, tapi asamnya terlalu terasa buat lidah saya. Mungkin saya lebih cocok yang sangrai gelap.',
        locale: 'id',
        daysAgo: 150,
        reply:
          'Terima kasih masukannya Teh Nadia. Untuk sangrai lebih gelap bisa pesan khusus lewat WA.',
      },
    ],
  },
  'kopi-gunung-baros-arabika-bubuk-200g': {
    description:
      'Ini kopi arabika yang sama dengan biji utuh kami, hanya saja sudah digiling dengan tingkat sedang. Gilingan ini pas untuk kopi tubruk, V60, maupun French press, jadi tinggal seduh tanpa perlu alat giling.\n\nRasanya lembut dengan sentuhan manis gula aren dan sedikit asam buah. Satu kemasan berisi 200 gram bubuk kopi dalam kantong tertutup rapat.\n\nKopi bubuk lebih cepat kehilangan aroma, jadi sebaiknya dihabiskan dalam sebulan setelah dibuka. Simpan di wadah kedap udara, jangan di kulkas karena bisa menyerap bau. Butuh gilingan lebih halus atau kasar? Tulis saja saat pesan di WhatsApp.',
    descriptionEn:
      'This is the same arabica as our whole beans, ground to a medium size. The grind works for kopi tubruk, V60 and French press, so you can brew without a grinder.\n\nIt tastes smooth with a hint of palm sugar sweetness and a little fruity acidity. Each pack holds 200 grams of ground coffee in a tightly sealed bag.\n\nGround coffee loses its aroma faster, so it is best finished within a month of opening. Keep it in an airtight container, not in the fridge where it can pick up smells. Need a finer or coarser grind? Just mention it when ordering on WhatsApp.',
    reviews: [
      {
        name: 'Asep Sunandar',
        rating: 5,
        body: 'Ditubruk pagi-pagi wanginya satu rumah. Ampasnya cepat turun, gilingannya pas.',
        locale: 'id',
        daysAgo: 11,
      },
      {
        name: 'Fitri Handayani',
        rating: 4,
        body: 'Enak dan praktis. Saya minta gilingan lebih halus untuk moka pot dan dikabulkan.',
        locale: 'id',
        daysAgo: 30,
        reply: 'Sama-sama Teh Fitri, semoga cocok di moka pot-nya.',
      },
      {
        name: 'Bambang Sudrajat',
        rating: 5,
        body: 'Kopi lokal yang nggak pahit gosong. Cocok diminum tanpa gula.',
        locale: 'id',
        daysAgo: 58,
      },
      {
        name: 'Chloe M.',
        rating: 4,
        body: 'Nice and smooth in a French press. Would love a resealable bag, I had to move it to a jar.',
        locale: 'en',
        daysAgo: 84,
      },
    ],
  },
  'kopi-gunung-baros-kopi-susu-gula-aren': {
    description:
      'Kopi susu gula aren kami dibuat dari espresso arabika Gunung Baros, susu segar, dan gula aren cair yang kami masak sendiri. Diracik setiap hari sesuai pesanan, lalu dimasukkan ke botol 1 liter.\n\nRasanya creamy, manisnya dari gula aren tidak berlebihan, dan rasa kopinya tetap terasa. Satu botol kira-kira cukup untuk 5 sampai 6 gelas.\n\nWajib disimpan di kulkas dan paling baik dihabiskan dalam 3 hari. Kocok dulu sebelum dituang, sajikan dengan es batu. Untuk pesanan acara atau kantor, mohon kabari sehari sebelumnya lewat WhatsApp.',
    descriptionEn:
      'Our palm sugar iced coffee is made from Gunung Baros arabica espresso, fresh milk and liquid palm sugar we cook ourselves. It is mixed fresh every day to order and bottled in 1 litre bottles.\n\nIt is creamy, sweetened with palm sugar without being too sweet, and the coffee still comes through. One bottle makes roughly 5 to 6 glasses.\n\nIt must be kept in the fridge and is best finished within 3 days. Shake before pouring and serve over ice. For events or office orders, please let us know a day ahead on WhatsApp.',
    reviews: [
      {
        name: 'Putri Ayu',
        rating: 5,
        body: 'Manisnya pas, nggak eneg. Satu liter habis berdua dalam dua hari.',
        locale: 'id',
        daysAgo: 5,
      },
      {
        name: 'Hendri Saputra',
        rating: 5,
        body: 'Pesan 5 botol buat rapat kantor, semua suka. Diantar tepat waktu dan masih dingin.',
        locale: 'id',
        daysAgo: 27,
        reply: 'Hatur nuhun Kang Hendri, ditunggu pesanan rapat berikutnya.',
      },
      {
        name: 'Lilis Karlina',
        rating: 4,
        body: 'Enak, kopinya kerasa. Cuma botolnya agak susah dibuka tutupnya.',
        locale: 'id',
        daysAgo: 44,
      },
      {
        name: 'Riko Pratama',
        rating: 3,
        body: 'Rasanya enak tapi buat saya terlalu banyak susu. Kalau ada versi lebih strong pasti saya beli lagi.',
        locale: 'id',
        daysAgo: 66,
        reply: 'Terima kasih Kang Riko, bisa request takaran kopi lebih banyak lewat WA ya.',
      },
      {
        name: 'Tegar Ramadhan',
        rating: 5,
        body: 'Kopi susu rumahan terenak di sekitar Arjasari. Mantap.',
        locale: 'id',
        daysAgo: 93,
      },
    ],
  },
  // Desa Baros: Anyaman Bambu Pak Ujang
  'anyaman-bambu-pak-ujang-besek-bambu-isi-10': {
    description:
      'Besek ini kami anyam dari bambu tali yang tumbuh di sekitar Baros. Bambu dibelah, diserut tipis, dijemur, lalu dianyam dengan tangan oleh ibu-ibu perajin di kampung kami.\n\nSatu paket berisi 10 besek dengan tutup, ukuran sedang yang pas untuk nasi kotak, kue, atau isi hampers. Warnanya alami krem kecokelatan dan bisa sedikit berbeda antar besek karena buatan tangan.\n\nSimpan di tempat kering supaya tidak berjamur. Kalau dipakai untuk makanan basah, alasi dulu dengan daun pisang atau kertas roti. Untuk pesanan ratusan buah atau ukuran khusus, silakan tanya waktu pengerjaannya lewat WhatsApp.',
    descriptionEn:
      'We weave these boxes from tali bamboo that grows around Baros. The bamboo is split, shaved thin, sun dried and then woven by hand by the women craftspeople in our village.\n\nEach set contains 10 boxes with lids, a medium size that suits rice boxes, cakes or gift hampers. The colour is a natural light brown and can vary slightly from box to box because they are handmade.\n\nKeep them somewhere dry so they do not grow mould. For moist food, line them first with banana leaf or baking paper. For orders in the hundreds or custom sizes, please ask about lead time on WhatsApp.',
    reviews: [
      {
        name: 'Bu Imas',
        rating: 5,
        body: 'Pesan 50 besek untuk syukuran, anyamannya rapi dan baunya bambu segar. Tamu banyak yang tanya belinya di mana.',
        locale: 'id',
        daysAgo: 14,
        reply: 'Hatur nuhun Bu Imas, semoga syukurannya lancar dan berkah.',
      },
      {
        name: 'Rizky Fauzi',
        rating: 5,
        body: 'Buat hampers jualan kue saya, kelihatan lebih estetik daripada kotak plastik.',
        locale: 'id',
        daysAgo: 35,
      },
      {
        name: 'Nurul Aini',
        rating: 4,
        body: 'Bagus, tapi ukurannya sedikit beda-beda. Wajar sih karena buatan tangan.',
        locale: 'id',
        daysAgo: 61,
      },
      {
        name: 'Emma R.',
        rating: 5,
        body: 'Lovely natural boxes, I used them for wedding favours. Arrived well packed and on time.',
        locale: 'en',
        daysAgo: 99,
      },
      {
        name: 'Deden Supriadi',
        rating: 4,
        body: 'Kokoh untuk nasi kotak. Satu tutup agak longgar, tapi masih bisa dipakai.',
        locale: 'id',
        daysAgo: 133,
      },
    ],
  },
  'anyaman-bambu-pak-ujang-tudung-saji-bambu': {
    description:
      'Tudung saji ini dianyam rapat dari bambu pilihan yang sudah dijemur kering, dengan bingkai bambu di bagian bawah supaya bentuknya tetap bulat dan kokoh. Pengerjaan satu tudung saji bisa makan waktu dua hari.\n\nDiameternya 50 cm, cukup untuk menutup beberapa piring lauk di meja makan. Anyamannya rapat sehingga lalat tidak mudah masuk, tapi udara tetap bisa keluar sehingga makanan tidak cepat basi karena uap.\n\nBersihkan cukup dengan lap kering atau kuas lembut. Hindari merendam di air dan jangan dijemur terlalu lama di terik matahari supaya bambu tidak retak.',
    descriptionEn:
      'This food cover is tightly woven from selected sun dried bamboo, with a bamboo rim at the bottom so it keeps its round shape and stays sturdy. A single cover can take two days to make.\n\nIt measures 50 cm across, enough to cover several dishes on the dining table. The tight weave keeps flies out while still letting steam escape, so food does not turn soggy.\n\nClean it with a dry cloth or a soft brush. Avoid soaking it in water and do not leave it in strong sun for long, so the bamboo does not crack.',
    reviews: [
      {
        name: 'Bu Cucu',
        rating: 5,
        body: 'Anyamannya rapat dan kuat, lebih bagus dari tudung saji plastik saya yang dulu. Ukurannya pas buat meja makan.',
        locale: 'id',
        daysAgo: 18,
      },
      {
        name: 'Iman Sulaeman',
        rating: 4,
        body: 'Kualitas bagus. Pengirimannya agak lama karena dibuat dulu, tapi Pak Ujang sudah kasih tahu dari awal.',
        locale: 'id',
        daysAgo: 42,
        reply: 'Hatur nuhun Kang Iman sudah sabar menunggu. Semoga awet dipakainya.',
      },
      {
        name: 'Wulan Sari',
        rating: 5,
        body: 'Cantik, dapur jadi kelihatan lebih tradisional. Bau bambunya hilang setelah beberapa hari.',
        locale: 'id',
        daysAgo: 2,
        status: 'pending',
      },
    ],
  },
  'anyaman-bambu-pak-ujang-lampu-hias-bambu': {
    description:
      'Kap lampu gantung ini dianyam tangan dengan motif kepang, motif anyaman yang sudah lama dipakai perajin di desa kami. Bambu diserut tipis supaya lentur, lalu dibentuk mengikuti cetakan bulat.\n\nSaat lampu menyala, cahaya keluar dari sela-sela anyaman dan membentuk pola bayangan yang hangat di dinding dan langit-langit. Kap sudah dilengkapi kabel dan fitting, tinggal pasang bohlam.\n\nGunakan bohlam LED supaya tidak terlalu panas. Bersihkan debu dengan kuas lembut atau kemoceng. Kalau ingin ukuran lebih besar untuk kafe atau homestay, kami bisa buatkan, silakan diskusikan lewat WhatsApp.',
    descriptionEn:
      'This pendant lamp shade is hand woven in the kepang (braid) pattern, a weave long used by craftspeople in our village. The bamboo is shaved thin so it bends, then shaped over a round mould.\n\nWhen the lamp is on, light spills through the gaps in the weave and casts a warm pattern of shadows on the walls and ceiling. The shade comes with a cable and socket, so you only need to add a bulb.\n\nUse an LED bulb so it does not get too hot. Dust it with a soft brush or feather duster. If you would like a larger size for a cafe or homestay, we can make one, just discuss it with us on WhatsApp.',
    reviews: [
      {
        name: 'Arif Budiman',
        rating: 5,
        body: 'Dipasang di teras, bayangan anyamannya cantik banget kalau malam. Kabelnya juga sudah rapi.',
        locale: 'id',
        daysAgo: 21,
        reply: 'Terima kasih Kang Arif, senang lampunya cocok di teras.',
      },
      {
        name: 'Laura B.',
        rating: 5,
        body: 'Beautiful craftsmanship. It makes our living room feel so cosy. Shipping to Jakarta took four days.',
        locale: 'en',
        daysAgo: 54,
      },
      {
        name: 'Yuniarti',
        rating: 4,
        body: 'Bagus dan ringan. Kabelnya agak pendek untuk plafon rumah saya, jadi harus disambung.',
        locale: 'id',
        daysAgo: 80,
      },
      {
        name: 'Dimas Anggara',
        rating: 5,
        body: 'Pesan tiga buat kafe, semuanya seragam dan rapi. Pak Ujang responsif di WA.',
        locale: 'id',
        daysAgo: 115,
      },
      {
        name: 'Tika Rahmawati',
        rating: 4,
        body: 'Cantik, cuma ada sedikit serat bambu yang mencuat. Saya rapikan sendiri pakai gunting kecil.',
        locale: 'id',
        daysAgo: 160,
      },
    ],
  },
  'anyaman-bambu-pak-ujang-keranjang-bambu': {
    description:
      'Keranjang serbaguna ini dianyam dari bambu dengan pinggiran yang dililit rotan bambu supaya kuat dan tidak mudah lepas. Bentuknya bulat lebar dengan dinding rendah, jadi mudah mengambil isinya.\n\nBisa dipakai sebagai wadah buah, roti, sayur, atau perlengkapan rumah seperti remote dan kunci. Ukurannya kira-kira cukup untuk 2 sampai 3 kilogram buah.\n\nCukup dilap kering setelah dipakai. Jika sempat basah, angin-anginkan sampai kering sebelum disimpan supaya tidak berjamur.',
    descriptionEn:
      'This multipurpose basket is woven from bamboo, with a rim wrapped in bamboo cane so it stays strong and does not come loose. It is round and wide with low sides, so the contents are easy to reach.\n\nUse it for fruit, bread, vegetables or household bits like remotes and keys. It holds roughly 2 to 3 kilograms of fruit.\n\nWipe it dry after use. If it gets wet, let it air dry fully before putting it away so it does not grow mould.',
    reviews: [
      {
        name: 'Sri Mulyani',
        rating: 5,
        body: 'Buat wadah buah di meja makan, kuat dan rapi. Harganya juga masuk akal.',
        locale: 'id',
        daysAgo: 16,
      },
      {
        name: 'Ahmad Fauzan',
        rating: 4,
        body: 'Bagus, tapi lebih kecil sedikit dari bayangan saya. Untuk roti sudah pas.',
        locale: 'id',
        daysAgo: 39,
        reply: 'Mohon maaf Kang Ahmad, ke depan ukurannya kami tulis lebih jelas di keterangan.',
      },
      {
        name: 'Ratna Dewi',
        rating: 5,
        body: 'Beli dua, satu buat sayur satu buat mainan anak. Anyamannya rapat.',
        locale: 'id',
        daysAgo: 72,
      },
      {
        name: 'Kang Eman',
        rating: 4,
        body: 'Kokoh. Pengiriman agak lama tiga hari, tapi barang aman.',
        locale: 'id',
        daysAgo: 105,
      },
    ],
  },

  // Desa Baros: Madu Hutan Baros
  'madu-hutan-baros-madu-hutan-250ml': {
    description:
      'Madu ini dipanen oleh peternak lebah dari kelompok tani di desa kami, dari sarang lebah yang hidup di sekitar hutan dan kebun. Setelah dipanen, madu hanya disaring supaya bersih dari sisa sarang, tanpa dicampur gula atau air.\n\nWarnanya cokelat keemasan, rasanya manis dengan sedikit sentuhan asam dan aroma bunga hutan. Rasa dan warna bisa sedikit berbeda tiap panen, tergantung musim bunga.\n\nKemasan botol kaca 250 ml. Simpan di suhu ruang, tidak perlu masuk kulkas. Kalau madu mengkristal, itu hal yang wajar; rendam botol di air hangat sebentar supaya cair lagi. Pakai sendok kering setiap mengambil madu.',
    descriptionEn:
      "This honey is harvested by beekeepers from our village farmers' group, from hives around the forest and gardens. After harvest it is only strained to remove bits of comb, with no added sugar or water.\n\nIt is golden brown, sweet with a slight tang and a scent of forest flowers. The taste and colour can vary a little between harvests, depending on the flowering season.\n\nIt comes in a 250 ml glass bottle. Store it at room temperature, there is no need to refrigerate. If the honey crystallises, that is normal; stand the bottle in warm water for a while and it will turn liquid again. Always use a dry spoon.",
    reviews: [
      {
        name: 'Hj. Aisyah',
        rating: 5,
        body: 'Rasanya ada asam-asamnya sedikit, khas madu hutan. Botol kaca dibungkus bubble wrap tebal, aman sampai.',
        locale: 'id',
        daysAgo: 13,
        reply: 'Hatur nuhun Bu Hajjah, semoga cocok untuk keluarga.',
      },
      {
        name: 'Bayu Aji',
        rating: 4,
        body: 'Madunya kental dan wangi. Ukuran 250 ml cepat habis, next beli yang 500.',
        locale: 'id',
        daysAgo: 36,
      },
      {
        name: 'Oliver J.',
        rating: 5,
        body: 'Rich, slightly tangy honey, nothing like supermarket honey. Great in tea.',
        locale: 'en',
        daysAgo: 68,
      },
      {
        name: 'Enok Sumarni',
        rating: 5,
        body: 'Sudah beli berkali-kali. Ibu Siti selalu ramah dan jelasin kalau madu mengkristal itu wajar.',
        locale: 'id',
        daysAgo: 97,
      },
      {
        name: 'Yusuf Mahendra',
        rating: 4,
        body: 'Enak, warnanya lebih gelap dari pembelian sebelumnya. Katanya beda musim panen.',
        locale: 'id',
        daysAgo: 128,
        reply: 'Betul Kang Yusuf, panen musim ini lebih banyak dari bunga kaliandra.',
      },
      {
        name: 'Gita Permata',
        rating: 5,
        body: 'Pas buat campuran teh hangat dan roti. Pengiriman ke Cimahi cepat.',
        locale: 'id',
        daysAgo: 172,
      },
    ],
  },
  'madu-hutan-baros-madu-hutan-500ml': {
    description:
      'Madu hutan yang sama dengan kemasan 250 ml, dalam ukuran keluarga 500 ml. Dipanen oleh peternak lebah kelompok tani desa, disaring sederhana, dan dibotolkan tanpa campuran gula atau air.\n\nRasanya manis dengan sedikit asam dan aroma bunga hutan, warnanya cokelat keemasan. Ukuran ini lebih hemat untuk keluarga yang rutin memakai madu untuk teh, roti, atau masakan.\n\nSimpan di suhu ruang dan jauhkan dari sinar matahari langsung. Madu yang mengkristal bisa dicairkan dengan merendam botol di air hangat. Selalu gunakan sendok kering dan tutup rapat setelah dipakai.',
    descriptionEn:
      "The same forest honey as our 250 ml bottle, in a 500 ml family size. It is harvested by our village farmers' group beekeepers, simply strained and bottled with no added sugar or water.\n\nIt tastes sweet with a slight tang and a forest flower aroma, and is golden brown in colour. This size works out better value for families who use honey regularly in tea, on bread or in cooking.\n\nStore at room temperature away from direct sunlight. Crystallised honey can be loosened by standing the bottle in warm water. Always use a dry spoon and close the lid tightly after use.",
    reviews: [
      {
        name: 'Pak Juhana',
        rating: 5,
        body: 'Ukuran keluarga, awet buat sebulan. Madunya kental, tidak encer.',
        locale: 'id',
        daysAgo: 20,
      },
      {
        name: 'Melati Kusuma',
        rating: 4,
        body: 'Madunya enak. Tutup botolnya agak lengket setelah beberapa kali dipakai, mungkin sebaiknya diganti tutup flip.',
        locale: 'id',
        daysAgo: 47,
        reply: 'Masukan yang bagus Teh Melati, kami coba cari tutup yang lebih praktis.',
      },
      {
        name: 'Taufik Hamdani',
        rating: 5,
        body: 'Lebih hemat dibanding beli yang kecil. Pengirimannya rapi, botol tidak bocor.',
        locale: 'id',
        daysAgo: 89,
      },
    ],
  },

  // Desa Baros: Sayur Segar Kelompok Tani
  'sayur-segar-kelompok-tani-paket-sayur-mingguan': {
    description:
      'Paket sayur mingguan ini berisi hasil panen kebun anggota kelompok tani kami. Sayuran baru dipetik setelah pesanan masuk, jadi sampai di tangan Anda masih segar. Kami menanam tanpa pestisida kimia dan memakai pupuk kandang dari ternak warga.\n\nBeratnya sekitar 3 kg dan isinya menyesuaikan musim panen, misalnya kangkung, bayam, sawi, buncis, wortel, tomat, dan daun bawang. Kami kabari isi paket lewat WhatsApp sebelum dikirim.\n\nSesampainya di rumah, buka plastiknya dan simpan sayur daun di kulkas dengan dibungkus kertas atau kain lembap. Sayur paling enak dimasak dalam 3 sampai 4 hari. Pesanan sebaiknya masuk sehari sebelumnya.',
    descriptionEn:
      "This weekly vegetable box is filled with produce from our farmers' group members' plots. The vegetables are only picked after your order comes in, so they reach you fresh. We grow without chemical pesticides and use manure from villagers' livestock.\n\nIt weighs about 3 kg and the contents follow the harvest season, for example water spinach, spinach, mustard greens, green beans, carrots, tomatoes and spring onions. We let you know on WhatsApp what is in the box before sending it.\n\nWhen it arrives, open the bag and keep leafy greens in the fridge wrapped in paper or a damp cloth. The vegetables are best cooked within 3 to 4 days. Please order a day in advance.",
    reviews: [
      {
        name: 'Ibu Ratih',
        rating: 5,
        body: 'Sayurnya segar banget, masih ada embun pagi. Isinya banyak untuk seminggu masak.',
        locale: 'id',
        daysAgo: 7,
        reply: 'Hatur nuhun Bu Ratih, minggu depan insyaallah ada labu siam juga.',
      },
      {
        name: 'Fikri Ardiansyah',
        rating: 4,
        body: 'Segar dan murah. Kadang isinya lebih banyak daun daripada sayur buah, tapi memang tergantung panen.',
        locale: 'id',
        daysAgo: 23,
      },
      {
        name: 'Sinta Maharani',
        rating: 2,
        body: 'Bayamnya sudah layu waktu sampai karena kurir telat sampai sore. Sayur lainnya masih oke.',
        locale: 'id',
        daysAgo: 45,
        reply:
          'Mohon maaf Teh Sinta. Sekarang kami hanya kirim pagi lewat kurir desa supaya tidak kesiangan.',
      },
      {
        name: 'Jessica P.',
        rating: 5,
        body: 'Love knowing exactly where my vegetables come from. Fresh, crisp and plenty for a family of four.',
        locale: 'en',
        daysAgo: 70,
      },
      {
        name: 'Ujang Rohmat',
        rating: 5,
        body: 'Langganan tiap Senin. Wortelnya manis, buncisnya renyah.',
        locale: 'id',
        daysAgo: 118,
      },
    ],
  },
  'sayur-segar-kelompok-tani-cabai-rawit-1kg': {
    description:
      'Cabai rawit merah ini dipetik pagi hari dari kebun anggota kelompok tani, lalu langsung disortir dan dikemas. Kami pilih cabai yang sudah merah dan tidak busuk, tangkainya masih menempel supaya lebih awet.\n\nSatu paket berisi 1 kg cabai rawit merah dengan rasa pedas yang mantap, cocok untuk sambal, tumisan, atau stok dapur warung.\n\nAgar tahan lama, buang cabai yang memar, lalu simpan di wadah berlubang atau dibungkus tisu di kulkas. Bisa juga dibekukan untuk stok berminggu-minggu. Harga dan stok cabai mengikuti panen, jadi tanya dulu lewat WhatsApp sebelum pesan banyak.',
    descriptionEn:
      "These red bird's eye chillies are picked in the morning from our farmers' group members' plots, then sorted and packed right away. We choose fully red chillies with no rot, keeping the stems on so they last longer.\n\nEach pack holds 1 kg of red bird's eye chillies with a solid kick, great for sambal, stir fries or stocking a food stall kitchen.\n\nTo keep them longer, remove any bruised chillies and store the rest in a vented container or wrapped in tissue in the fridge. You can also freeze them for several weeks. Stock follows the harvest, so please check with us on WhatsApp before a large order.",
    reviews: [
      {
        name: 'Bu Yayah',
        rating: 5,
        body: 'Pedasnya nendang, buat sambal warung saya pas banget. Hampir nggak ada yang busuk.',
        locale: 'id',
        daysAgo: 10,
      },
      {
        name: 'Rendi Kurniawan',
        rating: 4,
        body: 'Segar dan merah semua. Ada beberapa yang ukurannya kecil sekali, tapi pedasnya sama.',
        locale: 'id',
        daysAgo: 31,
      },
      {
        name: 'Nia Kurniati',
        rating: 4,
        body: 'Masih segar setelah seminggu di kulkas. Pengiriman pagi, sampai siang.',
        locale: 'id',
        daysAgo: 64,
        reply: 'Terima kasih Teh Nia, tipsnya memang disimpan pakai tisu ya.',
      },
    ],
  },
  // Desa Baros: Dodol Ibu Euis
  'dodol-ibu-euis-dodol-ketan-original': {
    description:
      'Dodol ketan ini dibuat dengan resep turun-temurun dari keluarga kami. Bahannya tepung beras ketan, santan kelapa segar, gula aren, dan daun pandan. Semua dimasak di kuali besar dan diaduk manual selama kurang lebih 8 jam sampai kalis dan berminyak.\n\nTeksturnya legit dan kenyal, manisnya dari gula aren, dengan wangi pandan yang lembut. Satu kemasan berisi 500 gram dodol yang sudah dipotong kecil dan dibungkus kertas satu per satu.\n\nSimpan di tempat sejuk dan kering, dodol tahan sekitar dua minggu di suhu ruang dan lebih lama di kulkas. Untuk pesanan hantaran atau oleh-oleh dalam jumlah banyak, kabari kami beberapa hari sebelumnya lewat WhatsApp.',
    descriptionEn:
      'This sticky rice dodol follows a recipe handed down in our family. It is made from glutinous rice flour, fresh coconut milk, palm sugar and pandan leaves, all cooked in a large wok and stirred by hand for about 8 hours until thick and glossy.\n\nIt is dense and chewy, sweetened with palm sugar, with a gentle pandan scent. Each pack holds 500 grams of dodol cut into small pieces and individually wrapped in paper.\n\nKeep it somewhere cool and dry. Dodol keeps for about two weeks at room temperature and longer in the fridge. For large orders for gifts or ceremonies, please let us know a few days ahead on WhatsApp.',
    reviews: [
      {
        name: 'Bu Tati',
        rating: 5,
        body: 'Legitnya pas, nggak terlalu manis, wangi pandannya kerasa. Rasanya seperti dodol buatan nenek dulu.',
        locale: 'id',
        daysAgo: 17,
        reply: 'Hatur nuhun Bu Tati, resepnya memang dari nenek kami.',
      },
      {
        name: 'Cahya Purnama',
        rating: 5,
        body: 'Dibungkus satu per satu jadi gampang dibagi ke teman kantor. Semua bilang enak.',
        locale: 'id',
        daysAgo: 41,
      },
      {
        name: 'Doni Setiawan',
        rating: 4,
        body: 'Kenyal dan enak. Agak lengket di kertasnya kalau cuaca panas, jadi saya simpan di kulkas.',
        locale: 'id',
        daysAgo: 74,
      },
      {
        name: 'Ruth A.',
        rating: 4,
        body: 'Chewy and fragrant, a lovely treat with tea. A little too sweet for me to eat many at once.',
        locale: 'en',
        daysAgo: 108,
      },
      {
        name: 'Elis Nurjanah',
        rating: 5,
        body: 'Pesan untuk hantaran nikahan adik, Bu Euis bantu kemas cantik. Terima kasih banyak.',
        locale: 'id',
        daysAgo: 145,
        reply: 'Sama-sama Teh Elis, selamat untuk adiknya ya.',
      },
      {
        name: 'Gilang Ramdani',
        rating: 5,
        body: 'Teksturnya halus, tidak ada butiran. Pengiriman cepat ke Soreang.',
        locale: 'id',
        daysAgo: 176,
      },
    ],
  },
  'dodol-ibu-euis-dodol-durian': {
    description:
      'Dodol durian dibuat dengan cara yang sama seperti dodol ketan original kami, diaduk manual berjam-jam di kuali, tetapi adonannya dicampur daging durian lokal asli. Duriannya kami beli dari petani sekitar saat musim panen.\n\nAroma durian langsung tercium begitu bungkusnya dibuka, rasanya manis legit dengan tekstur kenyal. Satu kemasan berisi 500 gram dodol yang dipotong kecil dan dibungkus satu per satu.\n\nSimpan di wadah tertutup supaya aromanya tidak menyebar ke makanan lain. Tahan sekitar dua minggu di suhu ruang yang sejuk. Karena memakai durian musiman, stoknya kadang terbatas, jadi tanyakan dulu lewat WhatsApp.',
    descriptionEn:
      'Our durian dodol is made the same way as our original sticky rice dodol, stirred by hand for hours in a wok, but with real local durian flesh mixed into the batter. We buy the durian from nearby farmers during the harvest season.\n\nThe durian aroma comes through as soon as you open the wrapper, and it tastes rich and sweet with a chewy texture. Each pack holds 500 grams of dodol cut into small pieces and individually wrapped.\n\nKeep it in a closed container so the smell does not spread to other food. It keeps for about two weeks in a cool room. Because we use seasonal durian, stock is sometimes limited, so please ask on WhatsApp first.',
    reviews: [
      {
        name: 'Agung Wibowo',
        rating: 5,
        body: 'Duriannya kerasa banget, bukan cuma perisa. Pecinta durian wajib coba.',
        locale: 'id',
        daysAgo: 24,
      },
      {
        name: 'Rosita Anggraeni',
        rating: 3,
        body: 'Enak, tapi aromanya terlalu kuat buat saya, satu kulkas jadi bau durian. Mungkin kemasannya bisa lebih rapat.',
        locale: 'id',
        daysAgo: 50,
        reply:
          'Terima kasih masukannya Teh Rosita, sekarang kami tambahkan plastik klip di luar kemasan.',
      },
      {
        name: 'Hadi Santoso',
        rating: 5,
        body: 'Oleh-oleh favorit keluarga di Bekasi. Legit, kenyal, wangi durian.',
        locale: 'id',
        daysAgo: 81,
      },
      {
        name: 'Mila Karmila',
        rating: 4,
        body: 'Rasanya mantap, cuma waktu itu harus nunggu stok karena duriannya belum musim.',
        locale: 'id',
        daysAgo: 125,
      },
    ],
  },
  'dodol-ibu-euis-wajit-daun-jagung': {
    description:
      'Wajit adalah kudapan khas Sunda dari beras ketan, gula aren, dan santan yang dimasak sampai kental. Wajit kami dibungkus daun jagung kering seperti cara orang tua dulu, sehingga ada aroma daun yang khas.\n\nSatu bungkus berisi 20 wajit kecil. Rasanya manis legit dengan butiran ketan yang masih terasa, sedikit lebih padat dibanding dodol.\n\nSimpan di tempat kering dan sejuk, jangan ditumpuk di dekat kompor. Wajit tahan sekitar seminggu di suhu ruang. Cocok untuk suguhan tamu, arisan, atau oleh-oleh khas desa.',
    descriptionEn:
      'Wajit is a traditional Sundanese sweet made from glutinous rice, palm sugar and coconut milk cooked until thick. We wrap ours in dried corn husks the way our elders did, which gives it a distinctive leafy aroma.\n\nEach bag holds 20 small wajit. They taste rich and sweet, with the grains of sticky rice still noticeable, and are a little firmer than dodol.\n\nKeep them somewhere cool and dry, not next to the stove. Wajit keeps for about a week at room temperature. They are nice for serving guests, community gatherings or as a village gift.',
    reviews: [
      {
        name: 'Ema Kusmiati',
        rating: 5,
        body: 'Bungkus daun jagungnya bikin kangen kampung. Manisnya pas.',
        locale: 'id',
        daysAgo: 28,
      },
      {
        name: 'Ridwan Saputra',
        rating: 4,
        body: 'Enak buat teman teh sore. Beberapa bungkusnya agak sobek, tapi isinya aman.',
        locale: 'id',
        daysAgo: 59,
      },
      {
        name: 'Annisa Zahra',
        rating: 5,
        body: 'Pertama kali makan wajit, ternyata enak. Penjelasan Bu Euis di WA juga detail.',
        locale: 'id',
        daysAgo: 92,
        reply: 'Hatur nuhun Teh Annisa, semoga jadi suka makanan khas Sunda ya.',
      },
    ],
  },

  // Desa Baros: Telur Asin Mang Oding
  'telur-asin-mang-oding-telur-asin-isi-10': {
    description:
      'Telur asin ini berasal dari bebek yang kami pelihara sendiri di kandang belakang rumah. Telur dibalut adonan abu gosok, bata merah halus, dan garam, lalu didiamkan sekitar dua minggu sebelum direbus.\n\nKuning telurnya masir dan berminyak, putihnya tidak terlalu asin sehingga enak dimakan dengan nasi hangat. Satu paket berisi 10 butir telur asin matang.\n\nSimpan di suhu ruang yang sejuk, telur asin matang tahan sekitar dua minggu, lebih lama di kulkas. Saat diterima, cek dulu kalau ada yang retak dan kabari kami lewat WhatsApp.',
    descriptionEn:
      'These salted eggs come from ducks we raise ourselves in the pen behind our house. Each egg is coated in a paste of ash, fine red brick and salt, then left for about two weeks before boiling.\n\nThe yolk is sandy and rich, and the white is not too salty, so they go well with warm rice. Each pack holds 10 cooked salted eggs.\n\nStore at a cool room temperature, where cooked salted eggs keep for about two weeks, longer in the fridge. When they arrive, check for any cracked eggs and let us know on WhatsApp.',
    reviews: [
      {
        name: 'Pak Encep',
        rating: 5,
        body: 'Kuningnya masir dan keluar minyaknya, asinnya pas. Ini baru telur asin.',
        locale: 'id',
        daysAgo: 12,
      },
      {
        name: 'Vina Oktaviani',
        rating: 4,
        body: 'Enak dan tidak terlalu asin. Satu butir retak di perjalanan, Mang Oding langsung ganti di pesanan berikutnya.',
        locale: 'id',
        daysAgo: 38,
        reply: 'Hatur nuhun Teh Vina, maaf atas telur yang retak.',
      },
      {
        name: 'Ben C.',
        rating: 5,
        body: 'Perfect salted eggs, the yolks are rich and crumbly. Great with rice and sambal.',
        locale: 'en',
        daysAgo: 69,
      },
      {
        name: 'Iis Suryani',
        rating: 5,
        body: 'Langganan buat sarapan anak-anak. Ukuran telurnya besar-besar.',
        locale: 'id',
        daysAgo: 101,
      },
      {
        name: 'Hendra Kusnadi',
        rating: 4,
        body: 'Rasanya enak, tapi ada dua butir yang kuningnya kurang masir. Overall puas.',
        locale: 'id',
        daysAgo: 136,
      },
    ],
  },
  'telur-asin-mang-oding-telur-asin-bakar': {
    description:
      'Telur asin bakar dibuat dari telur bebek asin kami yang sudah diasinkan sekitar dua minggu, lalu dipanggang dalam oven tanah liat sampai kulitnya kecokelatan. Proses panggang ini membuat aromanya smoky dan teksturnya lebih padat.\n\nPutih telurnya sedikit kenyal dan kecokelatan, kuningnya masir dengan rasa gurih. Satu paket berisi 10 butir.\n\nKarena sudah dipanggang, telur asin bakar sedikit lebih awet dibanding telur asin rebus. Simpan di suhu ruang yang sejuk atau di kulkas, dan habiskan dalam dua minggu.',
    descriptionEn:
      'Our grilled salted eggs start as our duck eggs salted for about two weeks, then baked in a clay oven until the shells turn brown. Baking gives them a smoky aroma and a firmer texture.\n\nThe white is slightly chewy and light brown, and the yolk is sandy and savoury. Each pack holds 10 eggs.\n\nBecause they are baked, these keep a little longer than boiled salted eggs. Store at a cool room temperature or in the fridge and finish within two weeks.',
    reviews: [
      {
        name: 'Nana Suryana',
        rating: 5,
        body: 'Aroma bakarannya enak, beda dari telur asin biasa. Putihnya agak kenyal, saya suka.',
        locale: 'id',
        daysAgo: 26,
      },
      {
        name: 'Suci Rahayu',
        rating: 4,
        body: 'Enak buat lauk bekal. Harganya sedikit lebih mahal dari yang rebus, tapi sepadan.',
        locale: 'id',
        daysAgo: 55,
        reply: 'Terima kasih Teh Suci, proses bakarnya memang butuh waktu lebih lama.',
      },
      {
        name: 'Usep Saepuloh',
        rating: 5,
        body: 'Baru tahu ada telur asin bakar. Gurih dan wangi, cocok sama nasi liwet.',
        locale: 'id',
        daysAgo: 3,
        status: 'pending',
      },
      {
        name: 'Kurnia Sari',
        rating: 3,
        body: 'Rasanya oke, tapi menurut saya agak terlalu asin dibanding yang rebus.',
        locale: 'id',
        daysAgo: 84,
      },
    ],
  },

  // Desa Mekarwangi: Kulit Mekarwangi
  'kulit-mekarwangi-dompet-kulit-pria': {
    description:
      'Dompet ini dibuat dari kulit sapi asli yang dipotong dan dijahit tangan oleh perajin kulit di Mekarwangi. Jahitannya memakai benang lilin yang kuat, dan tepi kulitnya dihaluskan serta diwarnai supaya rapi.\n\nModelnya lipat dua dengan 6 slot kartu, satu ruang uang kertas, dan ukuran yang pas di saku celana. Kulitnya akan semakin lentur dan warnanya makin berkarakter seiring pemakaian.\n\nHindari dompet terkena air terlalu lama. Bila basah, lap dengan kain kering dan angin-anginkan, jangan dijemur di bawah matahari. Sesekali oles krim kulit supaya tidak kering. Ingin inisial nama di dompet? Tanyakan lewat WhatsApp.',
    descriptionEn:
      'This wallet is made from genuine cowhide, cut and hand stitched by leather craftspeople in Mekarwangi. It is sewn with strong waxed thread, and the edges are burnished and coloured for a neat finish.\n\nIt is a bifold with 6 card slots and one note compartment, sized to fit a trouser pocket. The leather softens and develops more character the longer you use it.\n\nAvoid leaving the wallet wet for long. If it gets wet, wipe it with a dry cloth and let it air dry, not in direct sun. Apply leather cream now and then so it does not dry out. Would you like your initials on it? Ask us on WhatsApp.',
    reviews: [
      {
        name: 'Fahmi Rizaldi',
        rating: 5,
        body: 'Jahitannya rapi dan kuat, bau kulit aslinya kerasa. Sudah dua bulan dipakai, makin bagus warnanya.',
        locale: 'id',
        daysAgo: 19,
      },
      {
        name: 'Aditya Nugroho',
        rating: 4,
        body: 'Bagus, cuma di awal agak kaku dan slot kartunya sempit. Setelah seminggu sudah pas.',
        locale: 'id',
        daysAgo: 48,
        reply: 'Betul Kang Aditya, kulit asli memang perlu waktu menyesuaikan.',
      },
      {
        name: 'James H.',
        rating: 5,
        body: 'Excellent hand stitching for the price. They added my initials for free when I asked.',
        locale: 'en',
        daysAgo: 87,
      },
      {
        name: 'Saepul Anwar',
        rating: 5,
        body: 'Beli buat kado ulang tahun bapak, beliau senang sekali. Dikemas dalam kotak.',
        locale: 'id',
        daysAgo: 121,
      },
      {
        name: 'Rangga Wijaya',
        rating: 4,
        body: 'Kualitas oke. Warnanya sedikit lebih gelap dari foto.',
        locale: 'id',
        daysAgo: 158,
      },
    ],
  },
  'kulit-mekarwangi-sabuk-kulit': {
    description:
      'Sabuk ini dibuat dari selembar kulit sapi tebal yang dipotong utuh, bukan sambungan, lalu tepinya dihaluskan dan dijahit tangan di bagian gesper. Gespernya dari kuningan yang kokoh dan tidak mudah berkarat.\n\nLebarnya 3,5 cm, cocok untuk celana jeans maupun celana kain. Panjang bisa disesuaikan, cukup kirim ukuran lingkar pinggang saat memesan dan kami buatkan lubang yang pas.\n\nRawat dengan mengoleskan krim kulit sebulan sekali dan simpan dengan cara digantung atau digulung longgar. Gesper kuningan bisa dilap dengan kain kering supaya tetap mengilap.',
    descriptionEn:
      'This belt is cut from a single strip of thick cowhide, not joined pieces, with burnished edges and hand stitching at the buckle. The buckle is solid brass that does not rust easily.\n\nIt is 3.5 cm wide, suiting both jeans and dress trousers. The length can be adjusted: just send your waist measurement when you order and we will punch the holes to fit.\n\nCare for it by applying leather cream once a month, and store it hung up or loosely rolled. Wipe the brass buckle with a dry cloth to keep it shiny.',
    reviews: [
      {
        name: 'Yudi Hermawan',
        rating: 5,
        body: 'Tebal dan kokoh, gespernya berat. Ukurannya pas karena dibuatkan sesuai lingkar pinggang.',
        locale: 'id',
        daysAgo: 29,
        reply: 'Hatur nuhun Kang Yudi, semoga awet sampai bertahun-tahun.',
      },
      {
        name: 'Ilham Akbar',
        rating: 4,
        body: 'Kualitasnya bagus. Prosesnya tiga hari karena dibuat dulu, jadi jangan pesan mepet.',
        locale: 'id',
        daysAgo: 62,
      },
      {
        name: 'Bagas Pamungkas',
        rating: 5,
        body: 'Sabuk kulit asli dengan harga wajar. Sudah dipakai kerja tiap hari, masih bagus.',
        locale: 'id',
        daysAgo: 114,
      },
      {
        name: 'Tom W.',
        rating: 4,
        body: 'Solid belt with a nice brass buckle. The leather was quite stiff at first.',
        locale: 'en',
        daysAgo: 149,
      },
    ],
  },
  'kulit-mekarwangi-tas-selempang-kulit': {
    description:
      'Tas selempang ini dijahit tangan dari kulit sapi asli oleh perajin di Mekarwangi. Satu tas dikerjakan satu orang dari memotong pola sampai menjahit, jadi setiap tas punya sedikit perbedaan yang khas.\n\nUkurannya 22 x 18 cm, muat ponsel, dompet, kunci, dan powerbank. Ada satu ruang utama beresleting dan satu kantong depan. Talinya bisa diatur panjang pendeknya.\n\nHindari menaruh barang tajam di dalam tas dan jangan sampai kehujanan terlalu lama. Simpan dengan diisi kertas supaya bentuknya terjaga, dan oles krim kulit sesekali.',
    descriptionEn:
      'This crossbody bag is hand stitched from genuine cowhide by craftspeople in Mekarwangi. Each bag is made by one person from pattern cutting to stitching, so every bag has its own small differences.\n\nIt measures 22 x 18 cm and fits a phone, wallet, keys and a power bank. There is one zipped main compartment and a front pocket. The strap is adjustable.\n\nAvoid putting sharp objects inside and do not leave it out in heavy rain. Store it stuffed with paper to keep its shape, and apply leather cream occasionally.',
    reviews: [
      {
        name: 'Anisa Fitriani',
        rating: 5,
        body: 'Cantik dan muat banyak untuk ukurannya. Kulitnya lembut, jahitannya rapi.',
        locale: 'id',
        daysAgo: 32,
      },
      {
        name: 'Rio Firmansyah',
        rating: 2,
        body: 'Tasnya bagus, tapi pengiriman molor seminggu dari janji awal dan resleting agak seret.',
        locale: 'id',
        daysAgo: 76,
        reply:
          'Mohon maaf Kang Rio. Resleting sudah kami ganti dengan yang lebih halus, silakan kirim balik tasnya, kami servis gratis.',
      },
      {
        name: 'Lestari Wulandari',
        rating: 5,
        body: 'Dipakai jalan-jalan tiap hari, makin lama makin bagus. Kang Hendra ramah jelaskan cara rawat.',
        locale: 'id',
        daysAgo: 119,
      },
      {
        name: 'Sophie D.',
        rating: 5,
        body: 'Gorgeous bag, the leather smells wonderful. Very good value for genuine leather.',
        locale: 'en',
        daysAgo: 167,
      },
    ],
  },
  // Desa Mekarwangi: Jeruk Pak Darma
  'jeruk-garut-pak-darma-jeruk-keprok-1kg': {
    description:
      'Jeruk keprok ini kami petik dari kebun keluarga sendiri di Mekarwangi. Kami hanya memetik buah yang sudah matang di pohon, lalu disortir supaya yang sampai ke pembeli bersih dan tidak busuk.\n\nRasanya manis segar dengan sedikit asam, airnya banyak, dan kulitnya tipis sehingga mudah dikupas dengan tangan. Satu kilogram biasanya berisi 8 sampai 12 buah, tergantung ukuran panen.\n\nSimpan di tempat sejuk dengan sirkulasi udara yang baik, jangan ditumpuk di plastik tertutup. Jeruk tahan sekitar seminggu di suhu ruang dan lebih lama di kulkas.',
    descriptionEn:
      'We pick these tangerines from our own family orchard in Mekarwangi. We only harvest fruit that has ripened on the tree, then sort it so what reaches you is clean and free of rot.\n\nThey taste sweet and fresh with a little tartness, are very juicy, and have thin skins that peel easily by hand. One kilogram usually holds 8 to 12 fruits, depending on the harvest size.\n\nKeep them somewhere cool with good airflow, not piled in a sealed plastic bag. They keep for about a week at room temperature and longer in the fridge.',
    reviews: [
      {
        name: 'Dina Mariana',
        rating: 5,
        body: 'Manis dan airnya banyak, anak-anak suka karena gampang dikupas.',
        locale: 'id',
        daysAgo: 9,
      },
      {
        name: 'Cecep Gunawan',
        rating: 4,
        body: 'Segar, ada satu dua yang agak asam, tapi kebanyakan manis.',
        locale: 'id',
        daysAgo: 34,
        reply: 'Hatur nuhun Kang Cecep, panen awal musim memang ada yang masih sedikit asam.',
      },
      {
        name: 'Ayu Lestari',
        rating: 5,
        body: 'Jeruknya mulus dan seger, beda sama di pasar. Pengiriman cepat.',
        locale: 'id',
        daysAgo: 60,
      },
      {
        name: 'Pak Ade',
        rating: 4,
        body: 'Rasa mantap. Ukurannya campur besar kecil.',
        locale: 'id',
        daysAgo: 98,
      },
      {
        name: 'Kevin L.',
        rating: 5,
        body: 'Sweet, juicy and so easy to peel. Much fresher than the ones at my supermarket.',
        locale: 'en',
        daysAgo: 131,
      },
    ],
  },
  'jeruk-garut-pak-darma-jeruk-keprok-5kg': {
    description:
      'Jeruk keprok yang sama dari kebun keluarga kami, dalam kemasan 5 kg yang lebih hemat. Pas untuk stok buah keluarga selama seminggu, isi parsel, atau oleh-oleh untuk saudara.\n\nBuah dipetik matang di pohon, rasanya manis segar, berair, dan kulitnya mudah dikupas. Kami kemas dalam kardus berlubang supaya jeruk tetap bernapas selama perjalanan.\n\nSetelah diterima, keluarkan jeruk dari kardus dan pisahkan kalau ada yang memar. Simpan di tempat sejuk atau sebagian di kulkas supaya lebih awet. Untuk pesanan parsel atau acara, silakan hubungi kami lewat WhatsApp.',
    descriptionEn:
      'The same tangerines from our family orchard, in a better value 5 kg box. It is right for a week of family fruit, gift baskets or presents for relatives.\n\nThe fruit is picked ripe on the tree, tastes sweet and fresh, is juicy and peels easily. We pack it in a vented cardboard box so the fruit can breathe on the way.\n\nWhen it arrives, take the tangerines out of the box and set aside any bruised ones. Keep them somewhere cool, or some in the fridge, so they last longer. For gift baskets or events, contact us on WhatsApp.',
    reviews: [
      {
        name: 'Bu Enung',
        rating: 5,
        body: 'Beli 5 kg buat pengajian, semuanya manis. Kardusnya kuat dan rapi.',
        locale: 'id',
        daysAgo: 15,
        reply: 'Hatur nuhun Bu Enung, semoga berkah pengajiannya.',
      },
      {
        name: 'Firman Syah',
        rating: 4,
        body: 'Hemat dan segar. Ada tiga buah yang memar, wajar untuk kiriman sebanyak itu.',
        locale: 'id',
        daysAgo: 43,
      },
      {
        name: 'Ratih Purwasih',
        rating: 5,
        body: 'Sudah tiga kali pesan, rasanya konsisten manis. Pak Darma cepat balas WA.',
        locale: 'id',
        daysAgo: 85,
      },
    ],
  },

  // Desa Mekarwangi: Batik Tulis Mekarwangi
  'batik-tulis-mekarwangi-kain-batik-tulis': {
    description:
      'Kain batik tulis ini dikerjakan dengan canting oleh pembatik di Mekarwangi, mulai dari menggambar pola, menorehkan malam, mewarnai, sampai melorod. Satu lembar bisa memakan waktu dua sampai tiga minggu.\n\nMotifnya terinspirasi dari tanaman di sekitar desa, seperti daun singkong, bunga kopi, dan pakis. Pewarnanya dari bahan alam seperti kayu tingi, daun indigo, dan kulit mahoni. Kainnya katun primisima yang halus dan adem, berukuran 2 meter.\n\nCuci dengan tangan memakai sabun lerak atau sampo lembut, jangan diperas keras, dan jemur di tempat teduh. Warna alami bisa sedikit memudar seiring waktu, itu bagian dari karakter batik pewarna alam.',
    descriptionEn:
      'This hand drawn batik is made with a canting by batik makers in Mekarwangi, from drawing the pattern and applying wax to dyeing and removing the wax. One piece can take two to three weeks.\n\nThe motifs are inspired by plants around the village, such as cassava leaves, coffee blossoms and ferns. The dyes come from natural sources like tingi wood, indigo leaves and mahogany bark. The cloth is soft, cool primisima cotton, 2 metres long.\n\nWash by hand with lerak soap or a mild shampoo, do not wring hard, and dry in the shade. Natural colours may fade slightly over time, which is part of the character of naturally dyed batik.',
    reviews: [
      {
        name: 'Ibu Wiwin',
        rating: 5,
        body: 'Halus sekali kainnya, warnanya kalem khas pewarna alam. Dijahit jadi kebaya, cantik.',
        locale: 'id',
        daysAgo: 27,
        reply: 'Hatur nuhun Bu Wiwin, senang sekali kainnya jadi kebaya.',
      },
      {
        name: 'Clara S.',
        rating: 5,
        body: 'A true piece of art. You can see the hand drawn lines, and Bu Nining explained each motif.',
        locale: 'en',
        daysAgo: 66,
      },
      {
        name: 'Rahma Yunita',
        rating: 4,
        body: 'Indah, tapi warnanya sedikit lebih pudar dari foto. Mungkin karena pencahayaan.',
        locale: 'id',
        daysAgo: 104,
      },
      {
        name: 'Hesti Purnamasari',
        rating: 5,
        body: 'Beli untuk seragam keluarga saat nikahan. Pengerjaan tepat waktu walau pesan banyak.',
        locale: 'id',
        daysAgo: 155,
      },
    ],
  },
  'batik-tulis-mekarwangi-syal-batik': {
    description:
      'Syal batik ini dibuat dari kain sutra hasil tenun ATBM (alat tenun bukan mesin), lalu dibatik tulis dengan motif flora lokal dan diwarnai dengan pewarna alam. Karena kainnya sutra, malam dan warna harus diolah hati-hati supaya tidak merusak serat.\n\nKainnya ringan, jatuh, dan sedikit berkilau. Cocok dipakai sebagai syal leher, selendang, atau kerudung luar, dan bisa jadi kado yang berkesan.\n\nCuci dengan tangan di air dingin dan sabun lembut, jangan direndam lama dan jangan diperas. Jemur di tempat teduh lalu setrika dengan suhu rendah dari sisi dalam.',
    descriptionEn:
      'This batik scarf is made from silk woven on a traditional hand loom (ATBM), then hand drawn with local plant motifs and coloured with natural dyes. Because it is silk, the wax and dyes have to be handled carefully so the fibres are not damaged.\n\nThe fabric is light, drapes well and has a soft sheen. Wear it as a neck scarf, shawl or outer head covering, and it makes a memorable gift.\n\nHand wash in cold water with mild soap, do not soak for long or wring it. Dry in the shade and iron on low heat from the inside.',
    reviews: [
      {
        name: 'Nur Aisyah',
        rating: 5,
        body: 'Lembut dan ringan, motifnya cantik. Beli pas diskon, puas sekali.',
        locale: 'id',
        daysAgo: 8,
      },
      {
        name: 'Indah Kusumawati',
        rating: 5,
        body: 'Kado untuk ibu mertua, beliau suka banget. Dikemas pakai kotak dan kertas tisu.',
        locale: 'id',
        daysAgo: 30,
        reply: 'Terima kasih Teh Indah, salam untuk ibu mertuanya.',
      },
      {
        name: 'Maya Anggraini',
        rating: 4,
        body: 'Bagus, tapi ukurannya lebih kecil dari yang saya kira. Pas buat syal leher saja.',
        locale: 'id',
        daysAgo: 58,
      },
      {
        name: 'Grace N.',
        rating: 5,
        body: 'The silk is beautiful and the natural colours are so soft. A lovely souvenir from West Java.',
        locale: 'en',
        daysAgo: 91,
      },
      {
        name: 'Yeni Rohayati',
        rating: 4,
        body: 'Cantik. Ada sedikit bekas lilin di ujung, hilang setelah dicuci.',
        locale: 'id',
        daysAgo: 127,
      },
      {
        name: 'Teh Ocha',
        rating: 5,
        body: 'Sudah beli dua warna. Kainnya adem dipakai siang hari.',
        locale: 'id',
        daysAgo: 163,
      },
    ],
  },
  'batik-tulis-mekarwangi-masker-kain-batik': {
    description:
      'Masker kain ini kami jahit dari sisa potongan kain batik tulis pewarna alam, jadi motif tiap masker bisa berbeda. Daripada perca terbuang, kami olah jadi barang yang berguna.\n\nSatu paket berisi 3 masker dengan 3 lapis kain: batik di bagian luar, katun di tengah, dan katun lembut di bagian dalam. Tali telinganya elastis dan nyaman dipakai lama.\n\nMasker bisa dicuci berulang kali. Cuci dengan tangan memakai sabun lembut, jemur di tempat teduh, dan setrika dengan suhu sedang supaya rapi lagi.',
    descriptionEn:
      'We sew these cloth masks from offcuts of our naturally dyed hand drawn batik, so each mask can have a different pattern. Rather than throwing the scraps away, we turn them into something useful.\n\nEach pack contains 3 masks with 3 layers of fabric: batik on the outside, cotton in the middle and soft cotton on the inside. The ear loops are elastic and comfortable for long wear.\n\nThe masks can be washed again and again. Hand wash with mild soap, dry in the shade and iron on medium heat to smooth them out.',
    reviews: [
      {
        name: 'Rani Puspitasari',
        rating: 5,
        body: 'Motifnya beda-beda, cantik semua. Talinya nggak bikin sakit telinga.',
        locale: 'id',
        daysAgo: 22,
      },
      {
        name: 'Budi Santosa',
        rating: 4,
        body: 'Nyaman dan tebal. Untuk wajah saya agak kecil, mungkin perlu ukuran L.',
        locale: 'id',
        daysAgo: 53,
        reply: 'Terima kasih Kang Budi, ukuran lebih besar bisa dipesan lewat WA.',
      },
      {
        name: 'Siska Amelia',
        rating: 4,
        body: 'Bagus buat dipakai ke kantor, warnanya kalem. Sudah dicuci beberapa kali, masih rapi.',
        locale: 'id',
        daysAgo: 96,
      },
    ],
  },

  // Desa Mekarwangi: Abon Ikan Mas Bu Lilis
  'abon-ikan-mas-abon-ikan-original': {
    description:
      'Abon ini dibuat dari ikan mas segar hasil kolam warga Mekarwangi. Ikan dikukus, dipisahkan dari durinya dengan teliti, lalu daging ikannya disuwir dan disangrai bersama bumbu bawang, ketumbar, lengkuas, serai, dan gula aren sampai kering. Tanpa pengawet.\n\nRasanya gurih sedikit manis, teksturnya halus dan kering. Satu kemasan berisi 150 gram, cocok untuk lauk anak, isian roti, atau taburan nasi hangat.\n\nSetelah dibuka, simpan di toples kedap udara dan selalu pakai sendok kering. Abon tahan sekitar sebulan di suhu ruang. Kami sudah memilah duri dengan hati-hati, tapi tetap periksa sekilas sebelum diberikan ke anak kecil.',
    descriptionEn:
      "This floss is made from fresh carp raised in Mekarwangi villagers' ponds. The fish is steamed, carefully deboned, then shredded and dry fried with garlic, coriander, galangal, lemongrass and palm sugar until dry. No preservatives.\n\nIt tastes savoury and slightly sweet, with a fine, dry texture. Each pack holds 150 grams, nice as a side dish for children, a bread filling or sprinkled over warm rice.\n\nOnce opened, keep it in an airtight jar and always use a dry spoon. It keeps for about a month at room temperature. We pick out the bones carefully, but do give it a quick check before serving to small children.",
    reviews: [
      {
        name: 'Ibu Neneng',
        rating: 5,
        body: 'Anak saya yang susah makan jadi lahap pakai abon ini. Gurih manisnya pas.',
        locale: 'id',
        daysAgo: 11,
        reply: 'Alhamdulillah Bu Neneng, senang sekali dengarnya.',
      },
      {
        name: 'Arief Setiawan',
        rating: 4,
        body: 'Enak dan tidak amis. Saya sempat nemu satu duri kecil, tapi selebihnya bersih.',
        locale: 'id',
        daysAgo: 37,
      },
      {
        name: 'Sri Wahyuni',
        rating: 5,
        body: 'Teksturnya halus, beda dengan abon sapi. Cocok buat isian roti bekal sekolah.',
        locale: 'id',
        daysAgo: 70,
      },
      {
        name: 'Nina H.',
        rating: 5,
        body: 'Tasty and not fishy at all. I sprinkle it on rice and eggs for a quick lunch.',
        locale: 'en',
        daysAgo: 112,
      },
      {
        name: 'Dian Novitasari',
        rating: 4,
        body: 'Enak, cuma 150 gram cepat habis. Semoga ada ukuran lebih besar.',
        locale: 'id',
        daysAgo: 146,
      },
    ],
  },
  'abon-ikan-mas-abon-ikan-pedas': {
    description:
      'Abon ikan mas pedas dibuat dari bahan dan cara yang sama dengan abon original kami, ditambah cabai merah dan cabai rawit yang disangrai bersama bumbu. Ikan mas segar dari kolam desa dikukus, dibuang durinya, disuwir, lalu disangrai sampai kering. Tanpa pengawet.\n\nLevel pedasnya sedang, masih terasa gurih dan sedikit manis di balik pedasnya. Satu kemasan berisi 150 gram.\n\nCocok untuk lauk nasi hangat, teman mi rebus, atau isian lontong. Simpan di toples kedap udara setelah dibuka, pakai sendok kering, dan habiskan dalam sebulan.',
    descriptionEn:
      "Our spicy carp floss uses the same ingredients and method as the original, with red chillies and bird's eye chillies dry fried along with the spices. Fresh carp from the village ponds is steamed, deboned, shredded and dry fried until dry. No preservatives.\n\nThe heat is medium, with the savoury, slightly sweet flavour still there behind it. Each pack holds 150 grams.\n\nEnjoy it with warm rice, noodle soup or rice cakes. Keep it in an airtight jar after opening, use a dry spoon and finish within a month.",
    reviews: [
      {
        name: 'Erwin Saputra',
        rating: 5,
        body: 'Pedasnya pas buat saya, nagih. Cocok banget sama nasi panas.',
        locale: 'id',
        daysAgo: 20,
      },
      {
        name: 'Lia Amalia',
        rating: 4,
        body: 'Enak, tapi pedasnya lumayan untuk saya yang kurang kuat pedas. Suami suka.',
        locale: 'id',
        daysAgo: 49,
        reply: 'Terima kasih Teh Lia, kalau mau yang tidak pedas ada varian original ya.',
      },
      {
        name: 'Deni Rusmana',
        rating: 5,
        body: 'Jadi bekal wajib kalau dinas ke luar kota. Awet dan praktis.',
        locale: 'id',
        daysAgo: 83,
      },
      {
        name: 'Mira Sukmawati',
        rating: 5,
        body: 'Gurih pedas, nggak amis. Bu Lilis cepat respon di WA.',
        locale: 'id',
        daysAgo: 139,
      },
    ],
  },

  // Desa Mekarwangi: Bandrek Mekarwangi
  'bandrek-mekarwangi-bandrek-serbuk': {
    description:
      'Bandrek adalah minuman rempah hangat khas Sunda. Bandrek serbuk kami dibuat dari jahe merah yang diparut dan diperas, lalu dimasak bersama gula aren dan kayu manis sampai mengkristal, kemudian dihaluskan jadi serbuk.\n\nSatu kemasan berisi 10 sachet. Rasanya pedas hangat jahe dengan manis gula aren dan wangi kayu manis. Cocok diminum saat malam yang dingin atau setelah hujan-hujanan.\n\nSeduh satu sachet dengan 150 sampai 200 ml air panas, aduk sampai larut. Bisa ditambah susu kental manis atau irisan kelapa muda. Simpan di tempat kering dan tertutup supaya serbuk tidak menggumpal.',
    descriptionEn:
      'Bandrek is a warm Sundanese spiced drink. Our instant bandrek is made from grated and pressed red ginger, cooked with palm sugar and cinnamon until it crystallises, then ground into a powder.\n\nEach pack contains 10 sachets. It tastes warm and gingery, with palm sugar sweetness and a hint of cinnamon. It is perfect on a cold night or after getting caught in the rain.\n\nStir one sachet into 150 to 200 ml of hot water until dissolved. You can add sweetened condensed milk or young coconut strips. Keep it dry and closed so the powder does not clump.',
    reviews: [
      {
        name: 'Kang Dodi',
        rating: 5,
        body: 'Jahenya kerasa, hangat sampai ke perut. Pas buat malam di daerah dingin.',
        locale: 'id',
        daysAgo: 16,
      },
      {
        name: 'Winda Agustina',
        rating: 4,
        body: 'Enak dan praktis, tapi buat saya agak terlalu manis. Saya seduh pakai air lebih banyak.',
        locale: 'id',
        daysAgo: 45,
        reply: 'Masukan yang bagus Teh Winda, takaran airnya memang bisa disesuaikan selera.',
      },
      {
        name: 'Peter G.',
        rating: 5,
        body: 'Spicy, warming ginger drink. I brought a few packs home as gifts and everyone loved them.',
        locale: 'en',
        daysAgo: 79,
      },
      {
        name: 'Ujang Sopandi',
        rating: 4,
        body: 'Rasanya mirip bandrek yang dijual malam-malam di pinggir jalan. Serbuknya sedikit menggumpal di sachet terakhir.',
        locale: 'id',
        daysAgo: 117,
      },
    ],
  },
  'bandrek-mekarwangi-bajigur-serbuk': {
    description:
      'Bajigur adalah minuman tradisional Sunda yang creamy dan manis. Bajigur serbuk kami dibuat dari santan kelapa dan gula aren, ditambah sedikit jahe dan daun pandan, lalu diolah menjadi serbuk supaya praktis diseduh kapan saja.\n\nSatu kemasan berisi 10 sachet. Rasanya gurih santan, manis legit gula aren, dengan sedikit hangat jahe yang lembut. Teman yang cocok untuk ubi atau kacang rebus.\n\nSeduh satu sachet dengan 150 sampai 200 ml air panas lalu aduk rata. Simpan di tempat kering dan sejuk, tutup rapat sisa sachet yang belum dipakai.',
    descriptionEn:
      'Bajigur is a creamy, sweet traditional Sundanese drink. Our instant bajigur is made from coconut milk and palm sugar with a little ginger and pandan leaf, processed into a powder so you can make it any time.\n\nEach pack contains 10 sachets. It tastes of rich coconut and deep palm sugar, with a gentle warmth from the ginger. It pairs well with boiled sweet potatoes or peanuts.\n\nStir one sachet into 150 to 200 ml of hot water. Keep it somewhere cool and dry, and close any unused sachets tightly.',
    reviews: [
      {
        name: 'Bu Komariah',
        rating: 5,
        body: 'Gurih santannya pas, rasanya seperti bajigur yang dijual keliling dulu.',
        locale: 'id',
        daysAgo: 25,
      },
      {
        name: 'Andi Gunawan',
        rating: 3,
        body: 'Rasanya enak, tapi agak encer kalau diseduh sesuai petunjuk. Saya pakai dua sachet sekaligus.',
        locale: 'id',
        daysAgo: 67,
        reply: 'Terima kasih Kang Andi, kami sedang uji takaran baru supaya lebih kental.',
      },
      {
        name: 'Susi Marlina',
        rating: 5,
        body: 'Cocok diminum sore-sore sambil makan ubi rebus. Anak-anak juga suka.',
        locale: 'id',
        daysAgo: 103,
      },
    ],
  },
  // Desa Sindangjaya: Tahu Sindangjaya
  'tahu-sindangjaya-tahu-goreng-isi-20': {
    description:
      'Tahu goreng kami dibuat dari kedelai yang direndam, digiling, dan dimasak di pabrik tahu rumahan keluarga yang sudah berjalan sejak 1985. Setelah dicetak, tahu direndam air garam dan kunyit, lalu digoreng sampai kulitnya kecokelatan.\n\nKulitnya renyah, bagian dalamnya lembut dan sedikit berongga. Satu paket berisi 20 potong tahu goreng, lengkap dengan cabai rawit untuk teman makan.\n\nPaling enak dimakan hangat. Tahu goreng tahan sehari di suhu ruang dan dua sampai tiga hari di kulkas; hangatkan lagi di wajan atau air fryer supaya renyah kembali. Untuk pesanan hajatan, mohon kabari H-1 lewat WhatsApp.',
    descriptionEn:
      "Our fried tofu is made from soybeans that are soaked, ground and cooked at our family's home tofu workshop, running since 1985. After pressing, the tofu is soaked in salted turmeric water and fried until the skin turns golden brown.\n\nThe skin is crisp and the inside soft and slightly airy. Each pack holds 20 pieces of fried tofu, with bird's eye chillies to eat alongside.\n\nIt is best eaten warm. Fried tofu keeps for a day at room temperature and two to three days in the fridge; reheat it in a pan or air fryer to crisp it up again. For celebrations, please let us know a day ahead on WhatsApp.",
    reviews: [
      {
        name: 'Pak Ujang Kosasih',
        rating: 5,
        body: 'Masih hangat waktu diantar, kulitnya renyah dalamnya lembut. Cabai rawitnya juga segar.',
        locale: 'id',
        daysAgo: 6,
        reply: 'Hatur nuhun Pak, ditunggu pesanan berikutnya.',
      },
      {
        name: 'Rosa Dewanti',
        rating: 5,
        body: 'Pesan 200 potong untuk hajatan, semua tamu suka. Pak Cecep tepat waktu.',
        locale: 'id',
        daysAgo: 29,
      },
      {
        name: 'Ikhsan Maulana',
        rating: 4,
        body: 'Enak, tapi kalau dikirim jauh jadi agak lembek. Saya goreng ulang sebentar, renyah lagi.',
        locale: 'id',
        daysAgo: 56,
      },
      {
        name: 'Alex V.',
        rating: 5,
        body: 'Best fried tofu I have had in Indonesia. Crispy outside, soft inside, and the chillies are fierce.',
        locale: 'en',
        daysAgo: 90,
      },
      {
        name: 'Euis Sumiati',
        rating: 5,
        body: 'Resep lama yang rasanya tidak berubah. Sejak kecil saya beli di sini.',
        locale: 'id',
        daysAgo: 124,
      },
      {
        name: 'Rian Hidayat',
        rating: 4,
        body: 'Gurih dan murah. Ukurannya agak kecil dibanding tahu Sumedang, tapi rasanya juara.',
        locale: 'id',
        daysAgo: 168,
      },
    ],
  },
  'tahu-sindangjaya-tahu-kuning-isi-10': {
    description:
      'Tahu kuning mentah ini dibuat setiap pagi di pabrik tahu keluarga kami dengan resep yang sama sejak 1985. Kedelai digiling halus, sarinya dimasak, digumpalkan dengan cuka tahu, lalu dicetak dan direndam air kunyit sehingga warnanya kuning alami.\n\nSatu paket berisi 10 potong tahu kuning yang padat tapi tetap lembut, siap Anda masak sendiri di rumah. Cocok untuk digoreng, dibacem, dipepes, atau dimasak kuah.\n\nSimpan tahu di kulkas dalam wadah berisi air bersih dan ganti airnya setiap hari, tahu bisa tahan dua sampai tiga hari. Sebaiknya dimasak secepatnya setelah diterima.',
    descriptionEn:
      'This raw yellow tofu is made every morning at our family tofu workshop with the same recipe since 1985. The soybeans are finely ground, the milk is cooked, set with tofu whey, pressed and soaked in turmeric water, which gives it a natural yellow colour.\n\nEach pack holds 10 pieces of firm yet tender yellow tofu, ready for you to cook at home. It works well fried, braised in sweet soy (bacem), steamed in banana leaf (pepes) or in soups.\n\nKeep the tofu in the fridge in a container of clean water and change the water daily, and it will keep for two to three days. It is best cooked soon after it arrives.',
    reviews: [
      {
        name: 'Bu Aan',
        rating: 5,
        body: 'Padat, tidak gampang hancur waktu dibacem. Rasanya gurih kedelai.',
        locale: 'id',
        daysAgo: 13,
      },
      {
        name: 'Hilman Fauzi',
        rating: 4,
        body: 'Tahunya segar, cuma kemasannya pakai plastik biasa jadi airnya sedikit merembes.',
        locale: 'id',
        daysAgo: 40,
        reply: 'Mohon maaf Kang Hilman, sekarang kami pakai wadah tertutup untuk pengiriman.',
      },
      {
        name: 'Yanti Sukaesih',
        rating: 5,
        body: 'Belanja tiap pagi buat warung nasi saya. Kualitasnya selalu sama.',
        locale: 'id',
        daysAgo: 82,
      },
    ],
  },

  // Desa Sindangjaya: Ubi Madu Pak Endang
  'ubi-madu-pak-endang-ubi-mentah-5kg': {
    description:
      'Ubi madu ini kami tanam dan panen sendiri di kebun Sindangjaya. Setelah dicabut, ubi tidak langsung dijual, tapi disimpan dulu sekitar dua minggu di tempat teduh supaya kadar airnya turun dan rasa manisnya keluar.\n\nSatu paket berisi 5 kg ubi mentah dengan ukuran campur. Kalau dipanggang, ubi akan mengeluarkan cairan manis seperti madu dan dagingnya jadi lembut dan legit.\n\nSimpan di tempat kering dan sejuk dengan sirkulasi udara baik, jangan di kulkas. Panggang di oven sekitar satu jam atau kukus sampai empuk. Untuk pesanan dalam jumlah besar, tanyakan stok panen terbaru lewat WhatsApp.',
    descriptionEn:
      'We grow and harvest these honey sweet potatoes ourselves in Sindangjaya. After digging, the potatoes are not sold straight away but stored for about two weeks in the shade so their moisture drops and their sweetness develops.\n\nEach pack holds 5 kg of raw sweet potatoes in mixed sizes. When roasted, they release a sweet, honey like syrup and the flesh turns soft and rich.\n\nKeep them somewhere dry and cool with good airflow, not in the fridge. Roast in the oven for about an hour or steam until tender. For large orders, ask about the latest harvest stock on WhatsApp.',
    reviews: [
      {
        name: 'Ibu Dedeh',
        rating: 5,
        body: 'Dioven keluar madunya, manis banget. 5 kg habis dalam seminggu.',
        locale: 'id',
        daysAgo: 18,
        reply: 'Hatur nuhun Bu Dedeh, selamat menikmati.',
      },
      {
        name: 'Zaenal Arifin',
        rating: 4,
        body: 'Manis, tapi ukurannya campur, ada yang kecil-kecil. Untuk dikukus tetap enak.',
        locale: 'id',
        daysAgo: 47,
      },
      {
        name: 'Fiona K.',
        rating: 5,
        body: 'Roasted them as instructed and they turned out sticky and sweet. Packed well in a sack.',
        locale: 'en',
        daysAgo: 78,
      },
      {
        name: 'Agus Sulaeman',
        rating: 5,
        body: 'Kualitas bagus, tidak ada yang busuk. Pak Endang kasih tips oven juga.',
        locale: 'id',
        daysAgo: 113,
      },
      {
        name: 'Nurhayati',
        rating: 3,
        body: 'Ada beberapa ubi yang kurang manis, mungkin belum cukup lama disimpan. Yang lain enak.',
        locale: 'id',
        daysAgo: 151,
        reply: 'Terima kasih Bu, saran kami simpan seminggu lagi di tempat teduh sebelum dimasak.',
      },
    ],
  },
  'ubi-madu-pak-endang-ubi-oven-1kg': {
    description:
      'Ubi madu oven ini dari ubi kebun kami yang sudah disimpan sekitar dua minggu, lalu dipanggang perlahan sampai kulitnya sedikit gosong dan cairan manisnya keluar. Tanpa tambahan gula, manisnya dari ubi itu sendiri.\n\nSatu paket berisi 1 kg ubi oven siap makan. Dagingnya lembut, legit, dan berwarna kuning keemasan.\n\nEnak dimakan hangat maupun dingin. Simpan di kulkas kalau tidak langsung habis, tahan dua sampai tiga hari, dan hangatkan di oven atau microwave sebelum disantap.',
    descriptionEn:
      'These roasted honey sweet potatoes come from our garden, stored for about two weeks and then roasted slowly until the skins char a little and the sweet syrup seeps out. No sugar is added; the sweetness comes from the potatoes themselves.\n\nEach pack holds 1 kg of ready to eat roasted sweet potatoes. The flesh is soft, rich and golden yellow.\n\nThey are good warm or cold. Keep them in the fridge if not eaten right away, where they last two to three days, and warm them in the oven or microwave before serving.',
    reviews: [
      {
        name: 'Tuti Alawiyah',
        rating: 5,
        body: 'Lengket-lengket madunya, manis alami. Cocok buat sarapan.',
        locale: 'id',
        daysAgo: 10,
      },
      {
        name: 'Fauzi Ramdhani',
        rating: 5,
        body: 'Masih hangat waktu sampai. Anak-anak rebutan.',
        locale: 'id',
        daysAgo: 35,
        reply: 'Hatur nuhun Kang Fauzi, salam buat anak-anak.',
      },
      {
        name: 'Yati Haryati',
        rating: 4,
        body: 'Enak, tapi kulitnya ada yang terlalu gosong. Dagingnya tetap manis.',
        locale: 'id',
        daysAgo: 63,
      },
      {
        name: 'Rudi Setiabudi',
        rating: 4,
        body: 'Praktis tinggal makan. Satu kilo isinya sekitar empat sampai lima ubi.',
        locale: 'id',
        daysAgo: 100,
      },
    ],
  },
  'ubi-madu-pak-endang-keripik-ubi': {
    description:
      'Keripik ini dibuat dari ubi ungu hasil kebun kami di Sindangjaya. Ubi dikupas, diiris tipis, lalu digoreng dalam minyak panas sampai renyah dan diberi sedikit garam. Warna ungunya asli dari ubi, tanpa pewarna.\n\nRasanya gurih dengan sedikit manis khas ubi, teksturnya renyah dan ringan. Satu kemasan berisi 200 gram.\n\nSimpan di tempat kering dan tutup rapat kemasannya setelah dibuka supaya tidak melempem. Paling enak dihabiskan dalam dua minggu setelah dibuka.',
    descriptionEn:
      'These chips are made from purple sweet potatoes grown in our Sindangjaya garden. The potatoes are peeled, thinly sliced, fried in hot oil until crisp and lightly salted. The purple colour comes from the potato itself, with no added colouring.\n\nThey taste savoury with the light sweetness of sweet potato, and are crisp and airy. Each pack holds 200 grams.\n\nKeep them dry and reseal the pack after opening so they do not go soft. They are best finished within two weeks of opening.',
    reviews: [
      {
        name: 'Salsabila Putri',
        rating: 5,
        body: 'Warnanya cantik dan renyah. Manis gurihnya pas, bikin nagih.',
        locale: 'id',
        daysAgo: 14,
      },
      {
        name: 'Gunawan Wibisono',
        rating: 4,
        body: 'Enak, sedikit berminyak di bagian bawah kemasan. Selebihnya mantap.',
        locale: 'id',
        daysAgo: 44,
      },
      {
        name: 'Amy F.',
        rating: 5,
        body: 'Such a pretty colour and really crunchy. My kids prefer these to potato chips now.',
        locale: 'en',
        daysAgo: 75,
        reply: 'Thank you so much, we are happy your kids enjoy them.',
      },
      {
        name: 'Popon Rohaeni',
        rating: 4,
        body: 'Rasanya enak, cuma isinya terasa sedikit untuk 200 gram karena keripiknya ringan.',
        locale: 'id',
        daysAgo: 109,
      },
      {
        name: 'Yusup Supriatna',
        rating: 5,
        body: 'Oleh-oleh khas Sindangjaya yang wajib dibeli. Pengiriman ke Garut lancar.',
        locale: 'id',
        daysAgo: 144,
      },
    ],
  },

  // Desa Sindangjaya: Ukir Kayu Sindangjaya
  'ukir-kayu-sindangjaya-talenan-kayu-jati': {
    description:
      'Talenan ini dibuat dari kayu jati padat yang dipotong, diserut, dan diamplas halus di bengkel ukir kami. Kami memilih potongan kayu yang serat dan warnanya bagus, sehingga setiap talenan punya corak yang sedikit berbeda.\n\nUkurannya 35 x 25 cm dengan ketebalan yang cukup untuk memotong daging, sayur, maupun roti. Permukaannya dilapisi minyak food grade, aman untuk bahan makanan.\n\nCuci dengan air dan sabun cuci piring, lalu langsung keringkan dengan lap dan berdirikan sampai kering. Jangan direndam atau dimasukkan ke mesin cuci piring. Oles minyak kelapa atau minyak food grade sebulan sekali supaya kayu tidak kering dan retak.',
    descriptionEn:
      'This cutting board is made from solid teak, cut, planed and sanded smooth in our carving workshop. We pick pieces with good grain and colour, so each board has a slightly different pattern.\n\nIt measures 35 x 25 cm and is thick enough for cutting meat, vegetables or bread. The surface is finished with food grade oil, safe for food.\n\nWash with water and dish soap, then dry it straight away with a cloth and stand it up to finish drying. Do not soak it or put it in the dishwasher. Rub it with coconut oil or food grade oil once a month so the wood does not dry out and crack.',
    reviews: [
      {
        name: 'Chef Rizal',
        rating: 5,
        body: 'Berat dan kokoh, tidak geser waktu motong. Seratnya cantik.',
        locale: 'id',
        daysAgo: 21,
        reply: 'Terima kasih Kang Rizal, semoga betah dipakai di dapur.',
      },
      {
        name: 'Hana Pertiwi',
        rating: 5,
        body: 'Saya pakai juga buat alas plating, cantik buat foto makanan. Halus amplasannya.',
        locale: 'id',
        daysAgo: 51,
      },
      {
        name: 'Michael R.',
        rating: 4,
        body: 'Solid teak board, smooth finish. Slightly smaller than I imagined, but very well made.',
        locale: 'en',
        daysAgo: 86,
      },
      {
        name: 'Endah Kartini',
        rating: 4,
        body: 'Bagus, sempat ada bau kayu di awal tapi hilang setelah dicuci beberapa kali.',
        locale: 'id',
        daysAgo: 122,
      },
    ],
  },
  'ukir-kayu-sindangjaya-sendok-kayu-set': {
    description:
      'Set alat dapur kayu ini dibuat dari sisa potongan kayu mahoni dan jati yang masih bagus, diukir dan diamplas satu per satu oleh perajin di bengkel kami.\n\nSatu set berisi 5 buah: sendok sayur, sendok makan, spatula, spatula berlubang, dan centong nasi. Kayu tidak menggores wajan antilengket dan tidak panas saat dipakai mengaduk.\n\nCuci dengan tangan memakai sabun, keringkan segera, dan jangan direndam lama. Sesekali oles minyak kelapa supaya kayu tetap lembap dan awet. Bisa juga dipesan dalam jumlah banyak untuk suvenir.',
    descriptionEn:
      'This wooden kitchen set is made from good offcuts of mahogany and teak, carved and sanded one by one by craftspeople in our workshop.\n\nEach set contains 5 pieces: a ladle, a spoon, a spatula, a slotted spatula and a rice paddle. Wood does not scratch non stick pans and does not get hot while stirring.\n\nWash by hand with soap, dry right away and do not leave them soaking. Rub them with coconut oil now and then to keep the wood supple and long lasting. They can also be ordered in bulk as souvenirs.',
    reviews: [
      {
        name: 'Atikah Nuraeni',
        rating: 5,
        body: 'Ringan dan halus, enak dipegang. Wajan antilengket saya jadi aman.',
        locale: 'id',
        daysAgo: 17,
      },
      {
        name: 'Yoga Permana',
        rating: 4,
        body: 'Rapi, cuma warna kayunya beda-beda karena campuran mahoni dan jati.',
        locale: 'id',
        daysAgo: 52,
        reply: 'Betul Kang Yoga, kami pakai dua jenis kayu supaya tidak ada sisa yang terbuang.',
      },
      {
        name: 'Nova Lestari',
        rating: 5,
        body: 'Pesan 30 set buat suvenir arisan, dikirim tepat waktu dan dikemas rapi.',
        locale: 'id',
        daysAgo: 94,
      },
      {
        name: 'Ujang Hermana',
        rating: 4,
        body: 'Bagus untuk harganya. Centongnya sedikit kasar di pinggir, saya amplas ulang sedikit.',
        locale: 'id',
        daysAgo: 137,
      },
    ],
  },
  'ukir-kayu-sindangjaya-hiasan-dinding-ukir': {
    description:
      'Hiasan dinding ini diukir tangan oleh Pak Yayan dan perajin di bengkel kami dari papan kayu mahoni. Motifnya daun dan burung, terinspirasi dari pepohonan dan burung yang sering terlihat di kebun sekitar Sindangjaya. Satu panel dikerjakan sekitar seminggu.\n\nUkurannya 60 x 30 cm, sudah diberi pengait di bagian belakang sehingga siap digantung. Finishing-nya pernis doff yang menonjolkan serat kayu tanpa terlihat mengilap berlebihan.\n\nBersihkan debu dengan kuas lembut atau kain kering. Hindari memasang di tempat yang terkena hujan atau sinar matahari langsung. Ingin ukuran atau motif khusus? Silakan diskusikan lewat WhatsApp.',
    descriptionEn:
      'This wall panel is hand carved from mahogany by Pak Yayan and the craftspeople in our workshop. The motif of leaves and birds is inspired by the trees and birds often seen in the gardens around Sindangjaya. Each panel takes about a week.\n\nIt measures 60 x 30 cm and has a hook on the back, ready to hang. The matte varnish brings out the wood grain without looking too glossy.\n\nDust it with a soft brush or dry cloth. Avoid hanging it where it gets rain or direct sunlight. Would you like a custom size or motif? Discuss it with us on WhatsApp.',
    reviews: [
      {
        name: 'Pak Rachmat',
        rating: 5,
        body: 'Ukirannya detail, bulu burungnya kelihatan. Ruang tamu jadi lebih hidup.',
        locale: 'id',
        daysAgo: 33,
        reply: 'Hatur nuhun Pak Rachmat, semoga jadi kebanggaan di rumah.',
      },
      {
        name: 'Elena M.',
        rating: 5,
        body: 'Stunning carving, much more detailed in person. It was wrapped very carefully for shipping.',
        locale: 'en',
        daysAgo: 73,
      },
      {
        name: 'Sutisna',
        rating: 4,
        body: 'Bagus sekali. Pengerjaannya lebih lama dari perkiraan, tapi hasilnya sepadan.',
        locale: 'id',
        daysAgo: 116,
      },
    ],
  },

  // Desa Sindangjaya: Sale Pisang Bu Entin
  'sale-pisang-bu-entin-sale-pisang-basah': {
    description:
      'Sale pisang basah kami dibuat dari pisang ambon matang yang dipanen dari kebun sendiri. Pisang dikupas, dibelah, lalu dijemur di bawah sinar matahari selama sekitar 4 hari sampai warnanya cokelat dan teksturnya kenyal. Tanpa tambahan gula.\n\nRasanya manis legit alami dengan aroma pisang yang kuat. Satu kemasan berisi 250 gram.\n\nSimpan di wadah tertutup di tempat sejuk, atau di kulkas supaya lebih awet. Enak dimakan langsung sebagai camilan, atau dipotong kecil untuk campuran oatmeal dan kue.',
    descriptionEn:
      'Our soft dried bananas are made from ripe ambon bananas harvested from our own garden. The bananas are peeled, split and sun dried for about 4 days until they turn brown and chewy. No sugar is added.\n\nThey taste naturally sweet and rich, with a strong banana aroma. Each pack holds 250 grams.\n\nKeep them in a closed container somewhere cool, or in the fridge so they last longer. Enjoy them straight as a snack, or chop them into oatmeal and cakes.',
    reviews: [
      {
        name: 'Bu Lilih',
        rating: 5,
        body: 'Manisnya alami, kenyal, persis sale buatan orang tua dulu.',
        locale: 'id',
        daysAgo: 23,
      },
      {
        name: 'Taufan Hakim',
        rating: 4,
        body: 'Enak, tapi agak lengket satu sama lain. Mungkin bisa dialasi plastik per lapis.',
        locale: 'id',
        daysAgo: 57,
        reply: 'Terima kasih Kang Taufan, ide yang bagus, akan kami coba.',
      },
      {
        name: 'Anna K.',
        rating: 5,
        body: 'Chewy, sweet and nothing added. A great snack to bring on hikes.',
        locale: 'en',
        daysAgo: 88,
      },
      {
        name: 'Imas Masitoh',
        rating: 5,
        body: 'Buat campuran oatmeal pagi, enak sekali. Pengiriman cepat.',
        locale: 'id',
        daysAgo: 130,
      },
    ],
  },
  'sale-pisang-bu-entin-sale-pisang-goreng': {
    description:
      'Sale pisang goreng dibuat dari sale pisang ambon yang sudah kami jemur sekitar 4 hari, lalu dipotong memanjang, dibalut adonan tepung tipis, dan digoreng sampai kering keemasan.\n\nHasilnya renyah di luar dengan rasa manis legit pisang di dalam. Satu kemasan berisi 250 gram, enak untuk teman minum teh atau kopi.\n\nSimpan di toples kedap udara setelah dibuka supaya tetap renyah. Jauhkan dari tempat lembap dan paling enak dihabiskan dalam dua sampai tiga minggu.',
    descriptionEn:
      'Our fried dried bananas start as ambon bananas sun dried for about 4 days, then cut lengthwise, coated in a thin batter and fried until crisp and golden.\n\nThey are crunchy outside with the rich sweetness of banana inside. Each pack holds 250 grams, nice with tea or coffee.\n\nKeep them in an airtight jar after opening so they stay crisp. Keep them away from damp, and they are best finished within two to three weeks.',
    reviews: [
      {
        name: 'Wahyu Hidayat',
        rating: 5,
        body: 'Renyah dan manis, tepungnya tipis jadi pisangnya tetap dominan.',
        locale: 'id',
        daysAgo: 12,
      },
      {
        name: 'Sri Rejeki',
        rating: 4,
        body: 'Enak, sedikit berminyak tapi masih wajar. Pas buat teman ngeteh.',
        locale: 'id',
        daysAgo: 39,
      },
      {
        name: 'Bu Entis',
        rating: 5,
        body: 'Beli untuk oleh-oleh ke Jakarta, keluarga minta lagi. Kemasannya rapat.',
        locale: 'id',
        daysAgo: 72,
        reply: 'Hatur nuhun Bu Entis, salam untuk keluarga di Jakarta.',
      },
      {
        name: 'Galuh Pertiwi',
        rating: 3,
        body: 'Rasanya enak, tapi beberapa potong sudah agak alot waktu sampai. Mungkin kurang rapat waktu dikemas.',
        locale: 'id',
        daysAgo: 106,
      },
      {
        name: 'Daniel S.',
        rating: 4,
        body: 'Crunchy banana snack, very moreish. A bit sweet for me, but my family finished the bag in a day.',
        locale: 'en',
        daysAgo: 141,
      },
    ],
  },
}
