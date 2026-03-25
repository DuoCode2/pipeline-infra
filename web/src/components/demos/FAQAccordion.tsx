'use client';
import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQAccordion({ items, heading = 'FAQ' }: { items: FAQItem[]; heading?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!items || items.length === 0) return null;

  return (
    <section className="bg-[var(--color-surface)] py-16 px-6">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-3xl font-display font-bold text-[var(--color-text-title)] text-center">
          {heading}
        </h2>
        <div className="mt-8 space-y-3">
          {items.map((item, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full min-h-[44px] items-center justify-between px-6 py-4 text-left font-medium text-[var(--color-text-title)] transition hover:bg-gray-50"
                aria-expanded={openIndex === i}
              >
                <span>{item.question}</span>
                <svg
                  className={`h-5 w-5 flex-shrink-0 transition-transform ${openIndex === i ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === i && (
                <div className="border-t border-gray-100 px-6 py-4 text-sm text-[var(--color-text-body)] leading-relaxed">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
