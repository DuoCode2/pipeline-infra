import type { BusinessContent } from '@/types/site-data';

export function ReviewsSection({ reviews }: { reviews: BusinessContent['reviews'] }) {
  if (!reviews || reviews.count === 0) return null;

  return (
    <section className="bg-[var(--color-surface)] py-16 px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-display font-bold text-[var(--color-text-title)]">
          Reviews
        </h2>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex gap-0.5" aria-label={`${reviews.rating} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className={`h-5 w-5 ${i < Math.round(reviews.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-[var(--color-text-body)] opacity-70">
            {reviews.rating} ({reviews.count} reviews)
          </span>
        </div>

        {reviews.featured.length > 0 && (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.featured.map((review, i) => (
              <blockquote
                key={i}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex gap-0.5 mb-3" aria-label={`${review.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <svg
                      key={j}
                      className={`h-4 w-4 ${j < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-[var(--color-text-body)] leading-relaxed">
                  &ldquo;{review.text}&rdquo;
                </p>
                <footer className="mt-4 text-sm font-semibold text-[var(--color-text-title)]">
                  &mdash; {review.author}
                </footer>
              </blockquote>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
