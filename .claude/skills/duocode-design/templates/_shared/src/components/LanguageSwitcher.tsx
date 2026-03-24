import { locales, type Locale } from '@/lib/i18n';

const LOCALE_LABELS: Record<Locale, string> = {
  en: 'EN',
  ms: 'BM',
  'zh-CN': '中',
  'zh-TW': '繁',
};

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  return (
    <div className="flex gap-1">
      {locales.map((l) => (
        <a
          key={l}
          href={`/${l}`}
          className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
            l === currentLocale
              ? 'bg-white/20 text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          {LOCALE_LABELS[l]}
        </a>
      ))}
    </div>
  );
}
