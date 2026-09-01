import Link from "next/link";

export function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
  align = "left",
  className = "",
}) {
  return (
    <div
      className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""} ${className}`}
    >
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--bw-color-muted)]">
          {eyebrow}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h2 className="bw-h1 text-[var(--bw-color-ink)]">
          {title}
        </h2>
        {href && linkLabel ? (
          <Link
            href={href}
            className="text-sm font-semibold text-[var(--bw-color-ink)] underline-offset-4 hover:underline"
          >
            {linkLabel}
          </Link>
        ) : null}
      </div>
      {description ? (
        <p className="bw-body mt-3 text-[var(--bw-color-muted)]">
          {description}
        </p>
      ) : null}
    </div>
  );
}
