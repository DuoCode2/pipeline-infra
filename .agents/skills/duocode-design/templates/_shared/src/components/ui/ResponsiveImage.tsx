interface ResponsiveImageProps {
  src: string; // base name without size suffix, e.g., "maps-2"
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
}

/** Responsive image using the naming convention from optimize-images.ts. */
export default function ResponsiveImage({ src, alt, sizes = '100vw', className = '', priority = false }: ResponsiveImageProps) {
  const widths = [320, 640, 960, 1280];
  const avifSet = widths.map(w => `/images/${src}-${w}.avif ${w}w`).join(', ');
  const webpSet = widths.map(w => `/images/${src}-${w}.webp ${w}w`).join(', ');
  const fallback = `/images/${src}-960.webp`;

  return (
    <picture>
      <source type="image/avif" srcSet={avifSet} sizes={sizes} />
      <source type="image/webp" srcSet={webpSet} sizes={sizes} />
      <img
        src={fallback}
        alt={alt}
        sizes={sizes}
        className={className}
        loading={priority ? undefined : 'lazy'}
        decoding={priority ? undefined : 'async'}
        {...(priority ? { fetchPriority: 'high' as const } : {})}
      />
    </picture>
  );
}
