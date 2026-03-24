interface SvgDecorationProps {
  name: string;
  className?: string;
}

export function SvgDecoration({ name, className = '' }: SvgDecorationProps) {
  return (
    <img
      src={`/svgs/${name}.svg`}
      alt=""
      role="presentation"
      className={className}
      loading="lazy"
    />
  );
}
