import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { searchPlaces, type PlaceResult } from '../discover/search';
import { finalize, type FinalizeResult } from '../pipeline/finalize';
import { prepare, type PrepareResult } from '../pipeline/prepare';
import {
  INDUSTRY_CONFIG,
  SCHEMA_ORG_TYPE,
  classifyIndustry,
  slugify,
} from '../generate/industry-config';

interface BatchConfig {
  city: string;
  categories: string[];
  batchSize: number;
  dryRun?: boolean;
}

interface BatchResult {
  placeId: string;
  name: string;
  slug: string;
  outputDir: string;
  industry: string;
  status: FinalizeResult['status'] | 'prepare-failed';
  url?: string;
  scores?: Record<string, number>;
  failures?: FinalizeResult['failures'];
  error?: string;
}

type LocaleKey = 'en' | 'ms' | 'zhCN' | 'zhTW';
type LocalizedString = Record<LocaleKey, string>;

interface ServiceItem {
  name: string;
  description: string;
  price: string;
  popular?: boolean;
}

interface SectionGroup {
  category: string;
  items: ServiceItem[];
}

interface IndustryContent {
  taglines: LocalizedString[];
  cta: LocalizedString;
  menu?: Record<LocaleKey, SectionGroup[]>;
  services?: Record<LocaleKey, SectionGroup[]>;
  reviewTemplates: Record<LocaleKey, string[]>;
}

