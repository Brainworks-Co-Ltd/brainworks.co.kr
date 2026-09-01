import Link from "next/link";

export function ContactCtaBlock({
  title,
  description,
  href = "/contact",
  label,
  className = "",
}) {
  return (
    <section
      className={`rounded-[var(--bw-radius-feature)] bg-[var(--bw-color-ink)] px-6 py-12 text-white md:px-10 ${className}`}
    >
      <h2 className="bw-h1 max-w-3xl">
        {title}
      </h2>
      {description ? (
        <p className="bw-body mt-3 max-w-2xl text-white/70">
          {description}
        </p>
      ) : null}
      <Link
        href={href}
        className="mt-6 inline-flex min-h-11 items-center rounded-full bg-[var(--bw-color-brand)] px-6 py-3 text-sm font-semibold text-[var(--bw-color-surface)] transition hover:brightness-95"
      >
        {label}
      </Link>
    </section>
  );
}
