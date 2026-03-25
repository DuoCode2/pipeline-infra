'use client';
import { useState } from 'react';

export function QuoteForm({ heading = 'Get a Free Quote' }: { heading?: string }) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="bg-gray-50 py-16 px-6">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-3xl font-display font-bold text-[var(--color-text-title)] text-center">
          {heading}
        </h2>

        {submitted ? (
          <div className="mt-8 rounded-xl bg-green-50 border border-green-200 p-8 text-center">
            <p className="text-lg font-semibold text-green-800">Thank you!</p>
            <p className="mt-2 text-sm text-green-700">We will get back to you within 24 hours.</p>
          </div>
        ) : (
          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
          >
            <div>
              <label htmlFor="quote-name" className="block text-sm font-medium text-[var(--color-text-title)]">
                Name
              </label>
              <input
                id="quote-name"
                type="text"
                required
                className="mt-1 block w-full min-h-[44px] rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="quote-phone" className="block text-sm font-medium text-[var(--color-text-title)]">
                Phone
              </label>
              <input
                id="quote-phone"
                type="tel"
                required
                className="mt-1 block w-full min-h-[44px] rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="quote-service" className="block text-sm font-medium text-[var(--color-text-title)]">
                Service Needed
              </label>
              <input
                id="quote-service"
                type="text"
                className="mt-1 block w-full min-h-[44px] rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="quote-details" className="block text-sm font-medium text-[var(--color-text-title)]">
                Details
              </label>
              <textarea
                id="quote-details"
                rows={4}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full min-h-[44px] rounded-lg bg-[var(--color-accent)] px-6 py-3 text-base font-semibold text-[var(--color-accent-text)] transition hover:opacity-90"
            >
              Submit Request
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
