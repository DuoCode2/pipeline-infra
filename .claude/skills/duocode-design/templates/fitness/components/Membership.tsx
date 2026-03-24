import { business } from '@/data/business';
import { type Locale } from '@/lib/i18n';

interface MembershipTier {
  name: string;
  price: string;
  period?: string;
  features: string[];
  highlighted?: boolean;
}

export function Membership({ locale }: { locale: Locale }) {
  const content = business.content[locale];
  const { theme } = business;
  const tiers: MembershipTier[] = (content as any).membership || [];
  const heading = {
    en: 'Membership Plans',
    ms: 'Pelan Keahlian',
    'zh-CN': '会员计划',
    'zh-TW': '會員計劃',
  };
  const ctaLabel = {
    en: 'Join Now',
    ms: 'Sertai Sekarang',
    'zh-CN': '立即加入',
    'zh-TW': '立即加入',
  };
  const perMonth = {
    en: '/month',
    ms: '/bulan',
    'zh-CN': '/月',
    'zh-TW': '/月',
  };

  if (!tiers.length) return null;

  return (
    <section className="py-16 sm:py-20" style={{ backgroundColor: theme.surface }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2
          className="mb-12 text-center font-display text-3xl font-bold sm:text-4xl"
          style={{ color: theme.textTitle }}
        >
          {heading[locale]}
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {tiers.map((tier, i) => (
            <div
              key={i}
              className={`relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-shadow hover:shadow-lg ${
                tier.highlighted ? 'ring-2' : 'border border-gray-100'
              }`}
              style={tier.highlighted ? { ringColor: theme.accent, borderColor: theme.accent, boxShadow: `0 0 0 2px ${theme.accent}` } : undefined}
            >
              {tier.highlighted && (
                <div
                  className="absolute left-0 right-0 top-0 py-1 text-center text-xs font-bold uppercase tracking-wider text-white"
                  style={{ backgroundColor: theme.accent }}
                >
                  {locale === 'ms' ? 'Paling Popular' : locale.startsWith('zh') ? '最受欢迎' : 'Most Popular'}
                </div>
              )}
              <div className={tier.highlighted ? 'mt-4' : ''}>
                <h3
                  className="font-display text-xl font-bold"
                  style={{ color: theme.textTitle }}
                >
                  {tier.name}
                </h3>
                <div className="mt-4 flex items-baseline">
                  <span
                    className="font-display text-4xl font-extrabold"
                    style={{ color: tier.highlighted ? theme.accent : theme.primary }}
                  >
                    {tier.price}
                  </span>
                  <span className="ml-1 text-sm" style={{ color: theme.textBody }}>
                    {tier.period || perMonth[locale]}
                  </span>
                </div>
                <ul className="mt-6 space-y-3">
                  {tier.features.map((feature, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-sm" style={{ color: theme.textBody }}>
                      <svg className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: theme.accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  className="mt-8 block rounded-lg py-3 text-center font-semibold transition-transform hover:scale-105"
                  style={
                    tier.highlighted
                      ? { backgroundColor: theme.accent, color: '#FFFFFF' }
                      : { backgroundColor: theme.primary, color: '#FFFFFF' }
                  }
                >
                  {ctaLabel[locale]}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
