import { business } from '@/data/business';
import type { Locale } from '@/lib/i18n';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header({ locale }: { locale: Locale }) {
  const content = business.content[locale];

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 text-on-primary-dark"
      style={{ backgroundColor: 'var(--color-primary-dark)' }}
    >
      <span className="font-display text-lg font-bold">{content.meta.title}</span>
      <LanguageSwitcher current={locale} />
    </header>
  );
}
