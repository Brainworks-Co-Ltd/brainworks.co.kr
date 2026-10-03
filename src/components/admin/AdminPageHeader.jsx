/**
 * @param {{ eyebrow?: string, title: string, description?: string, action?: import("react").ReactNode }} props
 */
export function AdminPageHeader({
  eyebrow = "Admin",
  title,
  description,
  action = null,
}) {
  return (
    <header className="flex flex-col gap-5 border-b-2 border-[var(--bw-color-ink)] pb-6 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--bw-color-brand-strong)]">
          {eyebrow}
        </p>
        <h1 className="mt-2 truncate text-3xl font-semibold tracking-[-0.025em] text-[var(--bw-color-ink)]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap gap-2">{action}</div> : null}
    </header>
  );
}
