import * as fs from 'fs';
import * as path from 'path';

export interface LighthouseCategorySummary {
  score?: number | null;
  auditRefs?: Array<{ id: string }>;
}

export interface LighthouseAuditSummary {
  id?: string;
  title?: string;
  description?: string;
  score?: number | null;
  details?: {
    items?: Array<{
      node?: {
        snippet?: string;
      };
    }>;
  };
}

export interface LighthouseReport {
  categories?: Record<string, LighthouseCategorySummary | undefined>;
  audits?: Record<string, LighthouseAuditSummary | undefined>;
}

export interface QualityCategoryResult {
  score: number;
  pass: boolean;
  level: 'error' | 'warn';
}

export interface QualityFailure {
  category: string;
  audit: string;
  description: string;
  elements?: string[];
}

// ── Load thresholds from .lighthouserc.json (single source of truth) ──

const FALLBACK_THRESHOLDS: Record<string, number> = {
  performance: 90,
  accessibility: 95,
  seo: 95,
  'best-practices': 90,
};

const FALLBACK_LEVELS: Record<string, 'error' | 'warn'> = {
  performance: 'warn',
  accessibility: 'error',
  seo: 'error',
  'best-practices': 'error',
};

interface LighthouseRcAssertion {
  minScore?: number;
  maxNumericValue?: number;
}

interface LighthouseRc {
  ci?: {
    assert?: {
      assertions?: Record<string, [string, LighthouseRcAssertion]>;
    };
  };
}

function loadThresholds(): {
  thresholds: Record<string, number>;
  levels: Record<string, 'error' | 'warn'>;
} {
  const rcPath = path.resolve(__dirname, '../../.lighthouserc.json');
  try {
    const rc: LighthouseRc = JSON.parse(fs.readFileSync(rcPath, 'utf8'));
    const assertions = rc.ci?.assert?.assertions ?? {};
    const thresholds: Record<string, number> = {};
    const levels: Record<string, 'error' | 'warn'> = {};

    for (const [key, value] of Object.entries(assertions)) {
      // Only extract category thresholds (categories:performance → performance)
      const match = key.match(/^categories:(.+)$/);
      if (match && Array.isArray(value) && value[1]?.minScore != null) {
        const categoryName = match[1];
        thresholds[categoryName] = Math.round(value[1].minScore * 100);
        levels[categoryName] = value[0] === 'warn' ? 'warn' : 'error';
      }
    }

    return Object.keys(thresholds).length > 0
      ? { thresholds, levels }
      : { thresholds: FALLBACK_THRESHOLDS, levels: FALLBACK_LEVELS };
  } catch {
    return { thresholds: FALLBACK_THRESHOLDS, levels: FALLBACK_LEVELS };
  }
}

const loaded = loadThresholds();
export const LIGHTHOUSE_THRESHOLDS: Record<string, number> = loaded.thresholds;
export const LIGHTHOUSE_LEVELS: Record<string, 'error' | 'warn'> = loaded.levels;

export function evaluateLighthouseReport(
  report: LighthouseReport,
  thresholds: Record<string, number> = LIGHTHOUSE_THRESHOLDS,
): {
  lighthouse: Record<string, QualityCategoryResult>;
  failures: QualityFailure[];
  allPass: boolean;
} {
  const categories = report.categories ?? {};
  const audits = report.audits ?? {};
  const lighthouse: Record<string, QualityCategoryResult> = {};
  const failures: QualityFailure[] = [];
  let allPass = true;

  for (const [name, threshold] of Object.entries(thresholds)) {
    const score = Math.round(((categories[name]?.score ?? 0) as number) * 100);
    const pass = score >= threshold;
    const level = LIGHTHOUSE_LEVELS[name] ?? 'error';
    lighthouse[name] = { score, pass, level };
    if (!pass && level === 'error') {
      allPass = false;
    }
  }

  for (const [categoryName, threshold] of Object.entries(thresholds)) {
    const category = categories[categoryName];
    if (!category) {
      continue;
    }

    const categoryScore = Math.round(((category.score ?? 0) as number) * 100);
    if (categoryScore >= threshold) {
      continue;
    }

    for (const ref of category.auditRefs ?? []) {
      const audit = audits[ref.id];
      if (!audit || audit.score === null || (audit.score ?? 1) >= 0.9) {
        continue;
      }

      const elements = (audit.details?.items ?? [])
        .map((item) => item.node?.snippet)
        .filter((snippet): snippet is string => Boolean(snippet));

      failures.push({
        category: categoryName,
        audit: audit.id ?? ref.id,
        description: audit.title ?? audit.description ?? '',
        ...(elements.length > 0 ? { elements } : {}),
      });
    }
  }

  return { lighthouse, failures, allPass };
}
