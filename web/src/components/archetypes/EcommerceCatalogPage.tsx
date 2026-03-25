'use client';
import { useState } from 'react';
import type { SiteData } from '@/types/site-data';
import { Header } from '@/components/shared/Header';
import { Hero } from '@/components/shared/Hero';
import { Footer } from '@/components/shared/Footer';
import { ReviewsSection } from '@/components/shared/ReviewsSection';
import { ContactSection } from '@/components/shared/ContactSection';

interface ProductItem {
  name: string;
  description?: string;
  price?: string;
  image?: string;
  tags?: string[];
  popular?: boolean;
}

interface ProductCategory {
  category: string;
  items: ProductItem[];
}

function ProductGrid({ categories, currencySymbol }: { categories: ProductCategory[]; currencySymbol: string }) {
  const [activeCategory, setActiveCategory] = useState(0);

  const current = categories[activeCategory];

  return (
    <section className="bg-[var(--color-surface)] py-16 px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-display font-bold text-[var(--color-text-title)]">
          Products
        </h2>

        <nav className="mt-6 flex gap-2 overflow-x-auto pb-2" aria-label="Product categories">
          {categories.map((cat, i) => (
            <button
              key={cat.category}
              onClick={() => setActiveCategory(i)}
              className={`min-h-[44px] whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition ${
                i === activeCategory
                  ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]'
                  : 'bg-gray-100 text-[var(--color-text-body)] hover:bg-gray-200'
              }`}
              aria-pressed={i === activeCategory}
            >
              {cat.category}
            </button>
          ))}
        </nav>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {current.items.map((item, i) => (
            <div key={i} className="group rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm transition hover:shadow-md">
              {item.image ? (
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                  {item.popular && (
                    <span className="absolute top-3 left-3 rounded-full bg-[var(--color-accent)] px-2.5 py-1 text-xs font-semibold text-[var(--color-accent-text)]">
                      Popular
                    </span>
                  )}
                </div>
              ) : (
                <div className="relative aspect-square bg-gray-100 flex items-center justify-center">
                  <span className="text-4xl text-gray-300" aria-hidden="true">
                    <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                  </span>
                  {item.popular && (
                    <span className="absolute top-3 left-3 rounded-full bg-[var(--color-accent)] px-2.5 py-1 text-xs font-semibold text-[var(--color-accent-text)]">
                      Popular
                    </span>
                  )}
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-[var(--color-text-title)]">{item.name}</h3>
                {item.description && (
                  <p className="mt-1 text-sm text-[var(--color-text-body)] opacity-70 line-clamp-2">
                    {item.description}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  {item.price && (
                    <span className="text-lg font-bold text-[var(--color-primary)]">
                      {currencySymbol}{item.price}
                    </span>
                  )}
                  <button className="min-h-[44px] rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--color-accent-text)] transition hover:opacity-90">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function EcommerceCatalogPage({ site, locale }: { site: SiteData; locale: string }) {
  const content = site.content[locale] || site.content[site.region.defaultLocale];
  if (!content) return null;

  return (
    <>
      <Header site={site} locale={locale} />
      <Hero site={site} content={content} heroStyle="full-bleed" />
      {content.products?.categories && (
        <ProductGrid
          categories={content.products.categories}
          currencySymbol={site.region.currency.symbol}
        />
      )}
      <ReviewsSection reviews={content.reviews} />
      <ContactSection contact={content.contact} region={site.region} />
      <Footer site={site} content={content} />
    </>
  );
}
