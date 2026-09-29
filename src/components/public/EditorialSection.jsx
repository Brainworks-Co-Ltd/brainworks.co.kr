import { SectionHeader } from "@/components/public/SectionHeader";

const surfaceClasses = {
  plain: "bg-white",
  muted: "bg-[var(--bw-color-surface-muted)]",
  dark: "bg-[var(--bw-color-ink)] text-white",
};

export function EditorialSection({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
  surface = "plain",
  children,
  className = "",
}) {
  const resolvedSurface = surfaceClasses[surface] ?? surfaceClasses.plain;
  const headerClassName =
    surface === "dark"
      ? "[&_h2]:text-white [&_p]:text-white/70 [&_a]:text-white"
      : "";

  return (
    <section className={`${resolvedSurface} py-20 md:py-28 ${className}`}>
      <div className="mx-auto max-w-6xl px-6">
        {title ? (
          <SectionHeader
            eyebrow={eyebrow}
            title={title}
            description={description}
            href={href}
            linkLabel={linkLabel}
            className={headerClassName}
          />
        ) : null}
        {children ? (
          <div className={title ? "mt-10 md:mt-14" : ""}>{children}</div>
        ) : null}
      </div>
    </section>
  );
}
