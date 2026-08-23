import Link from "next/link";
import { useLocale } from "@/shared/routing/useLocale";

export default function PopupNoticeCard({ notice, onClose, onDayDismiss }) {
  const { language } = useLocale();
  return (
    <article className="w-full rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl md:max-w-sm">
      {notice.imageUrl ? <img src={notice.imageUrl} alt={notice.imageAlt || notice.title} className="mb-4 max-h-48 w-full rounded-2xl object-cover" /> : null}
      <h2 className="text-lg font-semibold text-[var(--bw-color-ink)]">{notice.title}</h2>
      {notice.bodyMarkdown ? <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--bw-color-muted)]">{notice.bodyMarkdown}</p> : null}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {notice.detailUrl ? <Link href={notice.detailUrl} className="inline-flex min-h-10 items-center rounded-full bg-[var(--bw-color-ink)] px-4 text-sm font-semibold text-white">{language === "ko" ? "자세히 보기" : "View details"}</Link> : null}
        <button type="button" onClick={onClose} className="min-h-10 rounded-full border border-slate-300 px-4 text-sm font-medium text-[var(--bw-color-ink)]">{language === "ko" ? "닫기" : "Close"}</button>
        <button type="button" onClick={onDayDismiss} className="min-h-10 rounded-full px-2 text-xs text-[var(--bw-color-muted)] underline underline-offset-4">{language === "ko" ? "오늘 하루 보지 않기" : "Hide for today"}</button>
      </div>
    </article>
  );
}
