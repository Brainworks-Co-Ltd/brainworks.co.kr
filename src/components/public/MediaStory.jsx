import Link from "next/link";

export function MediaStory({
  eyebrow,
  title,
  description,
  media,
  action = null,
  reverse = false,
  card = false,
  className = "",
}) {
  // 본문 카드 규칙 — docs/designs/detail-page-roles.md
  const cardShell = card
    ? "rounded-[var(--bw-radius-card)] border border-[var(--bw-color-line)] bg-[var(--bw-color-surface-muted)] p-[var(--bw-space-6)]"
    : "";

  return (
    <article
      className={`grid items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16 ${cardShell} ${className}`}
    >
      <div
        className={`overflow-hidden rounded-[var(--bw-radius-feature)] bg-[var(--bw-color-surface-muted)] ${reverse ? "lg:order-2" : ""}`}
      >
        {media}
      </div>
      <div className={reverse ? "lg:order-1" : ""}>
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--bw-color-muted)]">
            {eyebrow}
          </p>
        ) : null}
        <h3 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.025em] text-[var(--bw-color-ink)] md:text-4xl">
          {title}
        </h3>
        {description ? (
          <p className="mt-5 max-w-xl text-base leading-8 text-[var(--bw-color-muted)] md:text-lg">
            {description}
          </p>
        ) : null}
        {action ? (
          <Link
            href={action.href}
            className="mt-7 inline-flex min-h-11 items-center rounded-full bg-[var(--bw-color-brand)] px-6 py-3 text-sm font-semibold text-[var(--bw-color-surface)] transition hover:brightness-95"
          >
            {action.label}
          </Link>
        ) : null}
      </div>
    </article>
  );
}
