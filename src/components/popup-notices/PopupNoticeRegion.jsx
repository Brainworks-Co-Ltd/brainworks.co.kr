import { useEffect, useMemo, useState } from "react";
import { useLocale } from "@/shared/routing/useLocale";
import PopupNoticeCard from "@/components/popup-notices/PopupNoticeCard";
import { dismissForDay, dismissForSession, isDismissed } from "@/components/popup-notices/dismissal-store";

export default function PopupNoticeRegion({ notices = [] }) {
  const { language } = useLocale();
  const [dismissed, setDismissed] = useState(() => new Set());
  const [mobileIndex, setMobileIndex] = useState(0);
  useEffect(() => {
    setDismissed(new Set(notices.filter((notice) => isDismissed(notice.id, notice.dismissalRevision)).map((notice) => notice.id)));
  }, [notices]);
  const visibleNotices = useMemo(() => notices.filter((notice) => !dismissed.has(notice.id)).slice(0, 3), [dismissed, notices]);
  useEffect(() => {
    if (mobileIndex >= visibleNotices.length) setMobileIndex(Math.max(0, visibleNotices.length - 1));
  }, [mobileIndex, visibleNotices.length]);
  if (!visibleNotices.length) return null;
  const hide = (notice, mode) => {
    if (mode === "day") dismissForDay(notice.id, notice.dismissalRevision);
    else dismissForSession(notice.id, notice.dismissalRevision);
    setDismissed((current) => new Set(current).add(notice.id));
  };
  const current = visibleNotices[mobileIndex];
  return (
    <section className="pointer-events-none fixed inset-x-0 bottom-4 z-40 px-4 sm:bottom-6" aria-label={language === "ko" ? "팝업 공지" : "Popup notices"} aria-live="polite">
      <div className="mx-auto flex max-w-6xl justify-end">
        <div className="pointer-events-auto hidden gap-4 md:flex">
          {visibleNotices.map((notice) => <PopupNoticeCard key={notice.id} notice={notice} onClose={() => hide(notice, "session")} onDayDismiss={() => hide(notice, "day")} />)}
        </div>
        <div className="pointer-events-auto flex w-full flex-col gap-3 md:hidden">
          <PopupNoticeCard notice={current} onClose={() => hide(current, "session")} onDayDismiss={() => hide(current, "day")} />
          {visibleNotices.length > 1 ? <div className="flex items-center justify-between rounded-full bg-white/95 px-4 py-2 text-xs shadow"><button type="button" onClick={() => setMobileIndex((index) => (index - 1 + visibleNotices.length) % visibleNotices.length)}>{language === "ko" ? "이전" : "Previous"}</button><span>{mobileIndex + 1}/{visibleNotices.length}</span><button type="button" onClick={() => setMobileIndex((index) => (index + 1) % visibleNotices.length)}>{language === "ko" ? "다음" : "Next"}</button></div> : null}
        </div>
      </div>
    </section>
  );
}
