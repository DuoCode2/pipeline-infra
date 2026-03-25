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
import { getArg } from '../utils/cli';

interface BatchConfig {
  city: string;
  categories: string[];
  batchSize: number;
  dryRun?: boolean;
  regionId: string;
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

type LocaleKey = string;

// ── Inline content types (zero-config, no region module) ─────────
interface ServiceItem { name: string; description: string; price: string; popular?: boolean }
interface SectionGroup { category: string; items: ServiceItem[] }
interface IndustryContent {
  taglines: Record<string, string>[];
  cta: Record<string, string>;
  menu?: Record<string, SectionGroup[]>;
  services?: Record<string, SectionGroup[]>;
  reviewTemplates: Record<string, string[]>;
}

// Default English-only content for batch fallback
const DEFAULT_INDUSTRY_CONTENT: Record<string, IndustryContent> = {
  food: {
    taglines: [{ en: 'Delicious food, crafted with care' }],
    cta: { en: 'View Menu' },
    menu: { en: [{ category: 'Featured', items: [{ name: 'House Special', description: 'Our signature dish', price: '', popular: true }] }] },
    reviewTemplates: { en: ['Great food and wonderful atmosphere!', 'The best in town, always fresh!', 'Amazing flavours, will come back again!'] },
  },
  beauty: {
    taglines: [{ en: 'Your beauty, our passion' }],
    cta: { en: 'Book Now' },
    services: { en: [{ category: 'Services', items: [{ name: 'Signature Treatment', description: 'Our most popular service', price: '' }] }] },
    reviewTemplates: { en: ['Fantastic service, love the results!', 'Professional and friendly staff!', 'Best salon experience ever!'] },
  },
  clinic: {
    taglines: [{ en: 'Care you can trust' }],
    cta: { en: 'Book Appointment' },
    services: { en: [{ category: 'Services', items: [{ name: 'Consultation', description: 'Professional medical consultation', price: '' }] }] },
    reviewTemplates: { en: ['Very professional and caring doctors!', 'Clean facility and great service!', 'Highly recommend this clinic!'] },
  },
  generic: {
    taglines: [{ en: 'Quality service you can rely on' }],
    cta: { en: 'Contact Us' },
    services: { en: [{ category: 'Services', items: [{ name: 'Core Service', description: 'Our primary service offering', price: '' }] }] },
    reviewTemplates: { en: ['Excellent service and great value!', 'Professional and reliable!', 'Would definitely recommend!'] },
  },
};
const DEFAULT_REVIEW_AUTHORS = ['Sarah M.', 'James T.', 'David L.', 'Emily W.', 'Michael K.', 'Jessica R.'];

// Module-level content — set at CLI entry point
let INDUSTRY_CONTENT: Record<string, IndustryContent> = DEFAULT_INDUSTRY_CONTENT;
let REVIEW_AUTHORS: string[] = DEFAULT_REVIEW_AUTHORS;

// Default UI labels per locale (used in fallback page template).
// Only en is guaranteed; other locales are optional.
const LOCALE_LABELS: Record<string, {
  call: string;
  location: string;
  hours: string;
  reviews: string;
  featured: string;
  services: string;
}> = {
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

function buildFallbackPageTsx(locales: string[]): string {
  // Build a labels object containing only the locales this region uses.
  const labelsEntries = locales.map((locale) => {
    const l = LOCALE_LABELS[locale] || LOCALE_LABELS.en;
    return `  ${JSON.stringify(locale)}: ${JSON.stringify(l)}`;
  }).join(',\n');

  return String.raw`import { notFound } from 'next/navigation';
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
${labelsEntries}
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
}

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
    // Skip maps-1 (exterior) — convention shared with prepare.ts pickHeroPhoto
    .filter((fileName) => !fileName.startsWith('maps-1'))
    .sort()
    .map((fileName) => `/images/${fileName}`);
}

function safeJsonString(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function generateBusinessTs(
  lead: PlaceResult,
  prepared: PrepareResult,
  _regionId: string,
): void {
  const locales = ['en'];
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

  const localeContent = (locale: LocaleKey): string => {
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
          { icon: 'map-pin', label: 'Locale', value: ${safeJsonString(locale)} }
        ]
      },
      ${sections}
    }`;
  };

  const localeEntries = locales.map((locale) => {
    return `    ${JSON.stringify(locale)}: ${localeContent(locale)}`;
  }).join(',\n');

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
${localeEntries}
  }
};
`;

  fs.writeFileSync(path.join(prepared.outputDir, 'src/data/business.ts'), source);
}

function writeFallbackPage(outputDir: string, _regionId: string): void {
  const targetPath = path.join(outputDir, 'src/app/[locale]/page.tsx');
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, buildFallbackPageTsx(['en']));
}

async function prepareFallbackSite(
  lead: PlaceResult,
  industry: string,
  regionId: string,
): Promise<PrepareResult> {
  const prepared = await prepare(lead, industry);
  generateBusinessTs(lead, prepared, regionId);
  writeFallbackPage(prepared.outputDir, regionId);
  return prepared;
}

async function processLead(
  lead: PlaceResult,
  config: Pick<BatchConfig, 'dryRun' | 'regionId'>,
): Promise<BatchResult> {
  const industry = classifyIndustry(lead.primaryType, lead.displayName?.text);
  const name = lead.displayName?.text || 'unknown';
  const slug = slugify(name);

  try {
    const prepared = await prepareFallbackSite(lead, industry, config.regionId);
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
  // Zero-config: use default English-only content
  const regionId = config.regionId;
  INDUSTRY_CONTENT = DEFAULT_INDUSTRY_CONTENT;
  REVIEW_AUTHORS = DEFAULT_REVIEW_AUTHORS;

  console.log('╔═══════════════════════════════════════╗');
  console.log('║  DuoCode Batch Fallback               ║');
  console.log('╚═══════════════════════════════════════╝');
  console.log(
    `City: ${config.city} | Categories: ${config.categories.join(', ')} | Batch: ${config.batchSize} | Region: ${regionId}`,
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
    const result = await processLead(lead, { dryRun: config.dryRun, regionId });
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
  const regionId = getArg(args, 'region', 'my');

  batch({
    city: getArg(args, 'city', 'Kuala Lumpur'),
    categories: getArg(args, 'categories', 'food').split(','),
    batchSize: parseInt(getArg(args, 'batch-size', '2'), 10),
    dryRun: args.includes('--dry-run'),
    regionId,
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
