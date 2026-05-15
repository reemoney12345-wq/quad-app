interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

export function PageHeader({ eyebrow, title, subtitle }: Props) {
  return (
    <div className="mb-10 max-w-2xl">
      {eyebrow && (
        <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {eyebrow}
        </p>
      )}
      <h1 className="font-serif text-5xl text-ink md:text-6xl">{title}</h1>
      {subtitle && (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}
