import '@/styles/globals.css';
import { getSiteData } from '@/lib/sites';
import { isValidLocale } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import type { SiteData } from '@/types/site-data';

export function generateStaticParams() {
  const { listSites, getSiteData } = require('@/lib/sites');
  const sites = listSites();
  const params: { slug: string; locale: string }[] = [];
  for (const s of sites) {
    const data = getSiteData(s.slug);
    if (data) {
      for (const locale of data.region.locales) {
        params.push({ slug: s.slug, locale });
      }
    }
  }
  return params;
}

export function generateMetadata({ params }: { params: { slug: string; locale: string } }) {
  const site = getSiteData(params.slug);
  if (!site) return {};
  const content = site.content[params.locale] || site.content[site.region.defaultLocale];
  if (!content) return {};
  return {
    title: content.meta.title,
    description: content.meta.description,
    icons: { icon: `/sites/${params.slug}/favicon.svg` },
  };
}

function buildJsonLd(site: SiteData, locale: string) {
  const c = site.content[locale] || site.content[site.region.defaultLocale];
  if (!c) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: c.meta.title,
    description: c.meta.description,
    telephone: c.contact.phone,
    address: { '@type': 'PostalAddress', streetAddress: c.location.address },
    url: c.location.mapsUrl,
    ...(c.reviews.count > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: c.reviews.rating,
        reviewCount: c.reviews.count,
        bestRating: 5,
      },
    } : {}),
  };
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string; locale: string };
}) {
  const site = getSiteData(params.slug);
  if (!site || !isValidLocale(params.locale, site.region.locales)) notFound();

  const theme = site.theme;
  const cssVars = `
    :root {
      --font-display: '${theme.fontDisplay}', sans-serif;
      --font-body: '${theme.fontBody}', sans-serif;
      --color-primary: ${theme.primary};
      --color-primary-dark: ${theme.primaryDark};
      --color-accent: ${theme.accent};
      --color-surface: ${theme.surface};
      --color-text-title: ${theme.textTitle};
      --color-text-body: ${theme.textBody};
      --color-on-primary: ${theme.onPrimary};
      --color-on-primary-dark: ${theme.onPrimaryDark};
      --color-accent-text: ${theme.accentText};
    }
  `;

  const jsonLd = buildJsonLd(site, params.locale);

  return (
    <html lang={params.locale} suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: cssVars }} />
        {site.region.locales.map(l => (
          <link key={l} rel="alternate" hrefLang={l} href={`/demo/${site.slug}/${l}`} />
        ))}
        <link rel="alternate" hrefLang="x-default" href={`/demo/${site.slug}/${site.region.defaultLocale}`} />
        {jsonLd && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        )}
      </head>
      <body className="bg-[var(--color-surface)] text-[var(--color-text-body)]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
