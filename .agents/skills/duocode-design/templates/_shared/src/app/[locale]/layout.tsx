import { business } from '@/data/business';
import { locales, type Locale } from '@/lib/i18n';
import '@/styles/globals.css';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export function generateMetadata({ params }: { params: { locale: Locale } }) {
  const content = business.content[params.locale];
  return {
    title: content.meta.title,
    description: content.meta.description,
    openGraph: {
      title: content.meta.title,
      description: content.meta.description,
      type: 'website',
    },
    icons: { icon: '/favicon.svg' },
  };
}

function buildJsonLd(locale: Locale) {
  const c = business.content[locale];
  return {
    '@context': 'https://schema.org',
    '@type': business.schemaOrgType || 'LocalBusiness',
    name: c.meta.title,
    description: c.meta.description,
    telephone: c.contact.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: c.location.address,
    },
    url: c.location.mapsUrl,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: c.reviews.rating,
      reviewCount: c.reviews.count,
      bestRating: 5,
    },
  };
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  const theme = business.theme;
  const cssVars = `
    :root {
      --font-display: '${theme.fontDisplay}', 'Noto Sans SC', 'Noto Sans TC', serif;
      --font-body: '${theme.fontBody}', 'Noto Sans SC', 'Noto Sans TC', sans-serif;
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

  return (
    <html lang={params.locale} suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: cssVars }} />
        {locales.map((l) => (
          <link key={l} rel="alternate" hrefLang={l} href={business.siteUrl ? `${business.siteUrl}/${l}` : `/${l}`} />
        ))}
        <link rel="alternate" hrefLang="x-default" href={business.siteUrl ? `${business.siteUrl}/en` : '/en'} />
        {/* Self-hosted Latin fonts (downloaded during asset prep) */}
        <link rel="stylesheet" href="/fonts/font-face.css" />
        {/* Async CJK fonts — non-blocking, loaded via script to survive React hydration */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Noto+Sans+TC:wght@400;500;700&display=swap';document.head.appendChild(l)})();` }} />
        <noscript>
          <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Noto+Sans+TC:wght@400;500;700&display=swap" rel="stylesheet" />
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(params.locale)) }}
        />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
