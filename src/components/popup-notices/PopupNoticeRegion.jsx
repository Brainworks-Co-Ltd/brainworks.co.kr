import { useEffect, useState } from "react";
import Link from "next/link";
import { XIcon } from "lucide-react";
import { useLocale } from "@/shared/routing/useLocale";
import {
  dismissForDay,
  dismissForSession,
  isDismissed,
} from "@/components/popup-notices/dismissal-store";

/*
 * 팝업 공지는 화면 한가운데 모달로 하나씩 뜬다.
 *
 * 2026-09-02 형태: 검은 오버레이, 600px 카드 하나, 이미지 아래
 * 「오늘 하루 보지 않기 | 닫기」. 오른쪽 아래 toast로 세 장을 나란히 두던
 * 이전 형태는 눈에 띄지 않아 팝업의 목적(시급한 내용을 눈에 띄게)과 어긋났다.
 *
 * 여러 건이 게시돼 있으면 displayOrder 순으로 닫을 때마다 다음 것이 뜬다.
 * 서버의 최대 3건 규칙, 관리자 화면, 제외 기록 규칙은 그대로다.
 * 승인 명세 §5.3은 2026-09-02에 이 형태로 갱신했다.
 *
 * 2026-09-16: 위 모달은 검은 오버레이와 포커스 트랩 때문에 에러 경고창처럼
 * 읽힌다는 지적을 받았다. 화면 왼쪽 위, 헤더 아래에 붙는 비차단 카드로
 * 바꾼다 — 오버레이도 포커스 트랩도 스크롤 잠금도 없고, 뒤 페이지는 그대로
 * 스크롤되고 조작된다. 두 버튼(오늘 하루 보지 않기 / 닫기)이던 것을 체크박스
 * 하나 + 닫기 버튼으로 합쳤다: 체크한 채 닫으면 dismissForDay, 아니면
 * dismissForSession — 두 함수와 dismissalRevision 인자는 그대로 재사용한다.
 * 큐 동작(한 번에 하나, 닫으면 다음 것, 이미 제외된 건 건너뜀)도 그대로다.
 */
/** @typedef {{ id: string, title: string, bodyMarkdown?: string | null, imageUrl?: string | null, imageAlt?: string | null, detailUrl?: string | null, dismissalRevision: number, displayOrder?: number }} PopupNotice */

/**
 * @param {PopupNotice[]} notices
 * @param {Set<string>} dismissed
 */
export function nextPopup(notices, dismissed) {
  return notices.find((notice) => !dismissed.has(notice.id)) ?? null;
}

/**
 * @param {{ notice: PopupNotice, language: string, onDismiss: (mode: "day" | "session") => void }} props
 */
function NoticeCard({ notice, language, onDismiss }) {
  const [keepHiddenToday, setKeepHiddenToday] = useState(false);
  const ko = language === "ko";
  /* 이미지 전용(§5.1)은 본문 텍스트를 화면에 그리지 않는다. 제목은 보조 기술용으로만 남긴다. */
  const imageOnly = Boolean(notice.imageUrl) && !notice.bodyMarkdown;

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onDismiss("session");
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onDismiss]);

  return (
    <aside
      role="region"
      aria-label={ko ? "팝업 공지" : "Popup notice"}
      className="fixed left-5 right-5 top-20 z-40 max-w-[500px] overflow-hidden rounded-[var(--bw-radius-card)] border border-line bg-white shadow-[var(--bw-shadow-soft)]"
    >
      <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
        <p
          className={
            imageOnly
              ? "sr-only"
              : "text-[17px] font-semibold leading-[1.45] text-ink-strong"
          }
        >
          {notice.title}
        </p>
        <button
          type="button"
          onClick={() => onDismiss("session")}
          aria-label={ko ? "공지 닫기" : "Close notice"}
          className="-mr-1 flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-tint hover:text-ink-strong"
        >
          <XIcon aria-hidden="true" className="size-4" />
        </button>
      </div>

      {notice.imageUrl || notice.bodyMarkdown || notice.detailUrl ? (
        <div className="max-h-[60vh] space-y-4 overflow-y-auto p-5">
          {notice.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- 관리자가 업로드한 팝업 이미지라 실제 크기를 미리 알 수 없다.
            <img
              src={notice.imageUrl}
              alt={notice.imageAlt || ""}
              className="block w-full"
            />
          ) : null}
          {notice.bodyMarkdown ? (
            <p className="whitespace-pre-wrap text-[15px] leading-6 text-muted-foreground">
              {notice.bodyMarkdown}
            </p>
          ) : null}
          {notice.detailUrl ? (
            <Link
              href={notice.detailUrl}
              className="inline-flex min-h-9 items-center rounded-[var(--bw-radius-control)] bg-ink-strong px-4 text-sm font-semibold text-white"
            >
              {ko ? "자세히 보기" : "View details"}
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-4">
        <label className="flex items-center gap-2 text-[15px] text-muted-foreground">
          <input
            type="checkbox"
            checked={keepHiddenToday}
            onChange={(event) => setKeepHiddenToday(event.target.checked)}
            className="size-4 rounded border-line"
          />
          {ko ? "오늘 하루 다시 보지 않기" : "Don't show again today"}
        </label>
        <button
          type="button"
          onClick={() => onDismiss(keepHiddenToday ? "day" : "session")}
          className="min-h-10 shrink-0 rounded-[var(--bw-radius-control)] bg-ink-strong px-5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          {ko ? "닫기" : "Close"}
        </button>
      </div>
    </aside>
  );
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

  return (
    <NoticeCard
      key={notice.id}
      notice={notice}
      language={language}
      onDismiss={hide}
    />
  );
}
