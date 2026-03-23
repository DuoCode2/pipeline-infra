import { business } from '@/data/business';
import { type Locale } from '@/lib/i18n';

export function DoctorCard({ locale }: { locale: Locale }) {
  const content = business.content[locale];
  const theme = business.theme;
  const doctors = (content as any).doctors || [];

  return (
    <section className="py-16 px-4">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-8 text-center font-display text-3xl font-bold" style={{ color: theme.primary }}>
          {locale === 'ms' ? 'Doktor Kami' : locale.startsWith('zh') ? '我们的医生' : 'Our Doctors'}
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doc: any, i: number) => (
            <div key={i} className="overflow-hidden rounded-xl shadow-md">
              <div className="p-6">
                <h3 className="font-display text-xl font-bold" style={{ color: theme.primaryDark }}>{doc.name}</h3>
                <p className="mt-1 text-sm font-medium" style={{ color: theme.accent }}>{doc.qualification}</p>
                <p className="mt-2 text-sm" style={{ color: theme.textBody }}>{doc.description}</p>
                {doc.languages && (
                  <p className="mt-2 text-xs" style={{ color: theme.textBody }}>
                    Languages: {doc.languages.join(', ')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
