import { business } from '@/data/business';
import type { Locale } from '@/lib/i18n';

/**
 * Hero section with responsive <picture> for LCP-optimal image loading.
 *
 * Uses <img> instead of CSS background-image so the browser preload scanner
 * can discover the image during HTML parsing (improving LCP by 200-500ms).
 * fetchpriority="high" marks this as the LCP element.
 * AVIF → WebP progressive enhancement via <source> elements.
 */
export default function Hero({ locale }: { locale: Locale }) {
  const content = business.content[locale];
  const heroImage = business.assets.heroImage;

  // Attempt to derive srcset paths from heroImage.
  // heroImage format: /images/{name}-{size}.webp
  const match = heroImage.match(/^(\/images\/(.+?))-(\d+)\.webp$/);
  const basePath = match?.[1]; // e.g. /images/maps-2
  const hasResponsive = Boolean(basePath);

  return (
    <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden" style={{ color: 'var(--color-on-primary-dark)' }}>
      {/* Hero image — uses <picture> for AVIF/WebP with responsive srcset */}
      {hasResponsive ? (
        <picture>
          <source
            type="image/avif"
            srcSet={`${basePath}-320.avif 320w, ${basePath}-640.avif 640w, ${basePath}-960.avif 960w, ${basePath}-1280.avif 1280w`}
            sizes="100vw"
          />
          <source
            type="image/webp"
            srcSet={`${basePath}-320.webp 320w, ${basePath}-640.webp 640w, ${basePath}-960.webp 960w, ${basePath}-1280.webp 1280w`}
            sizes="100vw"
          />
          <img
            src={heroImage}
            alt={content.hero.title}
            className="absolute inset-0 h-full w-full object-cover"
            fetchPriority="high"
            decoding="async"
          />
        </picture>
      ) : (
        <img
          src={heroImage}
          alt={content.hero.title}
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
          decoding="async"
        />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <h1 className="font-display text-4xl font-bold md:text-5xl">
          {content.hero.title}
        </h1>
        <p className="mt-4 text-lg md:text-xl">
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
