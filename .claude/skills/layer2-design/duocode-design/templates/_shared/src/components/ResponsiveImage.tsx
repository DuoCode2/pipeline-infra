interface ResponsiveImageProps {
  src: string;
  alt: string;
  manifest?: Record<string, string>;
  className?: string;
  sizes?: string;
}

export function ResponsiveImage({
  src,
  alt,
  manifest,
  className = '',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
}: ResponsiveImageProps) {
  const srcSet = manifest
    ? Object.entries(manifest)
        .filter(([key]) => key.endsWith('w'))
        .map(([key, path]) => `${path} ${key}`)
        .join(', ')
    : undefined;

  return (
    <picture>
      {srcSet && <source srcSet={srcSet} sizes={sizes} type="image/webp" />}
      <img
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
}
