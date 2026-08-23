import { useEffect } from "react";

export function Dialog({
  open,
  onOpenChange,
  title,
  children,
  className = "",
}) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="배경 닫기"
        className="absolute inset-0 cursor-default bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className={`relative z-10 w-full max-w-lg rounded-[var(--bw-radius-feature)] bg-white p-6 shadow-2xl ${className}`}
      >
        <div className="flex items-start justify-between gap-4">
          <h2
            id="dialog-title"
            className="text-xl font-semibold text-[var(--bw-color-ink)]"
          >
            {title}
          </h2>
          <button
            type="button"
            aria-label="닫기"
            className="rounded-[var(--bw-radius-control)] px-2 py-1 text-sm text-[var(--bw-color-muted)] hover:bg-[var(--bw-color-surface-muted)]"
            onClick={() => onOpenChange(false)}
          >
            ×
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </section>
    </div>
  );
}
