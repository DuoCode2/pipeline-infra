'use client';
import type { SiteData } from '@/types/site-data';
import { getLocaleLabel } from '@/lib/i18n';

export function Header({ site, locale }: { site: SiteData; locale: string }) {
  const content = site.content[locale];
  return (
    <header className="sticky top-0 z-40 bg-[var(--color-primary-dark)] text-[var(--color-on-primary-dark)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href={`/demo/${site.slug}/${locale}`} className="text-xl font-display font-bold">
          {site.businessName}
        </a>
        {site.region.locales.length > 1 && (
          <nav aria-label="Language" className="flex gap-2">
            {site.region.locales.map(l => (
              <a
                key={l}
                href={`/demo/${site.slug}/${l}`}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  l === locale
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                aria-current={l === locale ? 'page' : undefined}
              >
                {getLocaleLabel(l)}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
