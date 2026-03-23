import { business } from '@/data/business';
import { type Locale } from '@/lib/i18n';

interface ClassItem {
  name: string;
  time: string;
  instructor: string;
  level: string;
  day?: string;
}

export function ClassSchedule({ locale }: { locale: Locale }) {
  const content = business.content[locale];
  const { theme } = business;
  const classes: ClassItem[] = (content as any).classes || [];
  const heading = {
    en: 'Class Schedule',
    ms: 'Jadual Kelas',
    'zh-CN': '课程表',
    'zh-TW': '課程表',
  };
  const levelLabel = {
    en: 'Level',
    ms: 'Tahap',
    'zh-CN': '难度',
    'zh-TW': '難度',
  };

  if (!classes.length) return null;

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2
          className="mb-12 text-center font-display text-3xl font-bold sm:text-4xl"
          style={{ color: theme.textTitle }}
        >
          {heading[locale]}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div
                className="px-6 py-3"
                style={{ backgroundColor: theme.primary }}
              >
                <h3 className="font-display text-lg font-bold text-white">
                  {cls.name}
                </h3>
              </div>
              <div className="space-y-3 p-6">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 flex-shrink-0" style={{ color: theme.accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm" style={{ color: theme.textBody }}>
                    {cls.day ? `${cls.day} · ` : ''}{cls.time}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 flex-shrink-0" style={{ color: theme.accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm" style={{ color: theme.textBody }}>
                    {cls.instructor}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 flex-shrink-0" style={{ color: theme.accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-sm" style={{ color: theme.textBody }}>
                    {levelLabel[locale]}: {cls.level}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
