import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { searchPlaces, type PlaceResult } from '../discover/search';
import { downloadMapsPhotos } from '../assets/maps-photos';
import { downloadStockPhotos } from '../assets/stock-photos';
import { extractAndSave } from '../assets/extract-colors';
import { optimizeImages } from '../assets/optimize-images';
import { deployToVercel } from '../deploy/deploy';
import { INDUSTRY_CONFIG, classifyIndustry, slugify } from '../generate/industry-config';

interface BatchConfig {
  city: string;
  categories: string[];
  batchSize: number;
}

interface BatchResult {
  placeId: string;
  name: string;
  industry: string;
  url?: string;
  repo?: string;
  status: 'deployed' | 'failed' | 'skipped';
  error?: string;
}

function copyTemplates(industry: string, outputDir: string) {
  const designDir = path.join(__dirname, '../../.claude/skills/duocode-design/templates');
  const sharedDir = path.join(designDir, '_shared');
  const industryDir = path.join(designDir, industry);

  // Copy _shared config files
  for (const f of ['package.json', 'next.config.js', 'tailwind.config.ts', 'tsconfig.json', 'postcss.config.js']) {
    const src = path.join(sharedDir, f);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(outputDir, f));
  }

  // Copy _shared src/
  execSync(`cp -r "${path.join(sharedDir, 'src')}"/* "${path.join(outputDir, 'src')}/"`, { stdio: 'pipe' });

  // Overlay industry-specific files
  if (fs.existsSync(industryDir)) {
    const pageSrc = path.join(industryDir, 'page.tsx');
    if (fs.existsSync(pageSrc)) {
      fs.copyFileSync(pageSrc, path.join(outputDir, 'src/app/[locale]/page.tsx'));
    }
    const compDir = path.join(industryDir, 'components');
    if (fs.existsSync(compDir)) {
      for (const comp of fs.readdirSync(compDir)) {
        fs.copyFileSync(path.join(compDir, comp), path.join(outputDir, 'src/components', comp));
      }
    }
  }
}

