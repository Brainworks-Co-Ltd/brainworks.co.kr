export function ProgressTrack({
  value,
  max = 100,
  label,
  tone = "dark",
  className = "",
}) {
  const safeMax = Math.max(1, max);
  const safeValue = Math.min(safeMax, Math.max(0, value));
  const percentage = (safeValue / safeMax) * 100;

  return (
    <div className={`w-full ${className}`}>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={safeValue}
        className={`h-1.5 overflow-hidden rounded-full ${tone === "light" ? "bg-[var(--bw-color-line)]" : "bg-white/30"}`}
      >
        <span
          className="block h-full rounded-full bg-[var(--bw-color-brand)] transition-[width] duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {label ? <span className="sr-only">{label}</span> : null}
    </div>
  );
}
