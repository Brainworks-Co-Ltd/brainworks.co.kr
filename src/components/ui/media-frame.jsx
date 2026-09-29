import { useEffect, useState } from "react";

export function MediaFrame({
  src,
  poster = undefined,
  alt = "",
  fallback = "미디어를 표시할 수 없습니다.",
  className = "",
  ...props
}) {
  const [failed, setFailed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener?.("change", updatePreference);
    return () => mediaQuery.removeEventListener?.("change", updatePreference);
  }, []);

  const mediaSrc = reducedMotion && poster ? poster : src;

  if (failed || !mediaSrc) {
    return (
      <div
        className={`flex min-h-32 items-center justify-center bg-[var(--bw-color-surface-muted)] p-6 text-center text-sm text-[var(--bw-color-muted)] ${className}`}
      >
        {fallback}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- 재사용 UI 프리미티브라 호출부마다 이미지 크기가 달라 미리 알 수 없다.
    <img
      src={mediaSrc}
      alt={alt}
      className={`block h-full w-full object-cover ${className}`}
      onError={() => setFailed(true)}
      {...props}
    />
  );
}
