import type { BusinessData } from '@/types/business';

export const business: BusinessData = {
  theme: {
    primary: '#D4A017',
    primaryDark: '#1A1206',
    accent: '#E85D2C',
    surface: '#FFFBF0',
    textTitle: '#1A1206',
    textBody: '#5C4A2E',
    fontDisplay: 'DM Serif Display',
    fontBody: 'Lato',
  },
  assets: {
    heroImage: '/images/maps-1.jpg',
    galleryImages: ['/images/maps-2.jpg', '/images/stock-1.jpg'],
  },
  content: {
    en: {
      meta: {
        title: 'Mamak Corner',
        description: 'Open 24/7 — roti canai, teh tarik, and your favourite mamak classics in Bangsar.',
      },
      hero: {
        title: 'Your 24-Hour Mamak in Bangsar',
        subtitle: 'Roti canai, teh tarik, and nasi kandar — anytime, day or night',
        cta: 'See Our Menu',
        badge: 'Open 24 Hours',
      },
      hours: {
        'Every Day': 'Open 24 Hours',
      },
      location: {
        address: '15, Jalan Telawi 3, Bangsar, 59100 Kuala Lumpur',
        mapsUrl: 'https://maps.google.com/?q=Mamak+Corner+Bangsar',
        coordinates: { lat: 3.1302, lng: 101.6712 },
      },
      contact: { phone: '+60 3-2282 1234', whatsapp: '+60198765432' },
      reviews: {
        rating: 4.3,
        count: 1240,
        featured: [
          { author: 'Daniel C.', text: 'Best roti canai in Bangsar. Crispy outside, soft inside. The cheese naan is unreal.', rating: 5 },
          { author: 'Aisha M.', text: 'My go-to supper spot. Mee goreng mamak never disappoints at 2am.', rating: 4 },
          { author: 'Wei Jie', text: 'Affordable and fast. Teh tarik here is the real deal.', rating: 5 },
        ],
      },
      trustBar: {
        items: [
          { icon: '⭐', label: 'Google Rating', value: '4.3' },
          { icon: '🕐', label: 'Hours', value: '24/7' },
          { icon: '🏅', label: 'Certification', value: 'Halal' },
        ],
      },
      menu: [
        {
          category: 'Roti & Bread',
          items: [
            { name: 'Roti Canai', description: 'Flaky flatbread with dhal curry', price: 'RM2.50', popular: true },
            { name: 'Roti Telur', description: 'Egg-filled flatbread', price: 'RM3.50' },
            { name: 'Cheese Naan', description: 'Tandoor-baked naan stuffed with melted cheese', price: 'RM5.00', popular: true },
            { name: 'Roti Tissue', description: 'Paper-thin crispy roti cone with condensed milk', price: 'RM4.50' },
          ],
        },
        {
          category: 'Nasi & Mee',
          items: [
            { name: 'Nasi Kandar', description: 'Steamed rice with curry, fried chicken, and vegetables', price: 'RM10.90' },
            { name: 'Mee Goreng Mamak', description: 'Stir-fried yellow noodles with egg, tofu, and spicy sauce', price: 'RM8.90', popular: true },
            { name: 'Maggi Goreng', description: 'Fried Maggi noodles — a mamak classic', price: 'RM7.90' },
          ],
        },
        {
          category: 'Drinks',
          items: [
            { name: 'Teh Tarik', description: 'Pulled milk tea — frothy and sweet', price: 'RM3.00', popular: true },
            { name: 'Milo Dinosaur', description: 'Iced Milo with undissolved Milo powder on top', price: 'RM5.50' },
            { name: 'Teh O Ais Limau', description: 'Iced lime tea — refreshing classic', price: 'RM3.50' },
          ],
        },
      ],
    },
    ms: {
      meta: {
        title: 'Mamak Corner',
        description: 'Buka 24/7 — roti canai, teh tarik, dan hidangan mamak kegemaran anda di Bangsar.',
      },
      hero: {
        title: 'Mamak 24 Jam Anda di Bangsar',
        subtitle: 'Roti canai, teh tarik, dan nasi kandar — bila-bila masa, siang atau malam',
        cta: 'Lihat Menu Kami',
        badge: 'Buka 24 Jam',
      },
      hours: { 'Setiap Hari': 'Buka 24 Jam' },
      location: {
        address: '15, Jalan Telawi 3, Bangsar, 59100 Kuala Lumpur',
        mapsUrl: 'https://maps.google.com/?q=Mamak+Corner+Bangsar',
        coordinates: { lat: 3.1302, lng: 101.6712 },
      },
      contact: { phone: '+60 3-2282 1234', whatsapp: '+60198765432' },
      reviews: {
        rating: 4.3, count: 1240,
        featured: [
          { author: 'Daniel C.', text: 'Roti canai terbaik di Bangsar. Rangup di luar, lembut di dalam.', rating: 5 },
          { author: 'Aisha M.', text: 'Tempat makan malam kegemaran saya. Mee goreng mamak memang best.', rating: 4 },
          { author: 'Wei Jie', text: 'Harga berpatutan dan cepat. Teh tarik sini memang genuine.', rating: 5 },
        ],
      },
      trustBar: {
        items: [
          { icon: '⭐', label: 'Rating Google', value: '4.3' },
          { icon: '🕐', label: 'Waktu', value: '24/7' },
          { icon: '🏅', label: 'Pensijilan', value: 'Halal' },
        ],
      },
      menu: [
        {
          category: 'Roti & Naan',
          items: [
            { name: 'Roti Canai', description: 'Roti berlapis rangup dengan kuah dhal', price: 'RM2.50', popular: true },
            { name: 'Roti Telur', description: 'Roti berisi telur', price: 'RM3.50' },
            { name: 'Cheese Naan', description: 'Naan bakar tandoor berisi keju cair', price: 'RM5.00', popular: true },
            { name: 'Roti Tissue', description: 'Roti kon nipis rangup dengan susu pekat', price: 'RM4.50' },
          ],
        },
        {
          category: 'Nasi & Mee',
          items: [
            { name: 'Nasi Kandar', description: 'Nasi putih dengan kari, ayam goreng, dan sayur', price: 'RM10.90' },
            { name: 'Mee Goreng Mamak', description: 'Mi kuning goreng dengan telur, tauhu, dan sos pedas', price: 'RM8.90', popular: true },
            { name: 'Maggi Goreng', description: 'Mi Maggi goreng — klasik mamak', price: 'RM7.90' },
          ],
        },
        {
          category: 'Minuman',
          items: [
            { name: 'Teh Tarik', description: 'Teh susu tarik — berbuih dan manis', price: 'RM3.00', popular: true },
            { name: 'Milo Dinosaur', description: 'Milo ais dengan serbuk Milo di atas', price: 'RM5.50' },
            { name: 'Teh O Ais Limau', description: 'Teh limau ais — penyegar klasik', price: 'RM3.50' },
          ],
        },
      ],
    },
    'zh-CN': {
      meta: {
        title: 'Mamak Corner 嘛嘛档',
        description: '24小时营业 — 印度煎饼、拉茶和你最爱的嘛嘛档经典美食，就在孟沙。',
      },
      hero: {
        title: '孟沙24小时嘛嘛档',
        subtitle: '印度煎饼、拉茶和印度炒饭 — 随时享用，不分昼夜',
        cta: '查看菜单',
        badge: '24小时营业',
      },
      hours: { '每天': '24小时营业' },
      location: {
        address: '15, Jalan Telawi 3, Bangsar, 59100 吉隆坡',
        mapsUrl: 'https://maps.google.com/?q=Mamak+Corner+Bangsar',
        coordinates: { lat: 3.1302, lng: 101.6712 },
      },
      contact: { phone: '+60 3-2282 1234', whatsapp: '+60198765432' },
      reviews: {
        rating: 4.3, count: 1240,
        featured: [
          { author: 'Daniel C.', text: '孟沙最好的印度煎饼。外酥内软，芝士烤饼绝了。', rating: 5 },
          { author: 'Aisha M.', text: '我的深夜必去。凌晨2点的嘛嘛炒面从未让我失望。', rating: 4 },
          { author: 'Wei Jie', text: '价格实惠，上菜快。这里的拉茶是正宗的。', rating: 5 },
        ],
      },
      trustBar: {
        items: [
          { icon: '⭐', label: '谷歌评分', value: '4.3' },
          { icon: '🕐', label: '营业时间', value: '24/7' },
          { icon: '🏅', label: '认证', value: '清真' },
        ],
      },
      menu: [
        {
          category: '印度煎饼和烤饼',
          items: [
            { name: 'Roti Canai 印度煎饼', description: '酥脆千层饼配咖喱豆酱', price: 'RM2.50', popular: true },
            { name: 'Roti Telur 鸡蛋煎饼', description: '鸡蛋馅千层饼', price: 'RM3.50' },
            { name: 'Cheese Naan 芝士烤饼', description: '窑烤芝士烤饼', price: 'RM5.00', popular: true },
            { name: 'Roti Tissue 纸巾煎饼', description: '薄脆锥形煎饼配炼乳', price: 'RM4.50' },
          ],
        },
        {
          category: '饭和面',
          items: [
            { name: 'Nasi Kandar 扁担饭', description: '白饭配咖喱、炸鸡和蔬菜', price: 'RM10.90' },
            { name: 'Mee Goreng Mamak 嘛嘛炒面', description: '黄面炒鸡蛋、豆腐和辣酱', price: 'RM8.90', popular: true },
            { name: 'Maggi Goreng 炒美极面', description: '炒美极方便面 — 嘛嘛档经典', price: 'RM7.90' },
          ],
        },
        {
          category: '饮料',
          items: [
            { name: 'Teh Tarik 拉茶', description: '拉丝奶茶 — 泡沫丰富，甜度适中', price: 'RM3.00', popular: true },
            { name: 'Milo Dinosaur 恐龙美禄', description: '冰美禄上撒未溶化的美禄粉', price: 'RM5.50' },
            { name: 'Teh O Ais Limau 冰柠茶', description: '冰柠檬红茶 — 清爽经典', price: 'RM3.50' },
          ],
        },
      ],
    },
    'zh-TW': {
      meta: {
        title: 'Mamak Corner 嘛嘛檔',
        description: '24小時營業 — 印度煎餅、拉茶和你最愛的嘛嘛檔經典美食，就在孟沙。',
      },
      hero: {
        title: '孟沙24小時嘛嘛檔',
        subtitle: '印度煎餅、拉茶和印度炒飯 — 隨時享用，不分晝夜',
        cta: '查看菜單',
        badge: '24小時營業',
      },
      hours: { '每天': '24小時營業' },
      location: {
        address: '15, Jalan Telawi 3, Bangsar, 59100 吉隆坡',
        mapsUrl: 'https://maps.google.com/?q=Mamak+Corner+Bangsar',
        coordinates: { lat: 3.1302, lng: 101.6712 },
      },
      contact: { phone: '+60 3-2282 1234', whatsapp: '+60198765432' },
      reviews: {
        rating: 4.3, count: 1240,
        featured: [
          { author: 'Daniel C.', text: '孟沙最好的印度煎餅。外酥內軟，芝士烤餅絕了。', rating: 5 },
          { author: 'Aisha M.', text: '我的深夜必去。凌晨2點的嘛嘛炒麵從未讓我失望。', rating: 4 },
          { author: 'Wei Jie', text: '價格實惠，上菜快。這裡的拉茶是正宗的。', rating: 5 },
        ],
      },
      trustBar: {
        items: [
          { icon: '⭐', label: 'Google評分', value: '4.3' },
          { icon: '🕐', label: '營業時間', value: '24/7' },
          { icon: '🏅', label: '認證', value: '清真' },
        ],
      },
      menu: [
        {
          category: '印度煎餅和烤餅',
          items: [
            { name: 'Roti Canai 印度煎餅', description: '酥脆千層餅配咖哩豆醬', price: 'RM2.50', popular: true },
            { name: 'Roti Telur 雞蛋煎餅', description: '雞蛋餡千層餅', price: 'RM3.50' },
            { name: 'Cheese Naan 芝士烤餅', description: '窯烤芝士烤餅', price: 'RM5.00', popular: true },
            { name: 'Roti Tissue 紙巾煎餅', description: '薄脆錐形煎餅配煉乳', price: 'RM4.50' },
          ],
        },
        {
          category: '飯和麵',
          items: [
            { name: 'Nasi Kandar 扁擔飯', description: '白飯配咖哩、炸雞和蔬菜', price: 'RM10.90' },
            { name: 'Mee Goreng Mamak 嘛嘛炒麵', description: '黃麵炒雞蛋、豆腐和辣醬', price: 'RM8.90', popular: true },
            { name: 'Maggi Goreng 炒美極麵', description: '炒美極方便麵 — 嘛嘛檔經典', price: 'RM7.90' },
          ],
        },
        {
          category: '飲料',
          items: [
            { name: 'Teh Tarik 拉茶', description: '拉絲奶茶 — 泡沫豐富，甜度適中', price: 'RM3.00', popular: true },
            { name: 'Milo Dinosaur 恐龍美祿', description: '冰美祿上撒未溶化的美祿粉', price: 'RM5.50' },
            { name: 'Teh O Ais Limau 冰檸茶', description: '冰檸檬紅茶 — 清爽經典', price: 'RM3.50' },
          ],
        },
      ],
    },
  },
};
