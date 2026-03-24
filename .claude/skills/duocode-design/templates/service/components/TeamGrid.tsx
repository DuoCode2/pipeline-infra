import { business } from '@/data/business';
import { type Locale } from '@/lib/i18n';

interface TeamMember {
  name: string;
  role: string;
  description: string;
  image?: string;
}

export function TeamGrid({ locale }: { locale: Locale }) {
  const content = business.content[locale];
  const { theme } = business;
  const team: TeamMember[] = (content as any).team || [];
  const heading = {
    en: 'Meet Our Team',
    ms: 'Kenali Pasukan Kami',
    'zh-CN': '认识我们的团队',
    'zh-TW': '認識我們的團隊',
  };

  if (!team.length) return null;

  return (
    <section className="py-16 sm:py-20" style={{ backgroundColor: theme.surface }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2
          className="mb-12 text-center font-display text-3xl font-bold sm:text-4xl"
          style={{ color: theme.textTitle }}
        >
          {heading[locale]}
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {team.map((member, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="aspect-square overflow-hidden bg-gray-100">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="flex h-full items-center justify-center"
                    style={{ backgroundColor: theme.primaryDark + '15' }}
                  >
                    <svg className="h-20 w-20" style={{ color: theme.primaryDark + '40' }} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3
                  className="font-display text-lg font-bold"
                  style={{ color: theme.textTitle }}
                >
                  {member.name}
                </h3>
                <p
                  className="mt-1 text-sm font-medium"
                  style={{ color: theme.accent }}
                >
                  {member.role}
                </p>
                <p
                  className="mt-2 text-sm leading-relaxed"
                  style={{ color: theme.textBody }}
                >
                  {member.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