// ── Industry content templates ──────────────────────────────────
const INDUSTRY_CONTENT: Record<string, {
  taglines: { en: string; ms: string; zhCN: string; zhTW: string }[];
  cta: { en: string; ms: string; zhCN: string; zhTW: string };
  menu?: { en: any[]; ms: any[]; zhCN: any[]; zhTW: any[] };
  services?: { en: any[]; ms: any[]; zhCN: any[]; zhTW: any[] };
  reviewTemplates: { en: string[]; ms: string[]; zhCN: string[]; zhTW: string[] };
}> = {
  restaurant: {
    taglines: [
      { en: 'Serving {city}\'s finest flavours since day one', ms: 'Menghidangkan rasa terbaik {city}', zhCN: '为{city}呈献最佳风味', zhTW: '為{city}呈獻最佳風味' },
      { en: 'Where every meal tells a story', ms: 'Di mana setiap hidangan bercerita', zhCN: '每一餐都诉说着故事', zhTW: '每一餐都訴說著故事' },
      { en: 'Authentic flavours, made with passion', ms: 'Rasa asli, dimasak dengan penuh semangat', zhCN: '正宗风味，用心烹制', zhTW: '正宗風味，用心烹製' },
    ],
    cta: { en: 'View Our Menu', ms: 'Lihat Menu Kami', zhCN: '查看菜单', zhTW: '查看菜單' },
    menu: {
      en: [
        { category: 'Signature Dishes', items: [
          { name: 'Nasi Lemak Special', description: 'Fragrant coconut rice with sambal, fried chicken, egg, peanuts & anchovies', price: 'RM12.90', popular: true },
          { name: 'Char Kuey Teow', description: 'Wok-fried flat noodles with prawns, cockles, bean sprouts & chives', price: 'RM11.90', popular: true },
          { name: 'Rendang Daging', description: 'Slow-braised beef in rich coconut and spice gravy', price: 'RM15.90' },
          { name: 'Mee Goreng Mamak', description: 'Indian-style fried noodles with egg, tofu, and spicy sauce', price: 'RM9.90' },
        ]},
        { category: 'Drinks', items: [
          { name: 'Teh Tarik', description: 'Pulled milk tea — a Malaysian classic', price: 'RM3.50' },
          { name: 'Kopi O', description: 'Traditional black coffee, bold and aromatic', price: 'RM3.00' },
          { name: 'Air Sirap Limau', description: 'Rose syrup with fresh lime — sweet and refreshing', price: 'RM4.00' },
        ]},
      ],
      ms: [
        { category: 'Hidangan Istimewa', items: [
          { name: 'Nasi Lemak Special', description: 'Nasi kelapa wangi dengan sambal, ayam goreng, telur, kacang & ikan bilis', price: 'RM12.90', popular: true },
          { name: 'Char Kuey Teow', description: 'Kuey teow goreng dengan udang, kerang, taugeh & kucai', price: 'RM11.90', popular: true },
          { name: 'Rendang Daging', description: 'Daging masak rendang dengan kuah santan pekat', price: 'RM15.90' },
          { name: 'Mee Goreng Mamak', description: 'Mee goreng ala India dengan telur, tauhu, dan sos pedas', price: 'RM9.90' },
        ]},
        { category: 'Minuman', items: [
          { name: 'Teh Tarik', description: 'Teh susu tarik — klasik Malaysia', price: 'RM3.50' },
          { name: 'Kopi O', description: 'Kopi hitam tradisional, pekat dan wangi', price: 'RM3.00' },
          { name: 'Air Sirap Limau', description: 'Sirap ros dengan limau nipis segar', price: 'RM4.00' },
        ]},
      ],
      zhCN: [
        { category: '招牌菜', items: [
          { name: 'Nasi Lemak Special 椰浆饭', description: '香浓椰浆饭配参巴酱、炸鸡、鸡蛋、花生和江鱼仔', price: 'RM12.90', popular: true },
          { name: 'Char Kuey Teow 炒粿条', description: '大火快炒粿条配鲜虾、蛤蜊、豆芽和韭菜', price: 'RM11.90', popular: true },
          { name: 'Rendang Daging 仁当牛肉', description: '慢炖牛肉配浓郁椰浆香料汁', price: 'RM15.90' },
          { name: 'Mee Goreng Mamak 嘛嘛炒面', description: '印度风味炒面配鸡蛋、豆腐和辣酱', price: 'RM9.90' },
        ]},
        { category: '饮料', items: [
          { name: 'Teh Tarik 拉茶', description: '拉丝奶茶 — 马来西亚经典', price: 'RM3.50' },
          { name: 'Kopi O 黑咖啡', description: '传统黑咖啡，浓郁芬芳', price: 'RM3.00' },
          { name: 'Air Sirap Limau 玫瑰酸柑水', description: '玫瑰糖浆配新鲜酸柑 — 甜蜜清爽', price: 'RM4.00' },
        ]},
      ],
      zhTW: [
        { category: '招牌菜', items: [
          { name: 'Nasi Lemak Special 椰漿飯', description: '香濃椰漿飯配參巴醬、炸雞、雞蛋、花生和江魚仔', price: 'RM12.90', popular: true },
          { name: 'Char Kuey Teow 炒粿條', description: '大火快炒粿條配鮮蝦、蛤蜊、豆芽和韭菜', price: 'RM11.90', popular: true },
          { name: 'Rendang Daging 仁當牛肉', description: '慢燉牛肉配濃郁椰漿香料汁', price: 'RM15.90' },
          { name: 'Mee Goreng Mamak 嘛嘛炒麵', description: '印度風味炒麵配雞蛋、豆腐和辣醬', price: 'RM9.90' },
        ]},
        { category: '飲料', items: [
          { name: 'Teh Tarik 拉茶', description: '拉絲奶茶 — 馬來西亞經典', price: 'RM3.50' },
          { name: 'Kopi O 黑咖啡', description: '傳統黑咖啡，濃郁芬芳', price: 'RM3.00' },
          { name: 'Air Sirap Limau 玫瑰酸柑水', description: '玫瑰糖漿配新鮮酸柑 — 甜蜜清爽', price: 'RM4.00' },
        ]},
      ],
    },
    reviewTemplates: {
      en: [
        'Amazing food! The flavours are so authentic — best {type} I\'ve had in {city}.',
        'Been coming here for years. Consistently great quality and friendly service.',
        'Great atmosphere and even better food. Highly recommend to anyone visiting the area.',
      ],
      ms: [
        'Makanan yang sangat sedap! Rasa yang autentik — {type} terbaik di {city}.',
        'Dah datang sini bertahun-tahun. Kualiti sentiasa terbaik dan layanan mesra.',
        'Suasana hebat dan makanan lebih hebat lagi. Sangat disyorkan!',
      ],
      zhCN: [
        '食物太棒了！味道非常正宗 — {city}最好的{type}。',
        '来了好几年了，品质始终如一，服务热情友好。',
        '氛围很好，食物更好。强烈推荐给路过的朋友！',
      ],
      zhTW: [
        '食物太棒了！味道非常正宗 — {city}最好的{type}。',
        '來了好幾年了，品質始終如一，服務熱情友好。',
        '氛圍很好，食物更好。強烈推薦給路過的朋友！',
      ],
    },
  },
  beauty: {
    taglines: [
      { en: 'Your best look starts here', ms: 'Tampil lebih yakin, bermula di sini', zhCN: '焕然一新，从这里开始', zhTW: '煥然一新，從這裡開始' },
      { en: 'Where beauty meets confidence', ms: 'Di mana kecantikan bertemu keyakinan', zhCN: '美丽与自信的交汇', zhTW: '美麗與自信的交匯' },
      { en: 'Relax. Refresh. Radiate.', ms: 'Relaks. Segar. Bersinar.', zhCN: '放松·焕新·绽放', zhTW: '放鬆·煥新·綻放' },
    ],
    cta: { en: 'Book Now', ms: 'Tempah Sekarang', zhCN: '立即预约', zhTW: '立即預約' },
    services: {
      en: [
        { category: 'Hair Services', items: [
          { name: 'Haircut & Styling', description: 'Professional cut and blow-dry tailored to your face shape', price: 'RM45', popular: true },
          { name: 'Hair Colouring', description: 'Full colour or highlights with premium products', price: 'From RM120' },
          { name: 'Keratin Treatment', description: 'Smooth, frizz-free hair that lasts up to 3 months', price: 'RM250', popular: true },
        ]},
        { category: 'Nail & Spa', items: [
          { name: 'Gel Manicure', description: 'Long-lasting gel polish with cuticle care', price: 'RM55' },
          { name: 'Relaxation Massage', description: '60-minute full body massage for total relaxation', price: 'RM90' },
          { name: 'Facial Treatment', description: 'Deep cleansing facial with hydrating mask', price: 'RM85' },
        ]},
      ],
      ms: [
        { category: 'Perkhidmatan Rambut', items: [
          { name: 'Gunting & Penggayaan', description: 'Potongan profesional disesuaikan dengan bentuk muka', price: 'RM45', popular: true },
          { name: 'Pewarnaan Rambut', description: 'Warna penuh atau highlight dengan produk premium', price: 'Dari RM120' },
          { name: 'Rawatan Keratin', description: 'Rambut licin dan bebas kusut sehingga 3 bulan', price: 'RM250', popular: true },
        ]},
        { category: 'Kuku & Spa', items: [
          { name: 'Manicure Gel', description: 'Pengilat gel tahan lama dengan penjagaan kutikul', price: 'RM55' },
          { name: 'Urutan Relaksasi', description: 'Urutan seluruh badan 60 minit untuk relaksasi total', price: 'RM90' },
          { name: 'Rawatan Muka', description: 'Pembersihan mendalam dengan topeng pelembap', price: 'RM85' },
        ]},
      ],
      zhCN: [
        { category: '美发服务', items: [
          { name: '剪发与造型', description: '根据脸型定制的专业剪发和吹整', price: 'RM45', popular: true },
          { name: '染发', description: '使用高级产品的全头染发或挑染', price: 'RM120起' },
          { name: '角蛋白护理', description: '持续长达3个月的顺滑无毛躁秀发', price: 'RM250', popular: true },
        ]},
        { category: '美甲与水疗', items: [
          { name: '凝胶美甲', description: '持久凝胶甲油配合甲缘护理', price: 'RM55' },
          { name: '放松按摩', description: '60分钟全身按摩，彻底放松', price: 'RM90' },
          { name: '面部护理', description: '深层清洁面部配保湿面膜', price: 'RM85' },
        ]},
      ],
      zhTW: [
        { category: '美髮服務', items: [
          { name: '剪髮與造型', description: '根據臉型定制的專業剪髮和吹整', price: 'RM45', popular: true },
          { name: '染髮', description: '使用高級產品的全頭染髮或挑染', price: 'RM120起' },
          { name: '角蛋白護理', description: '持續長達3個月的順滑無毛躁秀髮', price: 'RM250', popular: true },
        ]},
        { category: '美甲與水療', items: [
          { name: '凝膠美甲', description: '持久凝膠甲油配合甲緣護理', price: 'RM55' },
          { name: '放鬆按摩', description: '60分鐘全身按摩，徹底放鬆', price: 'RM90' },
          { name: '面部護理', description: '深層清潔面部配保濕面膜', price: 'RM85' },
        ]},
      ],
    },
    reviewTemplates: {
      en: [
        'Absolutely love my new look! The stylist really listened to what I wanted.',
        'Such a relaxing experience. The team is professional and the salon is spotless.',
        'Best salon in the area. Fair prices and amazing results every time.',
      ],
      ms: [
        'Sangat suka penampilan baru saya! Jurusolek benar-benar dengar kehendak saya.',
        'Pengalaman yang sangat menenangkan. Pasukan profesional dan salon sangat bersih.',
        'Salon terbaik di kawasan ini. Harga berpatutan dan hasil luar biasa setiap kali.',
      ],
      zhCN: [
        '非常喜欢我的新造型！发型师真的很用心倾听我的需求。',
        '非常放松的体验。团队很专业，沙龙非常干净整洁。',
        '这个区域最好的沙龙。价格公道，每次效果都很棒。',
      ],
      zhTW: [
        '非常喜歡我的新造型！髮型師真的很用心傾聽我的需求。',
        '非常放鬆的體驗。團隊很專業，沙龍非常乾淨整潔。',
        '這個區域最好的沙龍。價格公道，每次效果都很棒。',
      ],
    },
  },
  clinic: {
    taglines: [
      { en: 'Your health, our priority', ms: 'Kesihatan anda, keutamaan kami', zhCN: '您的健康，我们的首要任务', zhTW: '您的健康，我們的首要任務' },
      { en: 'Expert care you can trust', ms: 'Penjagaan pakar yang dipercayai', zhCN: '值得信赖的专业医疗', zhTW: '值得信賴的專業醫療' },
      { en: 'Your smile, our commitment', ms: 'Senyuman anda, komitmen kami', zhCN: '您的笑容，我们的承诺', zhTW: '您的笑容，我們的承諾' },
    ],
    cta: { en: 'Book Appointment', ms: 'Buat Temujanji', zhCN: '预约挂号', zhTW: '預約掛號' },
    services: {
      en: [
        { category: 'General Services', items: [
          { name: 'General Consultation', description: 'Comprehensive health check and consultation with our doctor', price: 'RM50', popular: true },
          { name: 'Dental Cleaning', description: 'Professional scaling and polishing for a healthy smile', price: 'RM120', popular: true },
          { name: 'Health Screening', description: 'Full body health screening with blood work and report', price: 'RM350' },
        ]},
        { category: 'Specialist Services', items: [
          { name: 'Dental Filling', description: 'Tooth-coloured composite filling to restore damaged teeth', price: 'From RM80' },
          { name: 'Teeth Whitening', description: 'Professional in-clinic whitening for a brighter smile', price: 'RM450' },
          { name: 'Physiotherapy', description: 'Targeted rehab session for pain management and recovery', price: 'RM90' },
        ]},
      ],
      ms: [
        { category: 'Perkhidmatan Am', items: [
          { name: 'Konsultasi Am', description: 'Pemeriksaan kesihatan menyeluruh dengan doktor kami', price: 'RM50', popular: true },
          { name: 'Pembersihan Gigi', description: 'Scaling dan polish profesional untuk senyuman sihat', price: 'RM120', popular: true },
          { name: 'Saringan Kesihatan', description: 'Saringan kesihatan penuh dengan ujian darah dan laporan', price: 'RM350' },
        ]},
        { category: 'Perkhidmatan Pakar', items: [
          { name: 'Tampalan Gigi', description: 'Tampalan komposit warna gigi untuk membaiki gigi rosak', price: 'Dari RM80' },
          { name: 'Pemutihan Gigi', description: 'Pemutihan profesional di klinik untuk senyuman lebih cerah', price: 'RM450' },
          { name: 'Fisioterapi', description: 'Sesi rehab untuk pengurusan sakit dan pemulihan', price: 'RM90' },
        ]},
      ],
      zhCN: [
        { category: '一般服务', items: [
          { name: '普通问诊', description: '与医生进行全面的健康检查和咨询', price: 'RM50', popular: true },
          { name: '洗牙', description: '专业洁牙和抛光，维护口腔健康', price: 'RM120', popular: true },
          { name: '健康筛查', description: '全身健康筛查含血液检查和报告', price: 'RM350' },
        ]},
        { category: '专科服务', items: [
          { name: '补牙', description: '牙色复合材料填充修复受损牙齿', price: 'RM80起' },
          { name: '牙齿美白', description: '诊所内专业美白，拥有更亮丽笑容', price: 'RM450' },
          { name: '物理治疗', description: '针对性康复治疗，缓解疼痛与恢复', price: 'RM90' },
        ]},
      ],
      zhTW: [
        { category: '一般服務', items: [
          { name: '普通問診', description: '與醫生進行全面的健康檢查和諮詢', price: 'RM50', popular: true },
          { name: '洗牙', description: '專業潔牙和拋光，維護口腔健康', price: 'RM120', popular: true },
          { name: '健康篩查', description: '全身健康篩查含血液檢查和報告', price: 'RM350' },
        ]},
        { category: '專科服務', items: [
          { name: '補牙', description: '牙色複合材料填充修復受損牙齒', price: 'RM80起' },
          { name: '牙齒美白', description: '診所內專業美白，擁有更亮麗笑容', price: 'RM450' },
          { name: '物理治療', description: '針對性康復治療，緩解疼痛與恢復', price: 'RM90' },
        ]},
      ],
    },
    reviewTemplates: {
      en: [
        'Very professional and gentle. The doctor explained everything clearly before the procedure.',
        'Clean facility and friendly staff. Short wait time too — highly recommended!',
        'Been a patient here for {years} years. Trustworthy and always up to date with the latest treatments.',
      ],
      ms: [
        'Sangat profesional dan lembut. Doktor menerangkan segala-galanya dengan jelas.',
        'Kemudahan bersih dan kakitangan mesra. Masa menunggu singkat — sangat disyorkan!',
        'Dah jadi pesakit sini {years} tahun. Dipercayai dan sentiasa terkini.',
      ],
      zhCN: [
        '非常专业和温柔。医生在治疗前解释得很清楚。',
        '环境干净，员工友好。等待时间也短——强烈推荐！',
        '在这里看了{years}年了。值得信赖，总是跟进最新治疗方法。',
      ],
      zhTW: [
        '非常專業和溫柔。醫生在治療前解釋得很清楚。',
        '環境乾淨，員工友好。等待時間也短——強烈推薦！',
        '在這裡看了{years}年了。值得信賴，總是跟進最新治療方法。',
      ],
    },
  },
};

