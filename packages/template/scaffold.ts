import * as fs from 'fs';
import * as path from 'path';

const TEMPLATE_ROOT = path.resolve(
  __dirname,
  '../../.claude/skills/duocode-design/templates',
);
const SHARED_TEMPLATE_DIR = path.join(TEMPLATE_ROOT, '_shared');

const SHARED_CONFIG_FILES = [
  'package.json',
  'next.config.js',
  'tailwind.config.ts',
  'tsconfig.json',
  'postcss.config.js',
  'vercel.json',
  '.gitignore',
];

const INDUSTRY_SVGS: Record<string, Array<{ name: string; svg: string }>> = {
  food: [
    {
      name: 'steam',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60" fill="none"><title>Steam</title><path d="M20 50C20 50 25 30 30 30C35 30 30 50 35 50C40 50 35 30 40 30" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity="0.5"/><path d="M55 50C55 50 60 25 65 25C70 25 65 50 70 50C75 50 70 25 75 25" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity="0.4"/><path d="M90 50C90 50 95 32 100 32C105 32 100 50 105 50" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.3"/></svg>',
    },
    {
      name: 'wave-divider',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 40" preserveAspectRatio="none"><title>Wave</title><path d="M0 20C200 5 400 35 600 20C800 5 1000 35 1200 20" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.25"/></svg>',
    },
  ],
  beauty: [
    {
      name: 'flower-petal',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none"><title>Flower</title><ellipse cx="40" cy="20" rx="8" ry="16" stroke="currentColor" stroke-width="1.5" opacity="0.4" transform="rotate(0 40 40)"/><ellipse cx="40" cy="20" rx="8" ry="16" stroke="currentColor" stroke-width="1.5" opacity="0.35" transform="rotate(72 40 40)"/><ellipse cx="40" cy="20" rx="8" ry="16" stroke="currentColor" stroke-width="1.5" opacity="0.3" transform="rotate(144 40 40)"/><ellipse cx="40" cy="20" rx="8" ry="16" stroke="currentColor" stroke-width="1.5" opacity="0.35" transform="rotate(216 40 40)"/><ellipse cx="40" cy="20" rx="8" ry="16" stroke="currentColor" stroke-width="1.5" opacity="0.4" transform="rotate(288 40 40)"/><circle cx="40" cy="40" r="4" fill="currentColor" opacity="0.5"/></svg>',
    },
    {
      name: 'sparkle',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" fill="currentColor"><title>Sparkle</title><path d="M30 5L33 25L53 28L33 31L30 51L27 31L7 28L27 25Z" opacity="0.3"/></svg>',
    },
  ],
  clinic: [
    {
      name: 'pulse',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" fill="none"><title>Pulse</title><path d="M0 30H60L75 10L90 50L105 20L120 35H200" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.3"/></svg>',
    },
    {
      name: 'cross',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" fill="none"><title>Medical</title><rect x="22" y="8" width="16" height="44" rx="3" stroke="currentColor" stroke-width="1.5" opacity="0.25"/><rect x="8" y="22" width="44" height="16" rx="3" stroke="currentColor" stroke-width="1.5" opacity="0.25"/></svg>',
    },
  ],
  automotive: [
    {
      name: 'gear',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none"><title>Gear</title><circle cx="40" cy="40" r="12" stroke="currentColor" stroke-width="2" opacity="0.3"/><circle cx="40" cy="40" r="20" stroke="currentColor" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.2"/><path d="M40 16V8M40 72V64M16 40H8M72 40H64M23 23L17 17M63 63L57 57M23 57L17 63M63 17L57 23" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.25"/></svg>',
    },
    {
      name: 'wrench',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" fill="none"><title>Wrench</title><path d="M45 15C41 11 35 11 31 14L18 27C15 30 15 35 18 38L22 42C25 45 30 45 33 42L46 29C49 25 49 19 45 15Z" stroke="currentColor" stroke-width="1.5" opacity="0.3"/><path d="M22 42L10 54M38 18L50 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.25"/></svg>',
    },
  ],
  tech: [
    {
      name: 'circuit',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><title>Circuit</title><path d="M10 50H30M70 50H90M50 10V30M50 70V90" stroke="currentColor" stroke-width="1.5" opacity="0.25"/><path d="M30 30H70V70H30Z" stroke="currentColor" stroke-width="1.5" opacity="0.2"/><circle cx="30" cy="50" r="3" fill="currentColor" opacity="0.3"/><circle cx="70" cy="50" r="3" fill="currentColor" opacity="0.3"/><circle cx="50" cy="30" r="3" fill="currentColor" opacity="0.3"/><circle cx="50" cy="70" r="3" fill="currentColor" opacity="0.3"/></svg>',
    },
    {
      name: 'chip',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none"><title>Chip</title><rect x="20" y="20" width="40" height="40" rx="4" stroke="currentColor" stroke-width="1.5" opacity="0.25"/><rect x="30" y="30" width="20" height="20" rx="2" stroke="currentColor" stroke-width="1" opacity="0.3"/><path d="M28 15V20M40 15V20M52 15V20M28 60V65M40 60V65M52 60V65M15 28H20M15 40H20M15 52H20M60 28H65M60 40H65M60 52H65" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.2"/></svg>',
    },
  ],
  generic: [
    {
      name: 'dots',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor"><title>Decoration</title><circle cx="20" cy="20" r="2" opacity="0.2"/><circle cx="50" cy="30" r="2" opacity="0.15"/><circle cx="80" cy="15" r="2" opacity="0.2"/><circle cx="35" cy="60" r="2" opacity="0.15"/><circle cx="70" cy="70" r="2" opacity="0.2"/></svg>',
    },
  ],
};

function copyTree(sourceDir: string, targetDir: string): void {
  if (!fs.existsSync(sourceDir)) {
    return;
  }

  fs.mkdirSync(targetDir, { recursive: true });

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      copyTree(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

export function copyTemplates(industry: string, outputDir: string): void {
  const industryDir = path.join(TEMPLATE_ROOT, industry);

  for (const fileName of SHARED_CONFIG_FILES) {
    const sourcePath = path.join(SHARED_TEMPLATE_DIR, fileName);
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, path.join(outputDir, fileName));
    }
  }

  copyTree(path.join(SHARED_TEMPLATE_DIR, 'src'), path.join(outputDir, 'src'));
  copyTree(path.join(SHARED_TEMPLATE_DIR, 'public'), path.join(outputDir, 'public'));

  if (!fs.existsSync(industryDir)) {
    return;
  }

  const pageSource = path.join(industryDir, 'page.tsx');
  if (fs.existsSync(pageSource)) {
    fs.copyFileSync(pageSource, path.join(outputDir, 'src/app/[locale]/page.tsx'));
  }

  copyTree(
    path.join(industryDir, 'components'),
    path.join(outputDir, 'src/components'),
  );
}

export function writeSvgDecorations(industry: string, outputDir: string): void {
  const svgs = INDUSTRY_SVGS[industry] || INDUSTRY_SVGS.generic;
  const svgDir = path.join(outputDir, 'public/svgs');

  fs.mkdirSync(svgDir, { recursive: true });
  for (const { name, svg } of svgs) {
    fs.writeFileSync(path.join(svgDir, `${name}.svg`), svg);
  }
}
