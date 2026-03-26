import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  image?: string;
  imageAlt?: string;
  horizontal?: boolean;
}

export default function Card({ children, className = '', image, imageAlt = '', horizontal = false }: CardProps) {
  return (
    <div className={`rounded-xl bg-[var(--color-surface)] overflow-hidden shadow-sm ${horizontal ? 'flex flex-col sm:flex-row' : ''} ${className}`}>
      {image && (
        <div className={horizontal ? 'sm:w-2/5 flex-shrink-0' : ''}>
          <img src={image} alt={imageAlt} loading="lazy" decoding="async" className="w-full h-48 object-cover" />
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
