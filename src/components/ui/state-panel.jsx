const statusCopy = {
  loading: "불러오는 중입니다.",
  empty: "표시할 내용이 없습니다.",
  error: "내용을 불러오지 못했습니다.",
};

export function StatePanel({
  status = "empty",
  title,
  description = undefined,
  actionLabel,
  onAction,
  className = "",
}) {
  const resolvedTitle = title || statusCopy[status] || statusCopy.empty;

  return (
    <section
      role="status"
      aria-live={status === "error" ? "assertive" : "polite"}
      className={`rounded-[var(--bw-radius-card)] border border-slate-200 bg-[var(--bw-color-surface-muted)] p-6 text-center ${className}`}
    >
      <h2 className="font-semibold text-[var(--bw-color-ink)]">
        {resolvedTitle}
      </h2>
      {description ? (
        <p className="mt-2 text-sm text-[var(--bw-color-muted)]">
          {description}
        </p>
      ) : null}
      {actionLabel && onAction ? (
        <button
          type="button"
          className="mt-4 rounded-[var(--bw-radius-control)] bg-[var(--bw-color-ink)] px-4 py-2 text-sm font-medium text-white hover:bg-black"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}
