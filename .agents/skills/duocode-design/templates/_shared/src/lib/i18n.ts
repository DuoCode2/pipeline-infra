// Locales are rewritten by scaffold.ts during prepare.
// Default: EN only. translate.ts adds target locales after design.
// DO NOT manually add locales here — use: npx tsx packages/utils/translate.ts --dir ... --locales ms,zh-CN
export const locales = ['en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function isValidLocale(locale: string): locale is Locale {
  return (locales as readonly string[]).includes(locale);
}