const INDUSTRY_CONTENT: Record<string, IndustryContent> = {
  restaurant: {
    taglines: [
      {
        en: 'Fresh flavours and neighborhood hospitality in every plate.',
        ms: 'Rasa segar dan layanan mesra dalam setiap hidangan.',
        zhCN: '每一道菜都带着新鲜风味与亲切服务。',
        zhTW: '每一道菜都帶著新鮮風味與親切服務。',
      },
      {
        en: 'Comfort food, local favourites, and space to linger.',
        ms: 'Hidangan selesa, kegemaran tempatan, ruang untuk santai.',
        zhCN: '熟悉的本地味道，让人愿意多停留一会儿。',
        zhTW: '熟悉的在地味道，讓人願意多停留一會兒。',
      },
    ],
    cta: {
      en: 'View Menu',
      ms: 'Lihat Menu',
      zhCN: '查看菜单',
      zhTW: '查看菜單',
    },
    menu: {
      en: [
        {
          category: 'Signature Favourites',
          items: [
            {
              name: 'Chef Special',
              description: 'A balanced house favourite prepared fresh every day.',
              price: 'RM18',
              popular: true,
            },
            {
              name: 'Weekend Sharing Plate',
              description: 'Ideal for small groups with classic local flavours.',
              price: 'RM28',
            },
          ],
        },
      ],
      ms: [
        {
          category: 'Pilihan Istimewa',
          items: [
            {
              name: 'Hidangan Istimewa Chef',
              description: 'Hidangan kegemaran rumah yang disediakan segar setiap hari.',
              price: 'RM18',
              popular: true,
            },
            {
              name: 'Pinggan Perkongsian Hujung Minggu',
              description: 'Sesuai untuk kumpulan kecil dengan rasa tempatan klasik.',
              price: 'RM28',
            },
          ],
        },
      ],
      zhCN: [
        {
          category: '招牌推荐',
          items: [
            {
              name: '主厨精选',
              description: '每天新鲜准备的人气招牌菜。',
              price: 'RM18',
              popular: true,
            },
            {
              name: '周末分享拼盘',
              description: '适合多人共享，集合经典本地风味。',
              price: 'RM28',
            },
          ],
        },
      ],
      zhTW: [
        {
          category: '招牌推薦',
          items: [
            {
              name: '主廚精選',
              description: '每天新鮮準備的人氣招牌菜。',
              price: 'RM18',
              popular: true,
            },
            {
              name: '週末分享拼盤',
              description: '適合多人共享，集合經典在地風味。',
              price: 'RM28',
            },
          ],
        },
      ],
    },
    reviewTemplates: {
      en: [
        'Friendly team, quick service, and dishes that feel reliably home-style.',
        'A great local spot for casual meals and family gatherings.',
        'The menu is approachable and the flavours stay consistent.',
      ],
      ms: [
        'Pasukan mesra, servis pantas, dan rasa yang sentiasa meyakinkan.',
        'Tempat tempatan yang selesa untuk makan santai dan keluarga.',
        'Menunya mudah dinikmati dan rasanya konsisten.',
      ],
      zhCN: [
        '服务亲切，上菜也快，味道很有家常感。',
        '适合轻松用餐和家庭聚会的本地餐厅。',
        '菜单容易选择，出品也稳定。',
      ],
      zhTW: [
        '服務親切、上菜也快，味道很有家常感。',
        '適合輕鬆用餐和家庭聚會的在地餐廳。',
        '菜單容易選擇，出品也穩定。',
      ],
    },
  },
  beauty: {
    taglines: [
      {
        en: 'Relaxed appointments, thoughtful care, and polished results.',
        ms: 'Temujanji santai, penjagaan teliti, dan hasil yang kemas.',
        zhCN: '轻松预约、细致护理、稳定出色的效果。',
        zhTW: '輕鬆預約、細緻護理、穩定出色的效果。',
      },
    ],
    cta: {
      en: 'Book Now',
      ms: 'Tempah Sekarang',
      zhCN: '立即预约',
      zhTW: '立即預約',
    },
    services: {
      en: [
        {
          category: 'Popular Services',
          items: [
            {
              name: 'Cut and Styling',
              description: 'A polished look tailored to your preferences and routine.',
              price: 'RM55',
              popular: true,
            },
            {
              name: 'Colour Refresh',
              description: 'Tone, gloss, or full refresh using salon-grade products.',
              price: 'From RM120',
            },
          ],
        },
      ],
      ms: [
        {
          category: 'Perkhidmatan Popular',
          items: [
            {
              name: 'Potong dan Gaya',
              description: 'Penampilan kemas yang disesuaikan dengan cita rasa anda.',
              price: 'RM55',
              popular: true,
            },
            {
              name: 'Segar Semula Warna',
              description: 'Tone, gloss, atau pembaharuan warna dengan produk salon.',
              price: 'Dari RM120',
            },
          ],
        },
      ],
      zhCN: [
        {
          category: '热门服务',
          items: [
            {
              name: '剪发与造型',
              description: '根据日常习惯与喜好定制更利落的造型。',
              price: 'RM55',
              popular: true,
            },
            {
              name: '染色焕新',
              description: '使用专业产品进行补色、提亮或整体染色。',
              price: 'RM120起',
            },
          ],
        },
      ],
      zhTW: [
        {
          category: '熱門服務',
          items: [
            {
              name: '剪髮與造型',
              description: '根據日常習慣與喜好打造更俐落的造型。',
              price: 'RM55',
              popular: true,
            },
            {
              name: '染色煥新',
              description: '使用專業產品進行補色、提亮或整體染髮。',
              price: 'RM120起',
            },
          ],
        },
      ],
    },
    reviewTemplates: {
      en: [
        'The visit felt calm and professional from start to finish.',
        'Clear consultation, tidy space, and results that matched the brief.',
        'A dependable salon when you want polished work without fuss.',
      ],
      ms: [
        'Pengalaman yang tenang dan profesional dari awal hingga akhir.',
        'Konsultasi jelas, ruang kemas, dan hasil ikut permintaan.',
        'Salon yang boleh diharap untuk hasil kemas tanpa drama.',
      ],
      zhCN: [
        '从接待到完成都很放松，也很专业。',
        '沟通清楚、环境整洁，成品符合预期。',
        '想要稳定、利落效果时很值得来。',
      ],
      zhTW: [
        '從接待到完成都很放鬆，也很專業。',
        '溝通清楚、環境整潔，成品符合預期。',
        '想要穩定、俐落效果時很值得來。',
      ],
    },
  },
  clinic: {
    taglines: [
      {
        en: 'Clear explanations, steady care, and a reassuring patient experience.',
        ms: 'Penerangan jelas, rawatan teliti, dan pengalaman pesakit yang meyakinkan.',
        zhCN: '说明清楚、护理稳妥，让患者更安心。',
        zhTW: '說明清楚、護理穩妥，讓患者更安心。',
      },
    ],
    cta: {
      en: 'Book Appointment',
      ms: 'Buat Temujanji',
      zhCN: '预约问诊',
      zhTW: '預約問診',
    },
    services: {
      en: [
        {
          category: 'Core Services',
          items: [
            {
              name: 'Consultation',
              description: 'Discuss symptoms, concerns, and the next recommended steps.',
              price: 'RM50',
              popular: true,
            },
            {
              name: 'Follow-up Care',
              description: 'Progress review with a practical treatment update.',
              price: 'RM80',
            },
          ],
        },
      ],
      ms: [
        {
          category: 'Perkhidmatan Utama',
          items: [
            {
              name: 'Konsultasi',
              description: 'Bincang simptom, kebimbangan, dan langkah seterusnya.',
              price: 'RM50',
              popular: true,
            },
            {
              name: 'Rawatan Susulan',
              description: 'Semakan perkembangan dengan pelan rawatan yang dikemas kini.',
              price: 'RM80',
            },
          ],
        },
      ],
      zhCN: [
        {
          category: '核心服务',
          items: [
            {
              name: '问诊咨询',
              description: '沟通症状、顾虑与下一步建议。',
              price: 'RM50',
              popular: true,
            },
            {
              name: '复诊随访',
              description: '根据恢复进展调整更实际的治疗建议。',
              price: 'RM80',
            },
          ],
        },
      ],
      zhTW: [
        {
          category: '核心服務',
          items: [
            {
              name: '問診諮詢',
              description: '溝通症狀、顧慮與下一步建議。',
              price: 'RM50',
              popular: true,
            },
            {
              name: '複診追蹤',
              description: '根據恢復進展調整更實際的治療建議。',
              price: 'RM80',
            },
          ],
        },
      ],
    },
    reviewTemplates: {
      en: [
        'Staff communication was clear, calm, and easy to follow.',
        'The process felt organized and the team handled questions well.',
        'A dependable clinic experience when you need practical guidance.',
      ],
      ms: [
        'Komunikasi staf jelas, tenang, dan mudah difahami.',
        'Proses teratur dan pasukan menjawab soalan dengan baik.',
        'Pengalaman klinik yang boleh diharap bila perlukan panduan jelas.',
      ],
      zhCN: [
        '医护沟通清楚，也让人很安心。',
        '流程有条理，问题也能得到耐心解答。',
        '需要明确建议时，是一家可靠的诊所。',
      ],
      zhTW: [
        '醫護溝通清楚，也讓人很安心。',
        '流程有條理，問題也能得到耐心解答。',
        '需要明確建議時，是一家可靠的診所。',
      ],
    },
  },
  generic: {
    taglines: [
      {
        en: 'Trusted local service with practical help and clear next steps.',
        ms: 'Perkhidmatan tempatan yang dipercayai dengan bantuan yang praktikal.',
        zhCN: '值得信赖的本地服务，提供清楚而务实的帮助。',
        zhTW: '值得信賴的在地服務，提供清楚而務實的協助。',
      },
    ],
    cta: {
      en: 'Contact Us',
      ms: 'Hubungi Kami',
      zhCN: '联系我们',
      zhTW: '聯絡我們',
    },
    services: {
      en: [
        {
          category: 'What We Help With',
          items: [
            {
              name: 'Core Service',
              description: 'Straightforward support for the most common customer needs.',
              price: 'Ask for quote',
              popular: true,
            },
            {
              name: 'On-site Assistance',
              description: 'Practical help tailored to the job scope and timeline.',
              price: 'Custom',
            },
          ],
        },
      ],
      ms: [
        {
          category: 'Apa Yang Kami Bantu',
          items: [
            {
              name: 'Perkhidmatan Utama',
              description: 'Bantuan terus untuk keperluan pelanggan yang paling biasa.',
              price: 'Minta sebut harga',
              popular: true,
            },
            {
              name: 'Bantuan Di Lokasi',
              description: 'Bantuan praktikal mengikut skop kerja dan tempoh masa.',
              price: 'Tersuai',
            },
          ],
        },
      ],
      zhCN: [
        {
          category: '服务内容',
          items: [
            {
              name: '核心服务',
              description: '面向常见需求提供直接、务实的支持。',
              price: '欢迎询价',
              popular: true,
            },
            {
              name: '现场协助',
              description: '根据项目范围与时程提供更贴合的处理方式。',
              price: '定制',
            },
          ],
        },
      ],
      zhTW: [
        {
          category: '服務內容',
          items: [
            {
              name: '核心服務',
              description: '面向常見需求提供直接、務實的支援。',
              price: '歡迎詢價',
              popular: true,
            },
            {
              name: '到場協助',
              description: '根據項目範圍與時程提供更貼合的處理方式。',
              price: '客製',
            },
          ],
        },
      ],
    },
    reviewTemplates: {
      en: [
        'Quick replies, practical advice, and a team that keeps things moving.',
        'Helpful communication and a process that feels easy to follow.',
        'Reliable local service when you want clarity and momentum.',
      ],
      ms: [
        'Balasan cepat, nasihat praktikal, dan pasukan yang cekap.',
        'Komunikasi membantu dan proses yang mudah diikuti.',
        'Perkhidmatan tempatan yang boleh diharap bila mahukan kejelasan.',
      ],
      zhCN: [
        '回复快，建议务实，整个过程推进得很顺。',
        '沟通清晰，处理流程也容易跟进。',
        '需要明确、高效的本地服务时很可靠。',
      ],
      zhTW: [
        '回覆快，建議務實，整個流程推進得很順。',
        '溝通清晰，處理流程也容易跟進。',
        '需要明確、高效的在地服務時很可靠。',
      ],
    },
  },
};

