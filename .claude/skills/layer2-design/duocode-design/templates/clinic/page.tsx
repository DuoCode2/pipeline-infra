import { business } from '@/data/business';
import { type Locale } from '@/lib/i18n';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { TrustBar } from '@/components/TrustBar';
import { Specialties } from '@/components/Specialties';
import { DoctorCard } from '@/components/DoctorCard';
import { Reviews } from '@/components/Reviews';
import { Hours } from '@/components/Hours';
import { Location } from '@/components/Location';
import { CTA } from '@/components/CTA';
import { Footer } from '@/components/Footer';

export default function ClinicPage({ params }: { params: { locale: Locale } }) {
  const locale = params.locale;
  return (
    <>
      <Header locale={locale} />
      <main>
        <Hero locale={locale} />
        <TrustBar locale={locale} />
        <Specialties locale={locale} />
        <DoctorCard locale={locale} />
        <Reviews locale={locale} />
        <Hours locale={locale} />
        <Location locale={locale} />
        <CTA locale={locale} />
      </main>
      <Footer locale={locale} />
    </>
  );
}
