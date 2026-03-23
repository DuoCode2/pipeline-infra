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
  return (
    <html lang={params.locale}>
      <head>
        {locales.map((l) => (
          <link key={l} rel="alternate" hrefLang={l} href={`/${l}`} />
        ))}
        <link rel="alternate" hrefLang="x-default" href="/en" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href={`https://fonts.googleapis.com/css2?family=${theme.fontDisplay.replace(/ /g, '+')}:wght@400;600;700;800&family=${theme.fontBody.replace(/ /g, '+')}:wght@300;400;500;600&display=swap`}
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          '--font-display': `'${theme.fontDisplay}', serif`,
          '--font-body': `'${theme.fontBody}', sans-serif`,
          '--color-primary': theme.primary,
          '--color-primary-dark': theme.primaryDark,
          '--color-accent': theme.accent,
          '--color-surface': theme.surface,
          '--color-text-title': theme.textTitle,
          '--color-text-body': theme.textBody,
        } as React.CSSProperties}
      >
        {children}
      </body>
    </html>
  );
}