const REVIEW_AUTHORS = ['Sarah L.', 'Ahmad R.', 'Wei Ming T.', 'Priya S.', 'Aisha M.', 'Jason C.', 'Mei Ling W.', 'Raj K.'];

function generateFeaturedReviews(
  rating: number, industry: string, city: string, locale: 'en' | 'ms' | 'zhCN' | 'zhTW'
) {
  const content = INDUSTRY_CONTENT[industry] || INDUSTRY_CONTENT.restaurant;
  const templates = content.reviewTemplates[locale];
  const usedAuthors = REVIEW_AUTHORS.sort(() => 0.5 - Math.random()).slice(0, 3);
  return templates.slice(0, 3).map((tmpl, i) => ({
    author: usedAuthors[i],
    text: tmpl.replace('{city}', city).replace('{type}', industry).replace('{years}', String(Math.floor(Math.random() * 5) + 2)),
    rating: i === 0 ? 5 : Math.max(4, Math.round(rating)),
  }));
}

function generateBusinessTs(lead: PlaceResult, industry: string, outputDir: string) {
  const config = INDUSTRY_CONFIG[industry] || INDUSTRY_CONFIG.generic;
  const colorsPath = path.join(outputDir, 'brand-colors.json');
  const colors = fs.existsSync(colorsPath) ? JSON.parse(fs.readFileSync(colorsPath, 'utf8')) : {
    primary: '#2563EB', primaryDark: '#1E40AF', accent: '#F59E0B',
    surface: '#F8FAFC', textTitle: '#1F2937', textBody: '#4B5563'
  };

  const name = lead.displayName?.text || 'Business';
  const addr = lead.formattedAddress || '';
  const phone = lead.nationalPhoneNumber || '';
  const rating = lead.rating || 4.5;
  const reviewCount = lead.userRatingCount || 0;
  const city = addr.split(',').slice(-3, -1).join(',').trim() || 'Kuala Lumpur';
  const shortCity = addr.split(',').slice(-3, -2).join('').trim() || 'KL';

  const hours: Record<string, string> = {};
  (lead.regularOpeningHours?.weekdayDescriptions || []).forEach(h => {
    const [day, ...rest] = h.split(': ');
    if (day && rest.length) hours[day] = rest.join(': ');
  });

  // Images
  const imgDir = path.join(outputDir, 'public/images');
  const imgs = fs.existsSync(imgDir)
    ? fs.readdirSync(imgDir).filter(f => f.endsWith('-1280.webp')).map(f => `/images/${f}`)
    : [];
  const hero = imgs[0] || '/images/stock-1-1280.webp';
  const gallery = imgs.slice(1, 5);

  const mapsUrl = lead.googleMapsUri || '';
  const industryContent = INDUSTRY_CONTENT[industry] || INDUSTRY_CONTENT.restaurant;
  const tagline = industryContent.taglines[Math.floor(Math.random() * industryContent.taglines.length)];
  const cta = industryContent.cta;

  // Build menu/services per locale
  const menuOrServices = industryContent.menu || industryContent.services;
  const menuKey = industryContent.menu ? 'menu' : (industryContent.services ? 'services' : null);

  const buildLocaleContent = (locale: 'en' | 'ms' | 'zhCN' | 'zhTW', langCode: string) => {
    const sub = tagline[locale].replace('{city}', shortCity);
    const reviews = generateFeaturedReviews(rating, industry, shortCity, locale);
    const extra = menuOrServices && menuKey ? `\n      ${menuKey}: ${JSON.stringify(menuOrServices[locale])},` : '';

    return `{
      meta: { title: "${name} — ${city}", description: "${sub}. Rated ${rating}/5 by ${reviewCount}+ customers." },
      hero: { title: "${name}", subtitle: "${sub}", cta: "${cta[locale]}", image: "${hero}" },
      hours: ${JSON.stringify(hours)},
      location: { address: "${addr}", mapsUrl: "${mapsUrl}" },
      contact: { phone: "${phone}"${phone ? `, whatsapp: "${phone.replace(/[^+0-9]/g, '')}"` : ''} },
      reviews: { rating: ${rating}, count: ${reviewCount}, featured: ${JSON.stringify(reviews)} },
      trustBar: { items: [
        { icon: "star", label: "${locale === 'en' ? 'Rating' : locale === 'ms' ? 'Penilaian' : '评分'}", value: "${rating}/5" },
        { icon: "users", label: "${locale === 'en' ? 'Reviews' : locale === 'ms' ? 'Ulasan' : '评价'}", value: "${reviewCount}+" },
        { icon: "map-pin", label: "${locale === 'en' ? 'Location' : locale === 'ms' ? 'Lokasi' : '位置'}", value: "${shortCity}" },
      ] },${extra}
    }`;
  };

  const ts = `import type { BusinessData } from '@/types/business';

export const business: BusinessData = {
  theme: {
    primary: "${colors.primary}",
    primaryDark: "${colors.primaryDark}",
    accent: "${colors.accent}",
    surface: "${colors.surface}",
    textTitle: "${colors.textTitle || '#1F2937'}",
    textBody: "${colors.textBody || '#4B5563'}",
    fontDisplay: "${config.fontDisplay}",
    fontBody: "${config.fontBody}",
  },
  assets: {
    heroImage: "${hero}",
    galleryImages: ${JSON.stringify(gallery)},
  },
  content: {
    en: ${buildLocaleContent('en', 'en')},
    ms: ${buildLocaleContent('ms', 'ms')},
    "zh-CN": ${buildLocaleContent('zhCN', 'zh-CN')},
    "zh-TW": ${buildLocaleContent('zhTW', 'zh-TW')},
  },
};
`;
  fs.mkdirSync(path.join(outputDir, 'src/data'), { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'src/data/business.ts'), ts);
}

