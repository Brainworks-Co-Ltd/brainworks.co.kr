import type { ReactNode } from "react";

type LocalePublicationPanelProps = {
  locale: "ko" | "en";
  status: string;
  busy?: boolean;
  onPublish: () => void;
  onUnpublish: () => void;
  unpublishLabel?: string;
  children?: ReactNode;
};

const statusLabel: Record<string, string> = {
  DRAFT: "초안",
  SCHEDULED: "게시 예약",
  PUBLISHED: "게시 중",
  HIDDEN: "숨김",
  UNPUBLISHED: "게시 중단",
};

export function LocalePublicationPanel({
  locale,
  status,
  busy = false,
  onPublish,
  onUnpublish,
  unpublishLabel = "게시 중단",
  children,
}: LocalePublicationPanelProps) {
  const language = locale === "ko" ? "국문" : "영문";

  return (
    <section
      role="group"
      aria-label={`${language} 게시 관리`}
      className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold">{language}</h3>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
          {statusLabel[status] || status}
        </span>
      </div>
      {children}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={onPublish}
          className="min-h-10 rounded-full bg-[var(--bw-color-ink)] px-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          {language} 게시
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onUnpublish}
          className="min-h-10 rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold disabled:opacity-60"
        >
          {language} {unpublishLabel}
        </button>
      </div>
    </section>
  );
}
