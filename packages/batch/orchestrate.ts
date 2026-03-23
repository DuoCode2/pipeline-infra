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
  const designDir = path.join(__dirname, '../../.claude/skills/layer2-design/duocode-design/templates');
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

function generateBusinessTs(lead: PlaceResult, industry: string, outputDir: string) {
  const config = INDUSTRY_CONFIG[industry] || INDUSTRY_CONFIG.generic;
  const colorsPath = path.join(outputDir, 'brand-colors.json');
  const colors = fs.existsSync(colorsPath) ? JSON.parse(fs.readFileSync(colorsPath, 'utf8')) : {
    primary: '#2563EB', primaryDark: '#1E40AF', accent: '#F59E0B',
    surface: '#F8FAFC', textTitle: '#FFFFFF', textBody: '#1F2937'
  };

  const name = lead.displayName?.text || 'Business';
  const addr = lead.formattedAddress || '';
  const phone = lead.nationalPhoneNumber || '';
  const rating = lead.rating || 0;
  const reviews = lead.userRatingCount || 0;
  const hours: Record<string, string> = {};
  (lead.regularOpeningHours?.weekdayDescriptions || []).forEach(h => {
    const [day, time] = h.split(': ');
    if (day && time) hours[day] = time;
  });

  // Find available images
  const imgDir = path.join(outputDir, 'public/images');
  const imgs = fs.existsSync(imgDir)
    ? fs.readdirSync(imgDir).filter(f => f.endsWith('-1280.webp')).map(f => `/images/${f}`)
    : [];
  const hero = imgs[0] || '/images/stock-1-1280.webp';
  const gallery = imgs.slice(1, 5);

  const ts = `import { BusinessData } from "../types/business";

export const business: BusinessData = {
  theme: {
    primary: "${colors.primary}",
    primaryDark: "${colors.primaryDark}",
    accent: "${colors.accent}",
    surface: "${colors.surface}",
    textTitle: "${colors.textTitle}",
    textBody: "${colors.textBody}",
    fontDisplay: "${config.fontDisplay}",
    fontBody: "${config.fontBody}",
  },
  assets: {
    heroImage: "${hero}",
    galleryImages: ${JSON.stringify(gallery)},
  },
  content: {
    en: {
      meta: { title: "${name} — ${industry.charAt(0).toUpperCase() + industry.slice(1)} in ${addr.split(',').slice(-3, -1).join(',').trim()}", description: "Visit ${name}. Rated ${rating}/5." },
      hero: { title: "${name}", subtitle: "${industry.charAt(0).toUpperCase() + industry.slice(1)} you can trust", cta: "Learn More", image: "${hero}" },
      hours: ${JSON.stringify(hours)},
      location: { address: "${addr}", mapsUrl: "${lead.googleMapsUri || ''}" },
      contact: { phone: "${phone}" },
      reviews: { rating: ${rating}, count: ${reviews}, featured: [] },
      trustBar: { items: [
        { icon: "star", label: "Rating", value: "${rating}/5" },
        { icon: "users", label: "Reviews", value: "${reviews}+" },
        { icon: "map-pin", label: "Location", value: "${addr.split(',').slice(-3, -2).join('').trim()}" },
      ] },
    },
    ms: {
      meta: { title: "${name}", description: "" },
      hero: { title: "${name}", subtitle: "Dipercayai ramai", cta: "Ketahui Lebih" },
      hours: ${JSON.stringify(hours)},
      location: { address: "${addr}", mapsUrl: "" },
      contact: { phone: "${phone}" },
      reviews: { rating: ${rating}, count: ${reviews}, featured: [] },
    },
    "zh-CN": {
      meta: { title: "${name}", description: "" },
      hero: { title: "${name}", subtitle: "值得信赖", cta: "了解更多" },
      hours: ${JSON.stringify(hours)},
      location: { address: "${addr}", mapsUrl: "" },
      contact: { phone: "${phone}" },
      reviews: { rating: ${rating}, count: 0, featured: [] },
    },
    "zh-TW": {
      meta: { title: "${name}", description: "" },
      hero: { title: "${name}", subtitle: "值得信賴", cta: "了解更多" },
      hours: ${JSON.stringify(hours)},
      location: { address: "${addr}", mapsUrl: "" },
      contact: { phone: "${phone}" },
      reviews: { rating: ${rating}, count: 0, featured: [] },
    },
  },
};
`;
  fs.mkdirSync(path.join(outputDir, 'src/data'), { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'src/data/business.ts'), ts);
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

    // 4. Templates + business.ts
    copyTemplates(industry, outputDir);
    generateBusinessTs(lead, industry, outputDir);

    // 5. Build
    console.log(`  Building...`);
    execSync('npm install --silent && npm run build', { cwd: outputDir, stdio: 'pipe', timeout: 120000 });
    if (!fs.existsSync(path.join(outputDir, 'out'))) throw new Error('Build produced no out/ directory');
    console.log(`  Build OK`);

    // 6. Deploy
    console.log(`  Deploying to Vercel...`);
    const deploy = await deployToVercel(path.join(outputDir, 'out'), slug);
    console.log(`  Deployed: ${deploy.url}`);

    // 7. Push to GitHub
    console.log(`  Pushing to DuoCode2/${slug}...`);
    try {
      execSync(`cd "${outputDir}" && rm -rf .git && git init -q && git config user.name "LiuWei" && git config user.email "sunflowers0607@outlook.com" && echo ".next/\nnode_modules/" > .gitignore && git add -A && git commit -q -m "feat: generated site for ${name}" && gh repo delete DuoCode2/${slug} --yes 2>/dev/null; gh repo create DuoCode2/${slug} --private --source=. --push`, { stdio: 'pipe', timeout: 30000 });
      console.log(`  Pushed: github.com/DuoCode2/${slug}`);
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