// ── Industry SVG decorations ────────────────────────────────────
const INDUSTRY_SVGS: Record<string, { name: string; svg: string }[]> = {
  restaurant: [
    { name: 'steam', svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60" fill="none"><title>Steam</title><path d="M20 50C20 50 25 30 30 30C35 30 30 50 35 50C40 50 35 30 40 30" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity="0.5"/><path d="M55 50C55 50 60 25 65 25C70 25 65 50 70 50C75 50 70 25 75 25" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity="0.4"/><path d="M90 50C90 50 95 32 100 32C105 32 100 50 105 50" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.3"/></svg>` },
    { name: 'wave-divider', svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 40" preserveAspectRatio="none"><title>Wave</title><path d="M0 20C200 5 400 35 600 20C800 5 1000 35 1200 20" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.25"/></svg>` },
  ],
  beauty: [
    { name: 'flower-petal', svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none"><title>Flower</title><ellipse cx="40" cy="20" rx="8" ry="16" stroke="currentColor" stroke-width="1.5" opacity="0.4" transform="rotate(0 40 40)"/><ellipse cx="40" cy="20" rx="8" ry="16" stroke="currentColor" stroke-width="1.5" opacity="0.35" transform="rotate(72 40 40)"/><ellipse cx="40" cy="20" rx="8" ry="16" stroke="currentColor" stroke-width="1.5" opacity="0.3" transform="rotate(144 40 40)"/><ellipse cx="40" cy="20" rx="8" ry="16" stroke="currentColor" stroke-width="1.5" opacity="0.35" transform="rotate(216 40 40)"/><ellipse cx="40" cy="20" rx="8" ry="16" stroke="currentColor" stroke-width="1.5" opacity="0.4" transform="rotate(288 40 40)"/><circle cx="40" cy="40" r="4" fill="currentColor" opacity="0.5"/></svg>` },
    { name: 'sparkle', svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" fill="currentColor"><title>Sparkle</title><path d="M30 5L33 25L53 28L33 31L30 51L27 31L7 28L27 25Z" opacity="0.3"/></svg>` },
  ],
  clinic: [
    { name: 'pulse', svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" fill="none"><title>Pulse</title><path d="M0 30H60L75 10L90 50L105 20L120 35H200" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.3"/></svg>` },
    { name: 'cross', svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" fill="none"><title>Medical</title><rect x="22" y="8" width="16" height="44" rx="3" stroke="currentColor" stroke-width="1.5" opacity="0.25"/><rect x="8" y="22" width="44" height="16" rx="3" stroke="currentColor" stroke-width="1.5" opacity="0.25"/></svg>` },
  ],
  generic: [
    { name: 'dots', svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor"><title>Decoration</title><circle cx="20" cy="20" r="2" opacity="0.2"/><circle cx="50" cy="30" r="2" opacity="0.15"/><circle cx="80" cy="15" r="2" opacity="0.2"/><circle cx="35" cy="60" r="2" opacity="0.15"/><circle cx="70" cy="70" r="2" opacity="0.2"/></svg>` },
  ],
};

function generateSvgDecorations(industry: string, outputDir: string) {
  const svgs = INDUSTRY_SVGS[industry] || INDUSTRY_SVGS.generic;
  const svgDir = path.join(outputDir, 'public/svgs');
  fs.mkdirSync(svgDir, { recursive: true });
  for (const { name, svg } of svgs) {
    fs.writeFileSync(path.join(svgDir, `${name}.svg`), svg);
  }
}

async function processLead(lead: PlaceResult, industry: string): Promise<BatchResult> {
  const name = lead.displayName?.text || 'unknown';
  const slug = slugify(name);
  const outputDir = path.resolve(`output/${lead.id}`);
  console.log(`\n━━ Processing: ${name} (${industry}) ━━`);

  try {
    // Setup dirs
    for (const d of ['public/images', 'public/svgs', 'src/data', 'src/components', 'screenshots']) {
      fs.mkdirSync(path.join(outputDir, d), { recursive: true });
    }

    // 1. Photos
    const photoNames = (lead.photos || []).map(p => p.name).slice(0, 5);
    if (photoNames.length > 0) {
      await downloadMapsPhotos(photoNames, path.join(outputDir, 'public/images'), 3);
    }
    await downloadStockPhotos(industry, path.join(outputDir, 'public/images'), 2);

    // 2. Colors
    const firstImg = fs.readdirSync(path.join(outputDir, 'public/images')).find(f => f.endsWith('.jpg'));
    if (firstImg) {
      await extractAndSave(path.join(outputDir, 'public/images', firstImg), outputDir);
    }

    // 3. Optimize
    await optimizeImages(path.join(outputDir, 'public/images'));

    // 4. Templates + business.ts + SVG decorations
    copyTemplates(industry, outputDir);
    generateBusinessTs(lead, industry, outputDir);
    generateSvgDecorations(industry, outputDir);

    // 5. Build
    console.log(`  Building...`);
    execSync('npm install --silent && npm run build', { cwd: outputDir, stdio: 'pipe', timeout: 120000 });
    if (!fs.existsSync(path.join(outputDir, 'out'))) throw new Error('Build produced no out/ directory');
    // Vercel config: redirect / → /en
    fs.writeFileSync(path.join(outputDir, 'out/vercel.json'), JSON.stringify({
      redirects: [{ source: "/", destination: "/en", permanent: false }],
    }, null, 2));
    console.log(`  Build OK`);

    // 6. Deploy
    console.log(`  Deploying to Vercel...`);
    const deploy = await deployToVercel(path.join(outputDir, 'out'), slug);
    console.log(`  Deployed: ${deploy.url}`);

    // 7. Push to GitHub + set homepage + link Vercel
    console.log(`  Pushing to DuoCode2/${slug}...`);
    try {
      execSync(`cd "${outputDir}" && rm -rf .git && git init -q && git config user.name "LiuWei" && git config user.email "sunflowers0607@outlook.com" && echo ".next/\nnode_modules/\n.vercel/" > .gitignore && git add -A && git commit -q -m "feat: generated site for ${name}" && gh repo delete DuoCode2/${slug} --yes 2>/dev/null; gh repo create DuoCode2/${slug} --private --source=. --push`, { stdio: 'pipe', timeout: 30000 });
      console.log(`  Pushed: github.com/DuoCode2/${slug}`);

      // Set repo homepage to Vercel URL (shows link next to repo name)
      execSync(`gh repo edit DuoCode2/${slug} --homepage "${deploy.url}" --description "Generated landing page for ${name} — ${industry}"`, { stdio: 'pipe', timeout: 10000 });
      console.log(`  Homepage set: ${deploy.url}`);

      // Link Vercel project to GitHub repo for CI/CD (requires Vercel GitHub integration)
      try {
        const linkRes = await fetch(`https://api.vercel.com/v9/projects/${slug}`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ gitRepository: { type: 'github', repo: `DuoCode2/${slug}` } }),
        });
        if (linkRes.ok) {
          console.log(`  Vercel linked to GitHub repo`);
        } else {
          console.log(`  Vercel-GitHub link skipped (install Vercel GitHub App on DuoCode2 org)`);
        }
      } catch { /* Vercel link is non-critical */ }
    } catch { console.log(`  GitHub push skipped`); }

    return { placeId: lead.id, name, industry, url: deploy.url, repo: `DuoCode2/${slug}`, status: 'deployed' };
  } catch (err: unknown) {
    const msg = (err as Error).message;
    console.error(`  Failed: ${msg}`);
    return { placeId: lead.id, name, industry, status: 'failed', error: msg };
  }
}

