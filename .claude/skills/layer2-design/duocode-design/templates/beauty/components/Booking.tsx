import { business } from '@/data/business';
import { type Locale } from '@/lib/i18n';

export function Booking({ locale }: { locale: Locale }) {
  const { contact } = business.content[locale];
  const { theme } = business;
  const heading = {
    en: 'Book Your Appointment',
    ms: 'Tempah Temu Janji Anda',
    'zh-CN': '预约',
    'zh-TW': '預約',
  };
  const cta = {
    en: 'Book Now via WhatsApp',
    ms: 'Tempah Sekarang melalui WhatsApp',
    'zh-CN': '通过WhatsApp预约',
    'zh-TW': '透過WhatsApp預約',
  };

  const whatsappNumber = contact.whatsapp || contact.phone;

  return (
    <section className="py-16 sm:py-20" style={{ backgroundColor: theme.accent + '15' }}>
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2
          className="mb-4 font-display text-3xl font-bold sm:text-4xl"
          style={{ color: theme.textTitle }}
        >
          {heading[locale]}
        </h2>
        <a
          href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block rounded-lg px-8 py-4 text-lg font-semibold text-white transition-transform hover:scale-105"
          style={{ backgroundColor: '#25D366' }}
        >
          {cta[locale]}
        </a>
      </div>
    </section>
  );
}
