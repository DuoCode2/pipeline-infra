export function isValidLocale(locale: string, locales: string[]): boolean {
  return locales.includes(locale);
}

export function getLocaleLabel(locale: string): string {
  const labels: Record<string, string> = {
    en: 'English',
    ms: 'Bahasa Melayu',
    'zh-CN': '\u7B80\u4F53\u4E2D\u6587',
    'zh-TW': '\u7E41\u9AD4\u4E2D\u6587',
    id: 'Bahasa Indonesia',
    th: '\u0E44\u0E17\u0E22',
    vi: 'Ti\u1EBFng Vi\u1EC7t',
    ja: '\u65E5\u672C\u8A9E',
    ko: '\uD55C\uAD6D\uC5B4',
    es: 'Espa\u00F1ol',
    hi: '\u0939\u093F\u0928\u094D\u0926\u0940',
    fil: 'Filipino',
  };
  return labels[locale] || locale.toUpperCase();
}
