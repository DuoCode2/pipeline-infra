import { business } from '@/data/business';
import { type Locale } from '@/lib/i18n';

interface Feature {
  title: string;
  description: string;
  icon?: string;
}

export function FeatureGrid({ locale }: { locale: Locale }) {
  const content = business.content[locale];
  const { theme } = business;
  const features: Feature[] = content.features || [];
  const heading = {
    en: 'Why Choose Us',
    ms: 'Mengapa Pilih Kami',
    'zh-CN': '为什么选择我们',
    'zh-TW': '為什麼選擇我們',
  };

  if (!features.length) return null;

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2
          className="mb-12 text-center font-display text-3xl font-bold sm:text-4xl"
          style={{ color: theme.textTitle }}
        >
          {heading[locale]}
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <div key={i} className="rounded-xl border border-gray-100 p-6">
              {feature.icon && <span className="mb-3 block text-3xl">{feature.icon}</span>}
              <h3 className="mb-2 text-lg font-semibold" style={{ color: theme.textTitle }}>
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: theme.textBody }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
