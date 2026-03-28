import * as fs from 'fs';
import * as path from 'path';

export interface RouteProbe {
  url: string;
  status: number | null;
  ok: boolean;
  location?: string | null;
  error?: string;
}

export interface LocaleRoutesAudit {
  baseUrl: string;
  locales: string[];
  root: RouteProbe;
  localeRoutes: RouteProbe[];
  ok: boolean;
}

export function readLocalesFromProjectDir(projectDir: string): string[] {
  const i18nPath = path.join(projectDir, 'src/lib/i18n.ts');
  if (!fs.existsSync(i18nPath)) return [];

  const source = fs.readFileSync(i18nPath, 'utf8');
  const localesMatch = source.match(/export const locales = \[(.*?)\] as const;/s);
  if (!localesMatch) return [];

  return Array.from(localesMatch[1].matchAll(/'([^']+)'/g)).map((match) => match[1]);
}

export async function probeRoute(url: string): Promise<RouteProbe> {
  try {
    const res = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(10_000),
    });
    return {
      url,
      status: res.status,
      ok: res.status < 400,
      location: res.headers.get('location'),
    };
  } catch (error) {
    return {
      url,
      status: null,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function auditDeployedLocaleRoutes(
  baseUrl: string,
  locales: string[],
): Promise<LocaleRoutesAudit> {
  const trimmedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const root = await probeRoute(trimmedBaseUrl);
  const localeRoutes = await Promise.all(
    locales.map((locale) => probeRoute(`${trimmedBaseUrl}/${locale}`)),
  );

  return {
    baseUrl: trimmedBaseUrl,
    locales,
    root,
    localeRoutes,
    ok: root.ok && localeRoutes.every((route) => route.ok),
  };
}

export async function waitForHealthyLocaleRoutes(
  baseUrl: string,
  locales: string[],
  attempts = 5,
  delayMs = 3_000,
): Promise<LocaleRoutesAudit> {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const audit = await auditDeployedLocaleRoutes(baseUrl, locales);
    if (audit.ok) return audit;
    if (attempt < attempts) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return auditDeployedLocaleRoutes(baseUrl, locales);
}

export function summarizeLocaleRouteFailures(audit: LocaleRoutesAudit): string {
  const failures = audit.localeRoutes
    .filter((route) => !route.ok)
    .map((route) => `${route.url} → ${route.status ?? route.error ?? 'ERR'}`);

  if (!audit.root.ok) {
    failures.unshift(`${audit.baseUrl} → ${audit.root.status ?? audit.root.error ?? 'ERR'}`);
  }

  return failures.join('; ');
}
