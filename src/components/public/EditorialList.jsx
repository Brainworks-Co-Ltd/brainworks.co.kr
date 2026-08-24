import Link from "next/link";

function StoryMeta({ tag, meta }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.14em] text-[var(--bw-color-muted)]">
      {tag ? (
        <span className="text-[var(--bw-color-brand-strong)]">{tag}</span>
      ) : null}
      {tag && meta ? <span aria-hidden="true">·</span> : null}
      {meta ? <span>{meta}</span> : null}
    </div>
  );
}

function StoryImage({ image, alt }) {
  if (!image) return null;

  return (
    <div className="overflow-hidden rounded-[var(--bw-radius-card)] bg-[var(--bw-color-surface-muted)]">
      <img
        src={image}
        alt={alt ?? ""}
        className="aspect-[16/9] w-full object-cover"
      />
    </div>
  );
}

export function EditorialList({ featured = null, items = [], className = "" }) {
  return (
    <div className={`space-y-10 ${className}`}>
      {featured ? (
        <Link
          href={featured.href}
          className="group grid gap-6 border-y border-[var(--bw-color-line)] py-7 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:items-center md:gap-10 md:py-10"
        >
          <StoryImage image={featured.image} alt={featured.title} />
          <div>
            <StoryMeta tag={featured.tag} meta={featured.meta} />
            <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.02em] text-[var(--bw-color-ink)] transition group-hover:text-[var(--bw-color-brand-strong)] md:text-3xl">
              {featured.title}
            </h3>
            {featured.summary ? (
              <p className="mt-4 text-base leading-7 text-[var(--bw-color-muted)]">
                {featured.summary}
              </p>
            ) : null}
            <span className="mt-5 inline-flex text-sm font-semibold text-[var(--bw-color-ink)]">
              자세히 보기{" "}
              <span
                aria-hidden="true"
                className="ml-2 transition group-hover:translate-x-1"
              >
                →
              </span>
            </span>
          </div>
        </Link>
      ) : null}

      {items.length ? (
        <div className="divide-y divide-[var(--bw-color-line)] border-b border-[var(--bw-color-line)]">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group grid gap-4 py-6 md:grid-cols-[minmax(0,0.3fr)_minmax(0,1fr)_auto] md:items-center md:gap-8"
            >
              <StoryMeta tag={item.tag} meta={item.meta} />
              <div>
                <h3 className="text-xl font-semibold leading-snug text-[var(--bw-color-ink)] transition group-hover:text-[var(--bw-color-brand-strong)]">
                  {item.title}
                </h3>
                {item.summary ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--bw-color-muted)]">
                    {item.summary}
                  </p>
                ) : null}
              </div>
              <span
                aria-hidden="true"
                className="text-xl text-[var(--bw-color-ink)] transition group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
