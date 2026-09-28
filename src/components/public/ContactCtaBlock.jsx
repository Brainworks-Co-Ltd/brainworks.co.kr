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
      data-variant="cta"
      className={`rounded-[var(--bw-radius-feature)] bg-[var(--bw-color-ink)] px-6 py-12 text-white md:px-10 ${className}`}
    >
      <h2 className="bw-h1 max-w-3xl">{title}</h2>
      {description ? (
        <p className="bw-body mt-3 max-w-2xl text-white/70">{description}</p>
      ) : null}
      <Link
        href={href}
        /* 강조색 면 위라 같은 보라 알약은 묻힌다. 흰 알약에 잉크 글자를 둔다. */
        className="mt-8 inline-flex min-h-11 items-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-[var(--bw-color-ink)] transition hover:bg-white/90"
      >
        {label}
      </Link>
    </section>
  );
}
