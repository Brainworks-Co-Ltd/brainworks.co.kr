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
      <h2 className="max-w-3xl text-2xl font-semibold leading-tight md:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 max-w-2xl text-base leading-7 text-white/70">
          {description}
        </p>
      ) : null}
      <Link
        href={href}
        className="mt-6 inline-flex min-h-11 items-center rounded-full bg-[var(--bw-color-brand)] px-6 py-3 text-sm font-semibold text-[var(--bw-color-ink)] transition hover:brightness-95"
      >
        {label}
      </Link>
    </section>
  );
}
