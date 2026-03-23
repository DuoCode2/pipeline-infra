import { business } from '@/data/business';
import { type Locale } from '@/lib/i18n';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { TrustBar } from '@/components/TrustBar';
import { Services } from '@/components/Services';
import { Booking } from '@/components/Booking';
import { Reviews } from '@/components/Reviews';
import { Hours } from '@/components/Hours';
import { Location } from '@/components/Location';
import { Footer } from '@/components/Footer';

export default function BeautyPage({ params }: { params: { locale: Locale } }) {
  const locale = params.locale;
  const content = business.content[locale];

  return (
    <>
      <Header locale={locale} />
      <main>
        <Hero locale={locale} />
        {content.trustBar && <TrustBar locale={locale} />}
        <Services locale={locale} />
        <Booking locale={locale} />
        <Reviews locale={locale} />
        <Hours locale={locale} />
        <Location locale={locale} />
      </main>
      <Footer locale={locale} />
    </>
  );
}
