import type { BusinessData } from '@/types/business';

export const business: BusinessData = {
  theme: {
    primary: '#C4571A',
    primaryDark: '#2D1810',
    accent: '#E8A838',
    surface: '#FFF8F0',
    textTitle: '#2D1810',
    textBody: '#5C4033',
    fontDisplay: 'Playfair Display',
    fontBody: 'Lato',
  },
  assets: {
    heroImage: '/images/maps-1.jpg',
    galleryImages: ['/images/maps-2.jpg', '/images/maps-3.jpg', '/images/stock-1.jpg'],
  },
  content: {
    en: {
      meta: {
        title: 'Nasi Lemak House',
        description: "KL's favourite nasi lemak since 1998 — fragrant coconut rice, spicy sambal, and Malaysian classics.",
      },
      hero: {
        title: 'Authentic Nasi Lemak, Made Fresh Daily',
        subtitle: 'Serving Kuala Lumpur the best coconut rice and sambal since 1998',
        cta: 'View Our Menu',
        badge: 'Halal Certified',
      },
      hours: {
        Monday: '7:00 AM – 10:00 PM',
        Tuesday: '7:00 AM – 10:00 PM',
        Wednesday: '7:00 AM – 10:00 PM',
        Thursday: '7:00 AM – 10:00 PM',
        Friday: '7:00 AM – 11:00 PM',
        Saturday: '7:00 AM – 11:00 PM',
        Sunday: '8:00 AM – 10:00 PM',
      },
      location: {
        address: '23, Jalan Alor, Bukit Bintang, 50200 Kuala Lumpur',
        mapsUrl: 'https://maps.google.com/?q=Nasi+Lemak+House+Jalan+Alor',
        coordinates: { lat: 3.1456, lng: 101.7089 },
      },
      contact: {
        phone: '+60 3-2141 8899',
        whatsapp: '+60123456789',
      },
      reviews: {
        rating: 4.6,
        count: 892,
        featured: [
          { author: 'Sarah L.', text: 'Best nasi lemak in KL! The sambal is incredible and the rendang melts in your mouth.', rating: 5 },
          { author: 'Ahmad R.', text: 'Been coming here for 10 years. Consistent quality, fair prices, and always fresh.', rating: 5 },
          { author: 'Jenny T.', text: 'Great food and cozy atmosphere. The ayam goreng berempah is a must-try!', rating: 4 },
        ],
      },
      trustBar: {
        items: [
          { icon: '⭐', label: 'Google Rating', value: '4.6' },
          { icon: '📅', label: 'Established', value: '1998' },
          { icon: '🏅', label: 'Certification', value: 'Halal' },
        ],
      },
      menu: [
        {
          category: 'Nasi Lemak Specials',
          items: [
            { name: 'Nasi Lemak Ayam Goreng', description: 'Fragrant coconut rice with crispy fried chicken, sambal, egg, peanuts & anchovies', price: 'RM12.90', popular: true },
            { name: 'Nasi Lemak Rendang', description: 'Coconut rice with slow-cooked beef rendang', price: 'RM15.90', popular: true },
            { name: 'Nasi Lemak Sotong', description: 'Coconut rice with spicy squid sambal', price: 'RM13.90' },
            { name: 'Nasi Lemak Biasa', description: 'Classic coconut rice with sambal, egg, peanuts & anchovies', price: 'RM6.90' },
          ],
        },
        {
          category: 'Sides & Drinks',
          items: [
            { name: 'Teh Tarik', description: 'Pulled milk tea — Malaysian classic', price: 'RM3.50' },
            { name: 'Roti Canai', description: 'Flaky flatbread with dhal', price: 'RM3.00' },
            { name: 'Satay Ayam (6 pcs)', description: 'Chicken skewers with peanut sauce', price: 'RM12.00' },
          ],
        },
      ],
    },
    ms: {
      meta: {
        title: 'Nasi Lemak House',
        description: 'Nasi lemak kegemaran KL sejak 1998 — nasi kelapa wangi, sambal pedas, dan klasik Malaysia.',
      },
      hero: {
        title: 'Nasi Lemak Asli, Segar Setiap Hari',
        subtitle: 'Menghidangkan nasi kelapa dan sambal terbaik di Kuala Lumpur sejak 1998',
        cta: 'Lihat Menu Kami',
        badge: 'Sijil Halal',
      },
      hours: {
        Isnin: '7:00 PG – 10:00 MLM',
        Selasa: '7:00 PG – 10:00 MLM',
        Rabu: '7:00 PG – 10:00 MLM',
        Khamis: '7:00 PG – 10:00 MLM',
        Jumaat: '7:00 PG – 11:00 MLM',
        Sabtu: '7:00 PG – 11:00 MLM',
        Ahad: '8:00 PG – 10:00 MLM',
      },
      location: {
        address: '23, Jalan Alor, Bukit Bintang, 50200 Kuala Lumpur',
        mapsUrl: 'https://maps.google.com/?q=Nasi+Lemak+House+Jalan+Alor',
        coordinates: { lat: 3.1456, lng: 101.7089 },
      },
      contact: {
        phone: '+60 3-2141 8899',
        whatsapp: '+60123456789',
      },
      reviews: {
        rating: 4.6,
        count: 892,
        featured: [
          { author: 'Sarah L.', text: 'Nasi lemak terbaik di KL! Sambal memang sedap dan rendang cair di mulut.', rating: 5 },
          { author: 'Ahmad R.', text: 'Dah datang sini 10 tahun. Kualiti konsisten, harga berpatutan, sentiasa segar.', rating: 5 },
          { author: 'Jenny T.', text: 'Makanan sedap dan suasana selesa. Ayam goreng berempah wajib cuba!', rating: 4 },
        ],
      },
      trustBar: {
        items: [
          { icon: '⭐', label: 'Rating Google', value: '4.6' },
          { icon: '📅', label: 'Ditubuhkan', value: '1998' },
          { icon: '🏅', label: 'Pensijilan', value: 'Halal' },
        ],
      },
      menu: [
        {
          category: 'Nasi Lemak Istimewa',
          items: [
            { name: 'Nasi Lemak Ayam Goreng', description: 'Nasi kelapa wangi dengan ayam goreng rangup, sambal, telur, kacang & ikan bilis', price: 'RM12.90', popular: true },
            { name: 'Nasi Lemak Rendang', description: 'Nasi kelapa dengan rendang daging masak perlahan', price: 'RM15.90', popular: true },
            { name: 'Nasi Lemak Sotong', description: 'Nasi kelapa dengan sambal sotong pedas', price: 'RM13.90' },
            { name: 'Nasi Lemak Biasa', description: 'Nasi kelapa klasik dengan sambal, telur, kacang & ikan bilis', price: 'RM6.90' },
          ],
        },
        {
          category: 'Sampingan & Minuman',
          items: [
            { name: 'Teh Tarik', description: 'Teh susu tarik — klasik Malaysia', price: 'RM3.50' },
            { name: 'Roti Canai', description: 'Roti leper berlapis dengan dhal', price: 'RM3.00' },
            { name: 'Satay Ayam (6 cucuk)', description: 'Cucuk ayam dengan kuah kacang', price: 'RM12.00' },
          ],
        },
      ],
    },
    'zh-CN': {
      meta: {
        title: 'Nasi Lemak House 椰浆饭屋',
        description: '吉隆坡自1998年以来最受欢迎的椰浆饭 — 香浓椰浆饭、辣味参巴酱和马来西亚经典美食。',
      },
      hero: {
        title: '正宗椰浆饭，每日新鲜制作',
        subtitle: '自1998年为吉隆坡提供最好的椰浆饭和参巴酱',
        cta: '查看菜单',
        badge: '清真认证',
      },
      hours: {
        '周一': '上午7:00 – 晚上10:00',
        '周二': '上午7:00 – 晚上10:00',
        '周三': '上午7:00 – 晚上10:00',
        '周四': '上午7:00 – 晚上10:00',
        '周五': '上午7:00 – 晚上11:00',
        '周六': '上午7:00 – 晚上11:00',
        '周日': '上午8:00 – 晚上10:00',
      },
      location: {
        address: '23, Jalan Alor, Bukit Bintang, 50200 吉隆坡',
        mapsUrl: 'https://maps.google.com/?q=Nasi+Lemak+House+Jalan+Alor',
        coordinates: { lat: 3.1456, lng: 101.7089 },
      },
      contact: {
        phone: '+60 3-2141 8899',
        whatsapp: '+60123456789',
      },
      reviews: {
        rating: 4.6,
        count: 892,
        featured: [
          { author: 'Sarah L.', text: '吉隆坡最好的椰浆饭！参巴酱太棒了，仁当牛肉入口即化。', rating: 5 },
          { author: 'Ahmad R.', text: '来这里吃了10年了。品质始终如一，价格公道，永远新鲜。', rating: 5 },
          { author: 'Jenny T.', text: '食物很棒，氛围温馨。香料炸鸡一定要试！', rating: 4 },
        ],
      },
      trustBar: {
        items: [
          { icon: '⭐', label: '谷歌评分', value: '4.6' },
          { icon: '📅', label: '创立于', value: '1998' },
          { icon: '🏅', label: '认证', value: '清真' },
        ],
      },
      menu: [
        {
          category: '椰浆饭特色',
          items: [
            { name: 'Nasi Lemak Ayam Goreng 炸鸡椰浆饭', description: '香浓椰浆饭配酥脆炸鸡、参巴酱、鸡蛋、花生和江鱼仔', price: 'RM12.90', popular: true },
            { name: 'Nasi Lemak Rendang 仁当椰浆饭', description: '椰浆饭配慢炖仁当牛肉', price: 'RM15.90', popular: true },
            { name: 'Nasi Lemak Sotong 鱿鱼椰浆饭', description: '椰浆饭配辣味鱿鱼参巴', price: 'RM13.90' },
            { name: 'Nasi Lemak Biasa 经典椰浆饭', description: '经典椰浆饭配参巴酱、鸡蛋、花生和江鱼仔', price: 'RM6.90' },
          ],
        },
        {
          category: '小食和饮料',
          items: [
            { name: 'Teh Tarik 拉茶', description: '拉丝奶茶 — 马来西亚经典', price: 'RM3.50' },
            { name: 'Roti Canai 印度煎饼', description: '层叠薄饼配咖喱豆酱', price: 'RM3.00' },
            { name: 'Satay Ayam 沙爹鸡肉串（6串）', description: '鸡肉串配花生酱', price: 'RM12.00' },
          ],
        },
      ],
    },
    'zh-TW': {
      meta: {
        title: 'Nasi Lemak House 椰漿飯屋',
        description: '吉隆坡自1998年以來最受歡迎的椰漿飯 — 香濃椰漿飯、辣味參巴醬和馬來西亞經典美食。',
      },
      hero: {
        title: '正宗椰漿飯，每日新鮮製作',
        subtitle: '自1998年為吉隆坡提供最好的椰漿飯和參巴醬',
        cta: '查看菜單',
        badge: '清真認證',
      },
      hours: {
        '週一': '上午7:00 – 晚上10:00',
        '週二': '上午7:00 – 晚上10:00',
        '週三': '上午7:00 – 晚上10:00',
        '週四': '上午7:00 – 晚上10:00',
        '週五': '上午7:00 – 晚上11:00',
        '週六': '上午7:00 – 晚上11:00',
        '週日': '上午8:00 – 晚上10:00',
      },
      location: {
        address: '23, Jalan Alor, Bukit Bintang, 50200 吉隆坡',
        mapsUrl: 'https://maps.google.com/?q=Nasi+Lemak+House+Jalan+Alor',
        coordinates: { lat: 3.1456, lng: 101.7089 },
      },
      contact: {
        phone: '+60 3-2141 8899',
        whatsapp: '+60123456789',
      },
      reviews: {
        rating: 4.6,
        count: 892,
        featured: [
          { author: 'Sarah L.', text: '吉隆坡最好的椰漿飯！參巴醬太棒了，仁當牛肉入口即化。', rating: 5 },
          { author: 'Ahmad R.', text: '來這裡吃了10年了。品質始終如一，價格公道，永遠新鮮。', rating: 5 },
          { author: 'Jenny T.', text: '食物很棒，氛圍溫馨。香料炸雞一定要試！', rating: 4 },
        ],
      },
      trustBar: {
        items: [
          { icon: '⭐', label: 'Google評分', value: '4.6' },
          { icon: '📅', label: '創立於', value: '1998' },
          { icon: '🏅', label: '認證', value: '清真' },
        ],
      },
      menu: [
        {
          category: '椰漿飯特色',
          items: [
            { name: 'Nasi Lemak Ayam Goreng 炸雞椰漿飯', description: '香濃椰漿飯配酥脆炸雞、參巴醬、雞蛋、花生和江魚仔', price: 'RM12.90', popular: true },
            { name: 'Nasi Lemak Rendang 仁當椰漿飯', description: '椰漿飯配慢燉仁當牛肉', price: 'RM15.90', popular: true },
            { name: 'Nasi Lemak Sotong 魷魚椰漿飯', description: '椰漿飯配辣味魷魚參巴', price: 'RM13.90' },
            { name: 'Nasi Lemak Biasa 經典椰漿飯', description: '經典椰漿飯配參巴醬、雞蛋、花生和江魚仔', price: 'RM6.90' },
          ],
        },
        {
          category: '小食和飲料',
          items: [
            { name: 'Teh Tarik 拉茶', description: '拉絲奶茶 — 馬來西亞經典', price: 'RM3.50' },
            { name: 'Roti Canai 印度煎餅', description: '層疊薄餅配咖哩豆醬', price: 'RM3.00' },
            { name: 'Satay Ayam 沙爹雞肉串（6串）', description: '雞肉串配花生醬', price: 'RM12.00' },
          ],
        },
      ],
    },
  },
};
