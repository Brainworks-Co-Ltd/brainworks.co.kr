export function AdminPageHeader({
  eyebrow = "Admin",
  title,
  description,
  action = null,
}) {
  return (
    <header className="flex flex-col gap-5 border-b border-slate-200 pb-8 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--bw-color-muted)]">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.025em] text-[var(--bw-color-ink)]">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--bw-color-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </header>
  );
}
