import { business } from '@/data/business';
import { locales, type Locale } from '@/lib/i18n';
import '@/styles/globals.css';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

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
    viewport: 'width=device-width, initial-scale=1',
    icons: { icon: '/favicon.svg' },
  };
}

function buildJsonLd(locale: Locale) {
  const c = business.content[locale];
  return {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
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
    }
  `;

  return (
    <html lang={params.locale} suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: cssVars }} />
        {locales.map((l) => (
          <link key={l} rel="alternate" hrefLang={l} href={`/${l}`} />
        ))}
        <link rel="alternate" hrefLang="x-default" href="/en" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href={`https://fonts.googleapis.com/css2?family=${theme.fontDisplay.replace(/ /g, '+')}:wght@400;600;700;800&family=${theme.fontBody.replace(/ /g, '+')}:wght@300;400;500;600&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Sans+TC:wght@400;500;700&display=swap`}
          rel="stylesheet"
        />
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
