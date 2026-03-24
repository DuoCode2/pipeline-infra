import { business } from '@/data/business';
import { type Locale } from '@/lib/i18n';

export function ContactForm({ locale }: { locale: Locale }) {
  const { theme } = business;
  const labels = {
    en: { name: 'Name', email: 'Email', message: 'Message', send: 'Send Message' },
    ms: { name: 'Nama', email: 'Emel', message: 'Mesej', send: 'Hantar Mesej' },
    'zh-CN': { name: '姓名', email: '邮箱', message: '留言', send: '发送消息' },
    'zh-TW': { name: '姓名', email: '信箱', message: '留言', send: '發送訊息' },
  };
  const l = labels[locale];

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <input
        type="text"
        placeholder={l.name}
        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2"
        style={{ '--tw-ring-color': theme.primary } as React.CSSProperties}
      />
      <input
        type="email"
        placeholder={l.email}
        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2"
        style={{ '--tw-ring-color': theme.primary } as React.CSSProperties}
      />
      <textarea
        rows={4}
        placeholder={l.message}
        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2"
        style={{ '--tw-ring-color': theme.primary } as React.CSSProperties}
      />
      <button
        type="submit"
        className="w-full rounded-lg px-6 py-3 font-semibold text-white transition-transform hover:scale-[1.02]"
        style={{ backgroundColor: theme.primary }}
      >
        {l.send}
      </button>
    </form>
  );
}
