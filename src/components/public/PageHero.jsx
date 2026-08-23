import Link from "next/link";

export function PageHero({
  eyebrow,
  title,
  description,
  action,
  secondaryAction,
  dark = false,
}) {
  const surface = dark
    ? "bg-[var(--bw-color-ink)] text-white"
    : "border-b border-slate-200 bg-[var(--bw-color-surface-muted)] text-[var(--bw-color-ink)]";

  return (
    <section className={`pt-28 ${surface}`}>
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        {eyebrow ? (
          <p
            className={`text-sm font-semibold uppercase tracking-[0.22em] ${dark ? "text-[var(--bw-color-brand)]" : "text-[var(--bw-color-muted)]"}`}
          >
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight tracking-[-0.025em] md:text-6xl">
          {title}
        </h1>
        {description ? (
          <p
            className={`mt-6 max-w-3xl text-lg leading-8 md:text-xl ${dark ? "text-white/75" : "text-[var(--bw-color-muted)]"}`}
          >
            {description}
          </p>
        ) : null}
        {action || secondaryAction ? (
          <div className="mt-8 flex flex-wrap gap-3">
            {action ? (
              <Link
                href={action.href}
                className="inline-flex min-h-11 items-center rounded-full bg-[var(--bw-color-brand)] px-6 py-3 text-sm font-semibold text-[var(--bw-color-ink)] transition hover:brightness-95"
              >
                {action.label}
              </Link>
            ) : null}
            {secondaryAction ? (
              <Link
                href={secondaryAction.href}
                className={`inline-flex min-h-11 items-center rounded-full border px-6 py-3 text-sm font-semibold transition ${dark ? "border-white/30 text-white hover:bg-white/10" : "border-[var(--bw-color-ink)] text-[var(--bw-color-ink)] hover:bg-white"}`}
              >
                {secondaryAction.label}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