const REVIEW_AUTHORS = [
  'Sarah L.',
  'Ahmad R.',
  'Wei Ming T.',
  'Priya S.',
  'Aisha M.',
  'Jason C.',
];

const FALLBACK_PAGE_TSX = String.raw`import { notFound } from 'next/navigation';
import { business } from '@/data/business';
import { isValidLocale, locales, type Locale } from '@/lib/i18n';

type SectionGroup = {
  category: string;
  items: Array<{
    name: string;
    description: string;
    price: string;
    popular?: boolean;
  }>;
};

const labels: Record<
  Locale,
  {
    call: string;
    location: string;
    hours: string;
    reviews: string;
    featured: string;
    services: string;
  }
> = {
  en: {
    call: 'Call now',
    location: 'Location',
    hours: 'Opening Hours',
    reviews: 'Reviews',
    featured: 'Featured Services',
    services: 'Services',
  },
  ms: {
    call: 'Hubungi sekarang',
    location: 'Lokasi',
    hours: 'Waktu Operasi',
    reviews: 'Ulasan',
    featured: 'Perkhidmatan Pilihan',
    services: 'Perkhidmatan',
  },
  'zh-CN': {
    call: '立即致电',
    location: '地址',
    hours: '营业时间',
    reviews: '顾客评价',
    featured: '精选服务',
    services: '服务内容',
  },
  'zh-TW': {
    call: '立即致電',
    location: '地址',
    hours: '營業時間',
    reviews: '顧客評價',
    featured: '精選服務',
    services: '服務內容',
  },
};

function getGroups(content: (typeof business.content)[Locale]): SectionGroup[] {
  const services = (content as { services?: SectionGroup[] }).services;
  if (Array.isArray(services)) {
    return services;
  }

  const menu = (content as { menu?: SectionGroup[] }).menu;
  if (Array.isArray(menu)) {
    return menu;
  }

  return [];
}

export default function LocalePage({ params }: { params: { locale: string } }) {
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale;
  const content = business.content[locale];
  const theme = business.theme;
  const copy = labels[locale];
  const groups = getGroups(content);
  const heroImage = content.hero.image || business.assets.heroImage;

  return (
    <main className="min-h-screen bg-[var(--color-surface)] text-[var(--color-text-body)]">
      <a
        href="#main"
        className="absolute left-4 top-4 z-50 rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-on-primary)] focus:not-sr-only focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--color-primary-dark)] sr-only"
      >
        Skip to content
      </a>

      <section className="relative overflow-hidden bg-[linear-gradient(135deg,var(--color-primary-dark),var(--color-primary))] text-[var(--color-on-primary)]">
        <div className="absolute inset-0 opacity-20" aria-hidden="true">
          {heroImage ? (
            <img src={heroImage} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-16">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                {content.meta.title}
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight [font-family:var(--font-display)] md:text-5xl">
                {content.hero.title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--color-on-primary)]/90 md:text-lg">
                {content.hero.subtitle}
              </p>
            </div>
            <nav aria-label="Language switcher" className="flex flex-wrap gap-2">
              {locales.map((targetLocale) => (
                <a
                  key={targetLocale}
                  href={'/' + targetLocale}
                  aria-current={targetLocale === locale ? 'page' : undefined}
                  className={
                    'rounded-full border px-3 py-2 text-sm font-medium transition ' +
                    (targetLocale === locale
                      ? 'border-white bg-white text-[var(--color-primary-dark)]'
                      : 'border-white/40 bg-white/10 text-white hover:bg-white/20')
                  }
                >
                  {targetLocale}
                </a>
              ))}
            </nav>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.18em] text-white/70">{copy.reviews}</p>
              <p className="mt-2 text-2xl font-semibold">{content.reviews.rating}/5</p>
              <p className="mt-1 text-sm text-white/80">{content.reviews.count}+ ratings</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.18em] text-white/70">{copy.location}</p>
              <p className="mt-2 text-lg font-semibold">{content.location.address}</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.18em] text-white/70">{copy.call}</p>
              <a
                href={'tel:' + content.contact.phone}
                className="mt-2 inline-flex min-h-11 items-center rounded-full bg-[var(--color-accent)] px-4 py-2 text-base font-semibold text-[var(--color-accent-text)]"
              >
                {content.contact.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      <div id="main" className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1.6fr,1fr] lg:px-10 lg:py-14">
        <section className="space-y-8">
          <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold [font-family:var(--font-display)] text-[var(--color-text-title)]">
              {copy.services}
            </h2>
            <div className="mt-6 space-y-6">
              {groups.map((group) => (
                <div key={group.category}>
                  <h3 className="text-lg font-semibold text-[var(--color-text-title)]">{group.category}</h3>
                  <ul className="mt-3 space-y-3">
                    {group.items.map((item) => (
                      <li
                        key={group.category + '-' + item.name}
                        className="rounded-2xl bg-[color:color-mix(in_srgb,var(--color-primary)_7%,white)] p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-[var(--color-text-title)]">{item.name}</p>
                            <p className="mt-1 text-sm leading-6">{item.description}</p>
                          </div>
                          <p className="text-sm font-semibold text-[var(--color-primary-dark)]">{item.price}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold [font-family:var(--font-display)] text-[var(--color-text-title)]">
              {copy.featured}
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {(content.trustBar?.items ?? []).map((item) => (
                <div key={item.label} className="rounded-2xl bg-[var(--color-surface)] p-4">
                  <p className="text-sm uppercase tracking-[0.16em] text-[var(--color-text-body)]/70">
                    {item.label}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[var(--color-text-title)]">{item.value}</p>
                </div>
              ))}
            </div>
          </section>
        </section>

        <aside className="space-y-8">
          <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold [font-family:var(--font-display)] text-[var(--color-text-title)]">
              {copy.hours}
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              {Object.entries(content.hours).map(([day, hours]) => (
                <div key={day} className="flex justify-between gap-4">
                  <dt className="font-medium text-[var(--color-text-title)]">{day}</dt>
                  <dd>{hours}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold [font-family:var(--font-display)] text-[var(--color-text-title)]">
              {copy.location}
            </h2>
            <p className="mt-4 leading-7">{content.location.address}</p>
            <a
              href={content.location.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[var(--color-primary)] px-4 py-2 font-semibold text-[var(--color-on-primary)]"
            >
              Open in Maps
            </a>
          </section>

          <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold [font-family:var(--font-display)] text-[var(--color-text-title)]">
              {copy.reviews}
            </h2>
            <ul className="mt-4 space-y-4">
              {content.reviews.featured.map((review) => (
                <li key={review.author} className="rounded-2xl bg-[var(--color-surface)] p-4">
                  <p className="font-semibold text-[var(--color-text-title)]">{review.author}</p>
                  <p className="mt-2 text-sm leading-6">{review.text}</p>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </main>
  );
}
`;

