import { business } from '@/data/business';
import { type Locale } from '@/lib/i18n';

export function CTA({ locale }: { locale: Locale }) {
  const { hero, contact } = business.content[locale];
  const { theme } = business;

  return (
    <section id="contact" className="py-16 sm:py-20" style={{ backgroundColor: theme.primary }}>
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="mb-4 font-display text-3xl font-bold text-white sm:text-4xl">
          {hero.cta}
        </h2>
        <p className="mb-8 text-lg text-white/80">
          {contact.phone}
          {contact.whatsapp && ` · WhatsApp: ${contact.whatsapp}`}
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href={`tel:${contact.phone.replace(/\s/g, '')}`}
            className="inline-block rounded-lg bg-white px-8 py-4 text-lg font-semibold transition-transform hover:scale-105"
            style={{ color: theme.primary }}
          >
            {locale === 'ms' ? 'Hubungi Kami' : locale.startsWith('zh') ? '联系我们' : 'Call Now'}
          </a>
          {contact.whatsapp && (
            <a
              href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`}
              className="inline-block rounded-lg border-2 border-white px-8 py-4 text-lg font-semibold text-white transition-transform hover:scale-105"
            >
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
