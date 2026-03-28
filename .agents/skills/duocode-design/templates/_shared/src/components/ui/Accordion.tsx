interface AccordionItem {
  title: string;
  content: string;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}

export default function Accordion({ items, className = '' }: AccordionProps) {
  return (
    <div className={`divide-y divide-[var(--color-primary)]/10 ${className}`}>
      {items.map((item, i) => (
        <details key={i} className="group">
          <summary className="flex cursor-pointer items-center justify-between py-4 text-[var(--color-text-title)] font-medium min-h-[44px]">
            <span>{item.title}</span>
            <svg className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <p className="pb-4 text-[var(--color-text-body)] leading-relaxed">{item.content}</p>
        </details>
      ))}
    </div>
  );
}
