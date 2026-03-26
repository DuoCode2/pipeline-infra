import { business } from '@/data/business';
import type { Locale } from '@/lib/i18n';

export default function Footer({ locale }: { locale: Locale }) {
  const content = business.content[locale];
  const year = new Date().getFullYear();

  return (
    <footer
      id="contact"
      className="px-6 py-12 text-on-primary-dark"
      style={{ backgroundColor: 'var(--color-primary-dark)' }}
    >
      <div className="mx-auto max-w-4xl space-y-4 text-center">
        <p>{content.location.address}</p>
        <p>
          <a href={`tel:${content.contact.phone}`} className="underline">
            {content.contact.phone}
          </a>
        </p>
        <p className="mt-8 text-sm">
          &copy; {year} {content.meta.title}
        </p>
      </div>
    </footer>
  );
}
