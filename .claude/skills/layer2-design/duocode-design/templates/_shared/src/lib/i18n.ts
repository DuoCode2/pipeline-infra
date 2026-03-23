export const locales = ['en', 'ms', 'zh-CN', 'zh-TW'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function isValidLocale(locale: string): locale is Locale {
  return (locales as readonly string[]).includes(locale);
}
