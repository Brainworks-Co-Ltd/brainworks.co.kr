import Link from "next/link";

export function ActionLink({
  href,
  children,
  variant = "primary",
  className = "",
}) {
  const styles =
    variant === "secondary"
      ? "border border-[var(--bw-color-ink)] text-[var(--bw-color-ink)] hover:bg-[var(--bw-color-surface-muted)]"
      : "bg-[var(--bw-color-ink)] text-white hover:bg-black";

  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${styles} ${className}`}
    >
      {children}
    </Link>
  );
}