async function batch(config: BatchConfig) {
  console.log('╔═══════════════════════════════════════╗');
  console.log('║  DuoCode Batch Pipeline                ║');
  console.log('╚═══════════════════════════════════════╝');
  console.log(`City: ${config.city} | Categories: ${config.categories.join(', ')} | Batch: ${config.batchSize}`);

  // 1. Discover
  const allLeads: PlaceResult[] = [];
  for (const cat of config.categories) {
    console.log(`\nSearching: ${cat} in ${config.city}...`);
    const leads = await searchPlaces(cat, config.city, 1, true);
    allLeads.push(...leads.slice(0, config.batchSize));
  }
  console.log(`\nTotal leads: ${allLeads.length}`);

  // 2. Classify + process
  const results: BatchResult[] = [];
  for (const lead of allLeads) {
    const industry = classifyIndustry(lead.primaryType);
    const result = await processLead(lead, industry);
    results.push(result);

    // Log to n8n
    try {
      await fetch('http://localhost:5678/webhook/log-work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          place_id: result.placeId,
          action: result.status,
          result: result.url || result.error,
          qa_score: 0,
          details: `${result.name} | ${result.industry} | ${result.repo || 'no repo'}`,
        }),
      });
    } catch {}
  }

  // 3. Report
  const deployed = results.filter(r => r.status === 'deployed');
  const failed = results.filter(r => r.status === 'failed');
  console.log('\n╔═══════════════════════════════════════╗');
  console.log(`║  Batch Complete: ${deployed.length} deployed, ${failed.length} failed`);
  for (const r of deployed) {
    console.log(`║  ${r.name} -> ${r.url}`);
  }
  for (const r of failed) {
    console.log(`║  FAILED ${r.name}: ${r.error}`);
  }
  console.log('╚═══════════════════════════════════════╝');

  // Save report
  fs.writeFileSync('output/batch-report.json', JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2));
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const getArg = (name: string, fallback: string) => {
    const idx = args.indexOf(`--${name}`);
    return idx >= 0 && args[idx + 1] ? args[idx + 1] : fallback;
  };

  batch({
    city: getArg('city', 'Kuala Lumpur'),
    categories: getArg('categories', 'restaurant').split(','),
    batchSize: parseInt(getArg('batch-size', '2'), 10),
  }).catch(e => { console.error(e); process.exit(1); });
}
