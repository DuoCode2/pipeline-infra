import type { SiteData, BusinessContent } from '@/types/site-data';

export function Hero({ site, content, heroStyle = 'full-bleed' }: {
  site: SiteData;
  content: BusinessContent;
  heroStyle?: 'full-bleed' | 'split' | 'overlay';
}) {
  const heroImage = content.hero.image || site.assets.heroImage;

  return (
    <section className="relative overflow-hidden bg-[var(--color-primary-dark)] text-[var(--color-on-primary-dark)]">
      {heroImage && (
        <div className="absolute inset-0" aria-hidden="true">
          <img src={heroImage} alt="" className="h-full w-full object-cover opacity-30" />
        </div>
      )}
      <div className="relative mx-auto max-w-6xl px-6 py-20 lg:py-28">
        {content.hero.badge && (
          <span className="inline-block rounded-full bg-[var(--color-accent)] px-3 py-1 text-sm font-semibold text-[var(--color-accent-text)] mb-4">
            {content.hero.badge}
          </span>
        )}
        <h1 className="max-w-3xl text-4xl font-display font-bold leading-tight md:text-5xl lg:text-6xl">
          {content.hero.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed opacity-90 md:text-xl">
          {content.hero.subtitle}
        </p>
        {content.hero.cta && (
          <button className="mt-8 inline-flex min-h-[44px] items-center rounded-lg bg-[var(--color-accent)] px-6 py-3 text-base font-semibold text-[var(--color-accent-text)] transition hover:opacity-90">
            {content.hero.cta}
          </button>
        )}
      </div>
    </section>
  );
}