function randomFrom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function getIndustryContent(industry: string): IndustryContent {
  return INDUSTRY_CONTENT[industry] || INDUSTRY_CONTENT.generic;
}

function generateFeaturedReviews(
  rating: number,
  industry: string,
  locale: LocaleKey,
): Array<{ author: string; text: string; rating: number }> {
  const authors = [...REVIEW_AUTHORS].sort(() => 0.5 - Math.random()).slice(0, 3);
  const templates = getIndustryContent(industry).reviewTemplates[locale];

  return templates.slice(0, 3).map((template, index) => ({
    author: authors[index],
    text: template,
    rating: index === 0 ? 5 : Math.max(4, Math.round(rating)),
  }));
}

function getOptimizedImagePaths(outputDir: string): string[] {
  const imageDir = path.join(outputDir, 'public/images');
  if (!fs.existsSync(imageDir)) {
    return [];
  }

  return fs
    .readdirSync(imageDir)
    .filter((fileName) => fileName.endsWith('-960.webp') || fileName.endsWith('-1280.webp'))
    .sort()
    .map((fileName) => `/images/${fileName}`);
}

function safeJsonString(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function generateBusinessTs(
  lead: PlaceResult,
  prepared: PrepareResult,
): void {
  const config = INDUSTRY_CONFIG[prepared.industry] || INDUSTRY_CONFIG.generic;
  const content = getIndustryContent(prepared.industry);
  const colorsPath = path.join(prepared.outputDir, 'brand-colors.json');
  const colors = fs.existsSync(colorsPath)
    ? JSON.parse(fs.readFileSync(colorsPath, 'utf8'))
    : {
        primary: '#2563EB',
        primaryDark: '#1E3A5F',
        accent: '#F59E0B',
        surface: '#F8FAFC',
        textTitle: '#1F2937',
        textBody: '#4B5563',
        onPrimary: '#FFFFFF',
        onPrimaryDark: '#FFFFFF',
        accentText: '#92400E',
      };

  const images = getOptimizedImagePaths(prepared.outputDir);
  const heroImage = images[0] ?? '';
  const galleryImages = images.slice(1, 5);
  const name = lead.displayName?.text || 'Business';
  const address = lead.formattedAddress || '';
  const phone = lead.nationalPhoneNumber || '';
  const rating = lead.rating || 4.5;
  const reviewCount = lead.userRatingCount || 0;
  const schemaOrgType = SCHEMA_ORG_TYPE[prepared.industry] || 'LocalBusiness';

  const hours: Record<string, string> = {};
  for (const row of lead.regularOpeningHours?.weekdayDescriptions || []) {
    const [day, ...rest] = row.split(': ');
    if (day && rest.length > 0) {
      hours[day] = rest.join(': ');
    }
  }

  const localeContent = (
    locale: LocaleKey,
    localeCode: 'en' | 'ms' | 'zh-CN' | 'zh-TW',
  ): string => {
    const tagline = randomFrom(content.taglines)[locale];
    const sections = content.menu
      ? `"menu": ${safeJsonString(content.menu[locale])}`
      : `"services": ${safeJsonString(
          (content.services || INDUSTRY_CONTENT.generic.services!)[locale],
        )}`;

    return `{
      meta: {
        title: ${safeJsonString(name)},
        description: ${safeJsonString(tagline)}
      },
      hero: {
        title: ${safeJsonString(name)},
        subtitle: ${safeJsonString(tagline)},
        cta: ${safeJsonString(content.cta[locale])},
        image: ${safeJsonString(heroImage)}
      },
      hours: ${safeJsonString(hours)},
      location: {
        address: ${safeJsonString(address)},
        mapsUrl: ${safeJsonString(lead.googleMapsUri || '')}
      },
      contact: {
        phone: ${safeJsonString(phone)}
        ${phone ? `,\n        whatsapp: ${safeJsonString(phone.replace(/[^+0-9]/g, ''))}` : ''}
      },
      reviews: {
        rating: ${rating},
        count: ${reviewCount},
        featured: ${safeJsonString(generateFeaturedReviews(rating, prepared.industry, locale))}
      },
      trustBar: {
        items: [
          { icon: 'star', label: 'Rating', value: ${safeJsonString(`${rating}/5`)} },
          { icon: 'users', label: 'Reviews', value: ${safeJsonString(`${reviewCount}+`)} },
          { icon: 'map-pin', label: 'Locale', value: ${safeJsonString(localeCode)} }
        ]
      },
      ${sections}
    }`;
  };

  const source = `import type { BusinessData } from '@/types/business';

export const business: BusinessData = {
  schemaOrgType: ${safeJsonString(schemaOrgType)},
  siteUrl: ${safeJsonString(`https://${prepared.slug}.vercel.app`)},
  theme: {
    primary: ${safeJsonString(colors.primary)},
    primaryDark: ${safeJsonString(colors.primaryDark)},
    accent: ${safeJsonString(colors.accent)},
    surface: ${safeJsonString(colors.surface)},
    textTitle: ${safeJsonString(colors.textTitle || '#1F2937')},
    textBody: ${safeJsonString(colors.textBody || '#4B5563')},
    onPrimary: ${safeJsonString(colors.onPrimary || '#FFFFFF')},
    onPrimaryDark: ${safeJsonString(colors.onPrimaryDark || '#FFFFFF')},
    accentText: ${safeJsonString(colors.accentText || '#92400E')},
    fontDisplay: ${safeJsonString(config.fontDisplay)},
    fontBody: ${safeJsonString(config.fontBody)}
  },
  assets: {
    heroImage: ${safeJsonString(heroImage)},
    galleryImages: ${safeJsonString(galleryImages)}
  },
  content: {
    en: ${localeContent('en', 'en')},
    ms: ${localeContent('ms', 'ms')},
    'zh-CN': ${localeContent('zhCN', 'zh-CN')},
    'zh-TW': ${localeContent('zhTW', 'zh-TW')}
  }
};
`;

  fs.writeFileSync(path.join(prepared.outputDir, 'src/data/business.ts'), source);
}

function writeFallbackPage(outputDir: string): void {
  const targetPath = path.join(outputDir, 'src/app/[locale]/page.tsx');
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, FALLBACK_PAGE_TSX);
}

async function prepareFallbackSite(
  lead: PlaceResult,
  industry: string,
): Promise<PrepareResult> {
  const prepared = await prepare(lead, industry);
  generateBusinessTs(lead, prepared);
  writeFallbackPage(prepared.outputDir);
  return prepared;
}

async function processLead(
  lead: PlaceResult,
  config: Pick<BatchConfig, 'dryRun'>,
): Promise<BatchResult> {
  const industry = classifyIndustry(lead.primaryType);
  const name = lead.displayName?.text || 'unknown';
  const slug = slugify(name);

  try {
    const prepared = await prepareFallbackSite(lead, industry);
    const finalized = await finalize({
      dir: prepared.outputDir,
      slug: prepared.slug,
      dryRun: config.dryRun,
    });

    return {
      placeId: lead.id,
      name,
      slug: prepared.slug,
      outputDir: prepared.outputDir,
      industry: prepared.industry,
      status: finalized.status,
      url: finalized.url,
      scores: finalized.scores,
      failures: finalized.failures,
      error: finalized.error,
    };
  } catch (err: unknown) {
    return {
      placeId: lead.id,
      name,
      slug,
      outputDir: path.resolve('output', slug),
      industry,
      status: 'prepare-failed',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function batch(config: BatchConfig): Promise<void> {
  console.log('╔═══════════════════════════════════════╗');
  console.log('║  DuoCode Batch Fallback               ║');
  console.log('╚═══════════════════════════════════════╝');
  console.log(
    `City: ${config.city} | Categories: ${config.categories.join(', ')} | Batch: ${config.batchSize}`,
  );

  const discovered: PlaceResult[] = [];
  for (const category of config.categories) {
    console.log(`\nSearching: ${category} in ${config.city}...`);
    const leads = await searchPlaces(category, config.city, 1, true);
    discovered.push(...leads.slice(0, config.batchSize));
  }

  const deduped = Array.from(new Map(discovered.map((lead) => [lead.id, lead])).values());
  console.log(`\nTotal leads: ${deduped.length}`);

  const results: BatchResult[] = [];
  for (const lead of deduped) {
    const result = await processLead(lead, { dryRun: config.dryRun });
    results.push(result);
    console.log(
      result.status === 'deployed'
        ? `  ✓ ${result.name} -> ${result.url}`
        : `  ✗ ${result.name} -> ${result.status}${result.error ? `: ${result.error}` : ''}`,
    );
  }

  fs.mkdirSync('output', { recursive: true });
  fs.writeFileSync(
    'output/batch-report.json',
    JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2),
  );
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const getArg = (name: string, fallback: string) => {
    const index = args.indexOf(`--${name}`);
    return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
  };

  batch({
    city: getArg('city', 'Kuala Lumpur'),
    categories: getArg('categories', 'restaurant').split(','),
    batchSize: parseInt(getArg('batch-size', '2'), 10),
    dryRun: args.includes('--dry-run'),
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
