import Link from 'next/link';
import { locales, type Locale } from '@/lib/i18n';

// Common locale display labels — falls back to uppercase locale code
const LOCALE_LABELS: Record<string, string> = {
  en: 'EN',
  ms: 'BM',
  'zh-CN': '简',
  'zh-TW': '繁',
  ja: '日',
  ko: '한',
  th: 'TH',
  vi: 'VI',
  id: 'ID',
  hi: 'HI',
  ar: 'AR',
  fr: 'FR',
  de: 'DE',
  nl: 'NL',
  es: 'ES',
  tl: 'TL',
};

export default function LanguageSwitcher({ current }: { current: Locale }) {
  if (locales.length <= 1) return null;

  return (
    <nav aria-label="Language" className="flex gap-2">
      {locales.map((locale) => (
        <Link
          key={locale}
          href={`/${locale}`}
          lang={locale}
          aria-current={locale === current ? 'page' : undefined}
          className={`px-2 py-1 text-sm rounded transition-colors ${
            locale === current
              ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] font-semibold'
              : 'text-[var(--color-text-body)] hover:text-[var(--color-text-title)]'
          }`}
        >
          {LOCALE_LABELS[locale] ?? locale.toUpperCase()}
        </Link>
      ))}
    </nav>
  );
}
