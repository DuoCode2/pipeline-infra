import { business } from '@/data/business';
import { type Locale } from '@/lib/i18n';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Categories } from '@/components/Categories';
import { ProductGrid } from '@/components/ProductGrid';
import { Reviews } from '@/components/Reviews';
import { Hours } from '@/components/Hours';
import { Location } from '@/components/Location';
import { CTA } from '@/components/CTA';
import { Footer } from '@/components/Footer';

export default function RetailPage({ params }: { params: { locale: Locale } }) {
  const locale = params.locale;
  const content = business.content[locale];

  return (
    <>
      <Header locale={locale} />
      <main>
        <Hero locale={locale} />
        <Categories locale={locale} />
        <ProductGrid locale={locale} />
        <Reviews locale={locale} />
        <Hours locale={locale} />
        <Location locale={locale} />
        <CTA locale={locale} />
      </main>
      <Footer locale={locale} />
    </>
  );
}
