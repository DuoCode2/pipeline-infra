import type { SiteData } from '@/types/site-data';
import { Header } from '@/components/shared/Header';
import { Hero } from '@/components/shared/Hero';
import { Footer } from '@/components/shared/Footer';
import { ReviewsSection } from '@/components/shared/ReviewsSection';
import { HoursSection } from '@/components/shared/HoursSection';
import { LocationSection } from '@/components/shared/LocationSection';
import { ContactSection } from '@/components/shared/ContactSection';
import { TrustBar } from '@/components/shared/TrustBar';
import { MenuBrowser } from '@/components/demos/MenuBrowser';

export function MenuOrderPage({ site, locale }: { site: SiteData; locale: string }) {
  const content = site.content[locale] || site.content[site.region.defaultLocale];
  if (!content) return null;

  return (
    <>
      <Header site={site} locale={locale} />
      <Hero site={site} content={content} heroStyle="full-bleed" />
      {content.trustBar && <TrustBar items={content.trustBar.items} />}
      {content.menu?.categories && (
        <MenuBrowser
          categories={content.menu.categories}
          currencySymbol={site.region.currency.symbol}
        />
      )}
      <ReviewsSection reviews={content.reviews} />
      <HoursSection hours={content.hours} />
      <LocationSection location={content.location} />
      <ContactSection contact={content.contact} region={site.region} />
      <Footer site={site} content={content} />
    </>
  );
}
