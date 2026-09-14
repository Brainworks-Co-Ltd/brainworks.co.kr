import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/shared/routing/useLocale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  dismissForDay,
  dismissForSession,
  isDismissed,
} from "@/components/popup-notices/dismissal-store";

/*
 * 팝업 공지는 화면 한가운데 모달로 하나씩 뜬다.
 *
 * 솔트룩스 홈 실측(2026-09-02): 검은 오버레이, 600px 카드 하나, 이미지 아래
 * 「오늘 하루 보지 않기 | 닫기」. 오른쪽 아래 toast로 세 장을 나란히 두던
 * 이전 형태는 눈에 띄지 않아 팝업의 목적(시급한 내용을 눈에 띄게)과 어긋났다.
 *
 * 여러 건이 게시돼 있으면 displayOrder 순으로 닫을 때마다 다음 것이 뜬다.
 * 서버의 최대 3건 규칙, 관리자 화면, 제외 기록 규칙은 그대로다.
 * 승인 명세 §5.3은 2026-09-02에 이 형태로 갱신했다.
 */
/** @typedef {{ id: string, title: string, bodyMarkdown?: string | null, imageUrl?: string | null, imageAlt?: string | null, detailUrl?: string | null, dismissalRevision: number, displayOrder?: number }} PopupNotice */

/**
 * @param {PopupNotice[]} notices
 * @param {Set<string>} dismissed
 */
export function nextPopup(notices, dismissed) {
  return notices.find((notice) => !dismissed.has(notice.id)) ?? null;
}

/** @param {{ notices?: PopupNotice[] }} props */
export default function PopupNoticeRegion({ notices = [] }) {
  const { language } = useLocale();
  /* 서버에서는 제외 기록을 읽을 수 없다. 마운트 전에는 아무것도 열지 않아야
     hydration이 어긋나지 않는다. null은 "아직 모름"이다. */
  const [dismissed, setDismissed] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage/localStorage는 서버에 없어 마운트 후에만 읽을 수 있다. 렌더 중 파생으로 바꾸면 hydration이 어긋난다.
    setDismissed(
      new Set(
        notices
          .filter((notice) => isDismissed(notice.id, notice.dismissalRevision))
          .map((notice) => notice.id),
      ),
    );
  }, [notices]);

  const notice = dismissed ? nextPopup(notices, dismissed) : null;
  if (!notice) return null;

  const hide = (mode) => {
    if (mode === "day") dismissForDay(notice.id, notice.dismissalRevision);
    else dismissForSession(notice.id, notice.dismissalRevision);
    setDismissed(new Set(dismissed).add(notice.id));
  };
  const ko = language === "ko";
  /* 이미지 전용(§5.1)은 본문 텍스트를 화면에 그리지 않는다. 제목은 보조 기술용으로만 남긴다. */
  const imageOnly = Boolean(notice.imageUrl) && !notice.bodyMarkdown;

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) hide("session");
      }}
    >
      <DialogContent
        showCloseButton={false}
        aria-label={ko ? "팝업 공지" : "Popup notice"}
        className="gap-0 overflow-hidden p-0 sm:max-w-[520px]"
      >
        {notice.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- 관리자가 업로드한 팝업 이미지라 실제 크기를 미리 알 수 없다.
          <img
            src={notice.imageUrl}
            alt={notice.imageAlt || ""}
            className="block w-full"
          />
        ) : null}
        <div className={imageOnly && !notice.detailUrl ? "sr-only" : "p-6"}>
          <DialogTitle className={imageOnly ? "sr-only" : undefined}>
            {notice.title}
          </DialogTitle>
          {notice.bodyMarkdown ? (
            <DialogDescription className="mt-3 whitespace-pre-wrap leading-6">
              {notice.bodyMarkdown}
            </DialogDescription>
          ) : null}
          {notice.detailUrl ? (
            <Link
              href={notice.detailUrl}
              className="mt-5 inline-flex min-h-10 items-center rounded-full bg-[var(--bw-color-ink)] px-4 text-sm font-semibold text-white"
            >
              {ko ? "자세히 보기" : "View details"}
            </Link>
          ) : null}
        </div>
        <div className="grid grid-cols-2 border-t border-slate-200 text-sm">
          <button
            type="button"
            onClick={() => hide("day")}
            className="min-h-12 border-r border-slate-200 text-[var(--bw-color-muted)] transition hover:bg-slate-50"
          >
            {ko ? "오늘 하루 보지 않기" : "Hide for today"}
          </button>
          <button
            type="button"
            onClick={() => hide("session")}
            className="min-h-12 font-semibold text-[var(--bw-color-ink)] transition hover:bg-slate-50"
          >
            {ko ? "닫기" : "Close"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
