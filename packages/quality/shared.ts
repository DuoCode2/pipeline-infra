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
}

export interface QualityFailure {
  category: string;
  audit: string;
  description: string;
  elements?: string[];
}

export const LIGHTHOUSE_THRESHOLDS: Record<string, number> = {
  performance: 90,
  accessibility: 95,
  seo: 95,
  'best-practices': 90,
};

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
    lighthouse[name] = { score, pass };
    if (!pass) {
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
