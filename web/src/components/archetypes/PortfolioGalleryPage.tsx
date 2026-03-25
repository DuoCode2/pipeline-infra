'use client';
import { useState } from 'react';
import type { SiteData } from '@/types/site-data';
import { Header } from '@/components/shared/Header';
import { Hero } from '@/components/shared/Hero';
import { Footer } from '@/components/shared/Footer';
import { ReviewsSection } from '@/components/shared/ReviewsSection';
import { ContactSection } from '@/components/shared/ContactSection';

interface GalleryImage {
  src: string;
  caption?: string;
}

interface GalleryCategory {
  name: string;
  images: GalleryImage[];
}

interface PricingTier {
  name: string;
  price: string;
  period?: string;
  features: string[];
  popular?: boolean;
}

function GalleryGrid({ categories }: { categories: GalleryCategory[] }) {
  const [activeCategory, setActiveCategory] = useState(0);

  const current = categories[activeCategory];

  return (
    <section className="bg-[var(--color-surface)] py-16 px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-display font-bold text-[var(--color-text-title)]">
          Portfolio
        </h2>

        <nav className="mt-6 flex gap-2 overflow-x-auto pb-2" aria-label="Gallery categories">
          {categories.map((cat, i) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(i)}
              className={`min-h-[44px] whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition ${
                i === activeCategory
                  ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]'
                  : 'bg-gray-100 text-[var(--color-text-body)] hover:bg-gray-200'
              }`}
              aria-pressed={i === activeCategory}
            >
              {cat.name}
            </button>
          ))}
        </nav>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {current.images.map((img, i) => (
            <figure key={i} className="group relative overflow-hidden rounded-xl shadow-sm">
              <img
                src={img.src}
                alt={img.caption || `Gallery image ${i + 1}`}
                className="aspect-square w-full object-cover transition group-hover:scale-105"
              />
              {img.caption && (
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-sm text-white opacity-0 transition group-hover:opacity-100">
                  {img.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingCards({ packages }: { packages: PricingTier[] }) {
  return (
    <section className="bg-white py-16 px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-display font-bold text-[var(--color-text-title)] text-center">
          Packages
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg, i) => (
            <div
              key={i}
              className={`relative rounded-xl border p-6 shadow-sm ${
                pkg.popular
                  ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]'
                  : 'border-gray-200'
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-[var(--color-on-primary)]">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-semibold text-[var(--color-text-title)]">{pkg.name}</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold text-[var(--color-primary)]">{pkg.price}</span>
                {pkg.period && (
                  <span className="ml-1 text-sm text-[var(--color-text-body)] opacity-70">/{pkg.period}</span>
                )}
              </div>
              <ul className="mt-6 space-y-3">
                {pkg.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-[var(--color-text-body)]">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="mt-6 w-full min-h-[44px] rounded-lg bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-[var(--color-accent-text)] transition hover:opacity-90">
                Inquire
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PortfolioGalleryPage({ site, locale }: { site: SiteData; locale: string }) {
  const content = site.content[locale] || site.content[site.region.defaultLocale];
  if (!content) return null;

  return (
    <>
      <Header site={site} locale={locale} />
      <Hero site={site} content={content} heroStyle="full-bleed" />
      {content.portfolio?.categories && content.portfolio.categories.length > 0 && (
        <GalleryGrid categories={content.portfolio.categories} />
      )}
      {content.packages && content.packages.length > 0 && (
        <PricingCards packages={content.packages} />
      )}
      <ReviewsSection reviews={content.reviews} />
      <ContactSection contact={content.contact} region={site.region} />
      <Footer site={site} content={content} />
    </>
  );
}
