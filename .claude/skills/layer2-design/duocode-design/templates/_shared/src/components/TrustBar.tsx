import { business } from '@/data/business';
import { type Locale } from '@/lib/i18n';

export function TrustBar({ locale }: { locale: Locale }) {
  const content = business.content[locale];
  const { theme } = business;

  if (!content.trustBar?.items?.length) return null;

  return (
    <section className="border-b border-gray-100 py-6" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-8 px-4 sm:px-6">
        {content.trustBar.items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-center">
            <span className="text-2xl">{item.icon}</span>
            <div>
              <div className="text-lg font-bold" style={{ color: theme.textTitle }}>
                {item.value}
              </div>
              <div className="text-xs" style={{ color: theme.textBody }}>
                {item.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
