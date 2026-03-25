import { business } from '@/data/business';
import type { Locale } from '@/lib/i18n';

export default function Hero({ locale }: { locale: Locale }) {
  const content = business.content[locale];
  const heroImage = business.assets.heroImage;

  return (
    <section
      className="relative flex min-h-[60vh] items-center justify-center bg-cover bg-center text-white"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <h1 className="font-display text-4xl font-bold md:text-5xl">
          {content.hero.title}
        </h1>
        <p className="mt-4 text-lg md:text-xl opacity-90">
          {content.hero.subtitle}
        </p>
        <a
          href="#contact"
          className="mt-8 inline-block rounded-lg px-8 py-3 font-semibold transition-colors"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-on-primary)',
          }}
        >
          {content.hero.cta}
        </a>
      </div>
    </section>
  );
}
