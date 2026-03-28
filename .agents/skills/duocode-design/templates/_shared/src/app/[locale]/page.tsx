import type { Locale } from '@/lib/i18n';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';

export default function LocalePage({ params }: { params: { locale: Locale } }) {
  return (
    <>
      <Header locale={params.locale} />
      <main>
        <Hero locale={params.locale} />
      </main>
      <Footer locale={params.locale} />
    </>
  );
}
