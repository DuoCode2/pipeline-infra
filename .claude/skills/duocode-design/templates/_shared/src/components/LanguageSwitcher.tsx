import Link from 'next/link';
import { locales, type Locale } from '@/lib/i18n';

const localeLabels: Record<Locale, string> = {
  en: 'EN',
  ms: 'BM',
  'zh-CN': '简',
  'zh-TW': '繁',
};

export default function LanguageSwitcher({ current }: { current: Locale }) {
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
              ? 'bg-white/20 font-semibold'
              : 'opacity-70 hover:opacity-100'
          }`}
        >
          {localeLabels[locale]}
        </Link>
      ))}
    </nav>
  );
}
