import { locales, type Locale } from '@/lib/i18n';
import '@/styles/globals.css';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  return (
    <html lang={params.locale}>
      <head>
        {locales.map((l) => (
          <link key={l} rel="alternate" hrefLang={l} href={`/${l}`} />
        ))}
        <link rel="alternate" hrefLang="x-default" href="/en" />
      </head>
      <body>{children}</body>
    </html>
  );
}
