import { useLocale } from "@/shared/routing/useLocale";

export function SkipLink() {
  const { language } = useLocale();

  return (
    <a
      href="#main-content"
      className="sr-only fixed left-4 top-4 z-[200] rounded-[var(--bw-radius-control)] bg-[var(--bw-color-ink)] px-4 py-2 text-sm font-medium text-white focus:not-sr-only"
    >
      {language === "ko" ? "본문으로 건너뛰기" : "Skip to main content"}
    </a>
  );
}
