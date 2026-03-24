import type { BusinessData } from '@/types/business';

export const business: BusinessData = {
  theme: {
    primary: '#B76E79',
    primaryDark: '#2D1F22',
    accent: '#C9A96E',
    surface: '#FFF5F5',
    textTitle: '#2D1F22',
    textBody: '#5C4A4E',
    fontDisplay: 'Cormorant Garamond',
    fontBody: 'Nunito',
  },
  assets: {
    heroImage: '/images/maps-1.jpg',
    galleryImages: ['/images/maps-2.jpg', '/images/stock-1.jpg'],
  },
  content: {
    en: {
      meta: {
        title: 'Glow Studio',
        description: 'Hair, nails, and facial treatments in the heart of Mont Kiara — your glow-up starts here.',
      },
      hero: {
        title: 'Your Glow-Up Starts Here',
        subtitle: 'Expert hair styling, nail art, and facial care in Mont Kiara',
        cta: 'Book an Appointment',
      },
      hours: {
        Monday: 'Closed',
        Tuesday: '10:00 AM – 8:00 PM',
        Wednesday: '10:00 AM – 8:00 PM',
        Thursday: '10:00 AM – 8:00 PM',
        Friday: '10:00 AM – 9:00 PM',
        Saturday: '9:00 AM – 9:00 PM',
        Sunday: '10:00 AM – 6:00 PM',
      },
      location: {
        address: '23A, Jalan Kiara 3, Mont Kiara, 50480 Kuala Lumpur',
        mapsUrl: 'https://maps.google.com/?q=Glow+Studio+Mont+Kiara',
        coordinates: { lat: 3.1715, lng: 101.6534 },
      },
      contact: { phone: '+60 3-6411 7788', whatsapp: '+60176543210' },
      reviews: {
        rating: 4.8,
        count: 342,
        featured: [
          { author: 'Lisa W.', text: 'My balayage turned out exactly like the reference photo. The stylist really listened!', rating: 5 },
          { author: 'Nurul H.', text: 'Love the private room option. Very Muslimah-friendly. Will definitely come back.', rating: 5 },
          { author: 'Mei Ling', text: 'Clean, modern, and the gel nails lasted 3 weeks. Great value for Mont Kiara.', rating: 4 },
        ],
      },
      trustBar: {
        items: [
          { icon: '⭐', label: 'Google Rating', value: '4.8' },
          { icon: '📅', label: 'Established', value: '2019' },
          { icon: '👩', label: 'Stylists', value: '8' },
        ],
      },
      services: [
        {
          category: 'Hair',
          items: [
            { name: 'Wash & Blow', description: 'Shampoo, condition, and professional blow-dry', price: 'RM45', duration: '45 min' },
            { name: 'Haircut & Styling', description: 'Consultation, cut, and styled finish', price: 'RM85', duration: '1 hr' },
            { name: 'Balayage / Highlights', description: 'Hand-painted color for a natural sun-kissed look', price: 'From RM280', duration: '2.5 hrs' },
            { name: 'Keratin Treatment', description: 'Smoothing treatment for frizz-free, glossy hair', price: 'From RM350', duration: '2 hrs' },
          ],
        },
        {
          category: 'Nails',
          items: [
            { name: 'Classic Manicure', description: 'Shape, buff, cuticle care, and polish', price: 'RM38', duration: '30 min' },
            { name: 'Gel Manicure', description: 'Long-lasting gel polish with nail art options', price: 'RM68', duration: '45 min' },
            { name: 'Pedicure', description: 'Foot soak, scrub, and polish', price: 'RM55', duration: '45 min' },
          ],
        },
        {
          category: 'Facial',
          items: [
            { name: 'Deep Cleansing Facial', description: 'Extraction, hydration mask, and LED therapy', price: 'RM128', duration: '1 hr' },
            { name: 'Anti-Aging Facial', description: 'Collagen boost treatment with firming massage', price: 'RM188', duration: '1.5 hrs' },
          ],
        },
      ],
    },
    ms: {
      meta: {
        title: 'Glow Studio',
        description: 'Rawatan rambut, kuku, dan facial di jantung Mont Kiara — penampilan terbaik bermula di sini.',
      },
      hero: {
        title: 'Penampilan Terbaik Bermula Di Sini',
        subtitle: 'Penggayaan rambut, seni kuku, dan penjagaan facial pakar di Mont Kiara',
        cta: 'Tempah Temu Janji',
      },
      hours: {
        Isnin: 'Tutup',
        Selasa: '10:00 PG – 8:00 MLM',
        Rabu: '10:00 PG – 8:00 MLM',
        Khamis: '10:00 PG – 8:00 MLM',
        Jumaat: '10:00 PG – 9:00 MLM',
        Sabtu: '9:00 PG – 9:00 MLM',
        Ahad: '10:00 PG – 6:00 PTG',
      },
      location: {
        address: '23A, Jalan Kiara 3, Mont Kiara, 50480 Kuala Lumpur',
        mapsUrl: 'https://maps.google.com/?q=Glow+Studio+Mont+Kiara',
        coordinates: { lat: 3.1715, lng: 101.6534 },
      },
      contact: { phone: '+60 3-6411 7788', whatsapp: '+60176543210' },
      reviews: {
        rating: 4.8, count: 342,
        featured: [
          { author: 'Lisa W.', text: 'Balayage saya jadi betul-betul macam gambar rujukan. Stylist memang dengar apa kita nak!', rating: 5 },
          { author: 'Nurul H.', text: 'Suka bilik peribadi. Sangat mesra Muslimah. Pasti datang lagi.', rating: 5 },
          { author: 'Mei Ling', text: 'Bersih, moden, dan gel kuku tahan 3 minggu. Berbaloi untuk Mont Kiara.', rating: 4 },
        ],
      },
      trustBar: {
        items: [
          { icon: '⭐', label: 'Rating Google', value: '4.8' },
          { icon: '📅', label: 'Ditubuhkan', value: '2019' },
          { icon: '👩', label: 'Stylist', value: '8' },
        ],
      },
      services: [
        {
          category: 'Rambut',
          items: [
            { name: 'Basuh & Blow', description: 'Syampu, kondisioner, dan blow-dry profesional', price: 'RM45', duration: '45 min' },
            { name: 'Gunting & Gaya', description: 'Konsultasi, gunting, dan penggayaan', price: 'RM85', duration: '1 jam' },
            { name: 'Balayage / Highlights', description: 'Pewarnaan tangan untuk rupa natural', price: 'Dari RM280', duration: '2.5 jam' },
            { name: 'Rawatan Keratin', description: 'Rawatan pelicinan untuk rambut berkilau tanpa frizz', price: 'Dari RM350', duration: '2 jam' },
          ],
        },
        {
          category: 'Kuku',
          items: [
            { name: 'Manikur Klasik', description: 'Bentuk, gilap, penjagaan kutikula, dan cat', price: 'RM38', duration: '30 min' },
            { name: 'Manikur Gel', description: 'Cat gel tahan lama dengan pilihan seni kuku', price: 'RM68', duration: '45 min' },
            { name: 'Pedikur', description: 'Rendam kaki, scrub, dan cat', price: 'RM55', duration: '45 min' },
          ],
        },
        {
          category: 'Facial',
          items: [
            { name: 'Facial Pembersihan Mendalam', description: 'Ekstraksi, masker hidrasi, dan terapi LED', price: 'RM128', duration: '1 jam' },
            { name: 'Facial Anti-Penuaan', description: 'Rawatan kolagen dengan urutan pengencangan', price: 'RM188', duration: '1.5 jam' },
          ],
        },
      ],
    },
    'zh-CN': {
      meta: {
        title: 'Glow Studio 焕彩工作室',
        description: '满家乐核心地带的发型、美甲和护肤服务 — 你的蜕变从这里开始。',
      },
      hero: {
        title: '你的蜕变从这里开始',
        subtitle: '满家乐专业发型设计、美甲艺术和面部护理',
        cta: '预约',
      },
      hours: {
        '周一': '休息',
        '周二': '上午10:00 – 晚上8:00',
        '周三': '上午10:00 – 晚上8:00',
        '周四': '上午10:00 – 晚上8:00',
        '周五': '上午10:00 – 晚上9:00',
        '周六': '上午9:00 – 晚上9:00',
        '周日': '上午10:00 – 下午6:00',
      },
      location: {
        address: '23A, Jalan Kiara 3, Mont Kiara, 50480 吉隆坡',
        mapsUrl: 'https://maps.google.com/?q=Glow+Studio+Mont+Kiara',
        coordinates: { lat: 3.1715, lng: 101.6534 },
      },
      contact: { phone: '+60 3-6411 7788', whatsapp: '+60176543210' },
      reviews: {
        rating: 4.8, count: 342,
        featured: [
          { author: 'Lisa W.', text: '我的挑染效果跟参考图一模一样。发型师真的很用心倾听！', rating: 5 },
          { author: 'Nurul H.', text: '喜欢私人房间选项。非常穆斯林友好。一定会再来。', rating: 5 },
          { author: 'Mei Ling', text: '干净、现代，甲油持续了3周。满家乐性价比很高。', rating: 4 },
        ],
      },
      trustBar: {
        items: [
          { icon: '⭐', label: '谷歌评分', value: '4.8' },
          { icon: '📅', label: '创立于', value: '2019' },
          { icon: '👩', label: '造型师', value: '8' },
        ],
      },
      services: [
        {
          category: '头发',
          items: [
            { name: 'Wash & Blow 洗吹', description: '洗发、护发和专业吹干', price: 'RM45', duration: '45分钟' },
            { name: 'Haircut 剪发造型', description: '咨询、剪发和造型', price: 'RM85', duration: '1小时' },
            { name: 'Balayage 手涂挑染', description: '手绘染色打造自然阳光感', price: '从RM280起', duration: '2.5小时' },
            { name: 'Keratin 角蛋白护理', description: '顺滑护理，告别毛躁', price: '从RM350起', duration: '2小时' },
          ],
        },
        {
          category: '美甲',
          items: [
            { name: 'Classic Manicure 经典美甲', description: '修型、抛光、修护甲缘、涂色', price: 'RM38', duration: '30分钟' },
            { name: 'Gel Manicure 凝胶美甲', description: '持久凝胶甲油，可选美甲艺术', price: 'RM68', duration: '45分钟' },
            { name: 'Pedicure 足部护理', description: '足浴、去角质和涂色', price: 'RM55', duration: '45分钟' },
          ],
        },
        {
          category: '面部护理',
          items: [
            { name: '深层清洁面部护理', description: '清除黑头、补水面膜和LED光疗', price: 'RM128', duration: '1小时' },
            { name: '抗衰老面部护理', description: '胶原蛋白提升配合紧致按摩', price: 'RM188', duration: '1.5小时' },
          ],
        },
      ],
    },
    'zh-TW': {
      meta: {
        title: 'Glow Studio 煥彩工作室',
        description: '滿家樂核心地帶的髮型、美甲和護膚服務 — 你的蛻變從這裡開始。',
      },
      hero: {
        title: '你的蛻變從這裡開始',
        subtitle: '滿家樂專業髮型設計、美甲藝術和面部護理',
        cta: '預約',
      },
      hours: {
        '週一': '休息',
        '週二': '上午10:00 – 晚上8:00',
        '週三': '上午10:00 – 晚上8:00',
        '週四': '上午10:00 – 晚上8:00',
        '週五': '上午10:00 – 晚上9:00',
        '週六': '上午9:00 – 晚上9:00',
        '週日': '上午10:00 – 下午6:00',
      },
      location: {
        address: '23A, Jalan Kiara 3, Mont Kiara, 50480 吉隆坡',
        mapsUrl: 'https://maps.google.com/?q=Glow+Studio+Mont+Kiara',
        coordinates: { lat: 3.1715, lng: 101.6534 },
      },
      contact: { phone: '+60 3-6411 7788', whatsapp: '+60176543210' },
      reviews: {
        rating: 4.8, count: 342,
        featured: [
          { author: 'Lisa W.', text: '我的挑染效果跟參考圖一模一樣。髮型師真的很用心傾聽！', rating: 5 },
          { author: 'Nurul H.', text: '喜歡私人房間選項。非常穆斯林友好。一定會再來。', rating: 5 },
          { author: 'Mei Ling', text: '乾淨、現代，甲油持續了3週。滿家樂性價比很高。', rating: 4 },
        ],
      },
      trustBar: {
        items: [
          { icon: '⭐', label: 'Google評分', value: '4.8' },
          { icon: '📅', label: '創立於', value: '2019' },
          { icon: '👩', label: '造型師', value: '8' },
        ],
      },
      services: [
        {
          category: '頭髮',
          items: [
            { name: 'Wash & Blow 洗吹', description: '洗髮、護髮和專業吹乾', price: 'RM45', duration: '45分鐘' },
            { name: 'Haircut 剪髮造型', description: '諮詢、剪髮和造型', price: 'RM85', duration: '1小時' },
            { name: 'Balayage 手塗挑染', description: '手繪染色打造自然陽光感', price: '從RM280起', duration: '2.5小時' },
            { name: 'Keratin 角蛋白護理', description: '順滑護理，告別毛躁', price: '從RM350起', duration: '2小時' },
          ],
        },
        {
          category: '美甲',
          items: [
            { name: 'Classic Manicure 經典美甲', description: '修型、拋光、修護甲緣、塗色', price: 'RM38', duration: '30分鐘' },
            { name: 'Gel Manicure 凝膠美甲', description: '持久凝膠甲油，可選美甲藝術', price: 'RM68', duration: '45分鐘' },
            { name: 'Pedicure 足部護理', description: '足浴、去角質和塗色', price: 'RM55', duration: '45分鐘' },
          ],
        },
        {
          category: '面部護理',
          items: [
            { name: '深層清潔面部護理', description: '清除黑頭、補水面膜和LED光療', price: 'RM128', duration: '1小時' },
            { name: '抗衰老面部護理', description: '膠原蛋白提升配合緊緻按摩', price: 'RM188', duration: '1.5小時' },
          ],
        },
      ],
    },
  },
};
