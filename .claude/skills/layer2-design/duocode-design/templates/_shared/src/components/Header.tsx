import { business } from '@/data/business';
import { locales, type Locale } from '@/lib/i18n';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header({ locale }: { locale: Locale }) {
  const content = business.content[locale];
  const { theme } = business;

  return (
    <header
      className="sticky top-0 z-50 w-full backdrop-blur-md"
      style={{ backgroundColor: `${theme.primaryDark}ee` }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <a href={`/${locale}`} className="text-xl font-bold text-white font-display">
          {content.meta.title}
        </a>
        <div className="flex items-center gap-4">
          <LanguageSwitcher currentLocale={locale} />
          <a
            href={`#contact`}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: theme.primary }}
          >
            {content.hero.cta}
          </a>
        </div>
      </div>
    </header>
  );
}
