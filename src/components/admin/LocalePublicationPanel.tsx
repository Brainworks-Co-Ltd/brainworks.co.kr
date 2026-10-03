import type { ReactNode } from "react";
import {
  brandButtonClass,
  dangerButtonClass,
  StatusBadge,
} from "@/components/admin/fields";
import { displayPublicationLabel } from "@/lib/publication-state";

type LocalePublicationPanelProps = {
  locale: "ko" | "en";
  status: string;
  busy?: boolean;
  /** 비어 있으면 게시 가능. 채워져 있으면 게시 버튼을 막고 부족한 항목을 보여 준다. */
  missing?: string[];
  onPublish: () => void;
  onUnpublish: () => void;
  unpublishLabel?: string;
  children?: ReactNode;
};

const statusLabel: Record<string, string> = {
  ...displayPublicationLabel,
  PUBLISHED: "게시 중",
  HIDDEN: "숨김",
};

export function LocalePublicationPanel({
  locale,
  status,
  busy = false,
  missing = [],
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
      className="grid gap-4 border-t-2 border-[var(--bw-color-ink)] pt-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold">{language} 게시 상태</h3>
        <StatusBadge status={status} label={statusLabel[status] || status} />
      </div>
      {children}
      {missing.length && !["PUBLISHED", "LIVE", "SCHEDULED"].includes(status) ? (
        <p className="text-xs leading-5 text-amber-800">
          게시하려면 다음 항목을 채워야 합니다: {missing.join(", ")}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || missing.length > 0}
          onClick={onPublish}
          className={brandButtonClass}
        >
          {language} 게시
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onUnpublish}
          className={dangerButtonClass}
        >
          {language} {unpublishLabel}
        </button>
      </div>
    </section>
  );
}
