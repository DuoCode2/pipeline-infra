'use client';

interface DemoModalProps {
  open: boolean;
  onClose: () => void;
  locale?: string;
}

const messages: Record<string, { title: string; body: string; button: string }> = {
  en: { title: 'Demo Feature', body: 'This feature will be available in the production version.', button: 'Close' },
  ms: { title: 'Ciri Demo', body: 'Ciri ini akan tersedia dalam versi pengeluaran.', button: 'Tutup' },
  'zh-CN': { title: '演示功能', body: '此功能将在正式版中启用。', button: '关闭' },
  'zh-TW': { title: '展示功能', body: '此功能將在正式版中啟用。', button: '關閉' },
  ja: { title: 'デモ機能', body: 'この機能は正式版でご利用いただけます。', button: '閉じる' },
  ko: { title: '데모 기능', body: '이 기능은 정식 버전에서 사용할 수 있습니다.', button: '닫기' },
};

export default function DemoModal({ open, onClose, locale = 'en' }: DemoModalProps) {
  if (!open) return null;
  const msg = messages[locale] ?? messages.en;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose} role="dialog" aria-modal="true">
      <div className="mx-4 w-full max-w-sm rounded-xl bg-[var(--color-surface)] p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <h3 className="mb-2 text-lg font-semibold text-[var(--color-text-title)]">{msg.title}</h3>
        <p className="mb-4 text-[var(--color-text-body)]">{msg.body}</p>
        <button type="button" onClick={onClose} className="w-full rounded-lg bg-[var(--color-accent)] py-2.5 font-medium text-[var(--color-accent-text)] min-h-[44px]">
          {msg.button}
        </button>
      </div>
    </div>
  );
}
