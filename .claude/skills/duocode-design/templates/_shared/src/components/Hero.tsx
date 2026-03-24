import { business } from '@/data/business';
import { type Locale } from '@/lib/i18n';

export function Hero({ locale }: { locale: Locale }) {
  const { hero } = business.content[locale];
  const { theme, assets } = business;

  return (
    <section
      className="relative flex min-h-[80vh] items-center justify-center overflow-hidden"
      style={{ backgroundColor: theme.primaryDark }}
    >
      {assets.heroImage && (
        <>
          <div
            className="absolute inset-0 scale-110 bg-cover bg-center blur-[2px]"
            style={{ backgroundImage: `url(${assets.heroImage})` }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${theme.primaryDark}CC 0%, ${theme.primaryDark}80 40%, ${theme.primaryDark}B3 70%, ${theme.primaryDark}F2 100%)`,
            }}
          />
        </>
      )}
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        {hero.badge && (
          <span
            className="mb-4 inline-block rounded-full px-4 py-1 text-sm font-medium"
            style={{ backgroundColor: theme.accent, color: theme.primaryDark }}
          >
            {hero.badge}
          </span>
        )}
        <h1
          className="mb-6 font-display text-4xl font-bold leading-tight sm:text-5xl md:text-6xl"
          style={{ color: '#FFFFFF' }}
        >
          {hero.title}
        </h1>
        <p className="mb-8 text-lg text-white/80 sm:text-xl">{hero.subtitle}</p>
        <a
          href="#contact"
          className="inline-block rounded-lg px-8 py-4 text-lg font-semibold text-white transition-transform hover:scale-105"
          style={{ backgroundColor: theme.primary }}
        >
          {hero.cta}
        </a>
      </div>
    </section>
  );
}
