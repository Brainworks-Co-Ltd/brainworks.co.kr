import Link from "next/link";
import { useLocale } from "@/shared/routing/useLocale";

function formatDate(value, language) {
  if (!value) return "";
  return new Intl.DateTimeFormat(language === "ko" ? "ko-KR" : "en-US", { year: "numeric", month: "short", day: "2-digit" }).format(new Date(value));
}

/**
 * @param {{ items?: Array<{slug: string, title: string, date: string, isPinned: boolean}>, page?: number, totalPages?: number, query?: {q?: string, categoryId?: string} }} props
 */
export default function NoticeList({ items = [], page = 1, totalPages = 1, query = {} }) {
  const { language } = useLocale();
  const makeHref = (nextPage) => {
    const params = new URLSearchParams();
    if (query.q) params.set("q", query.q);
    if (query.categoryId) params.set("category", query.categoryId);
    if (nextPage > 1) params.set("page", String(nextPage));
    const search = params.toString();
    return search ? `/notices?${search}` : "/notices";
  };
  return (
    <div>
      {items.length === 0 ? (
        <p className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-sm text-[var(--bw-color-muted)]">
          {language === "ko" ? "게시된 공지사항이 없습니다." : "No notices have been published."}
        </p>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
          <ul className="divide-y divide-slate-200">
            {items.map((item) => (
              <li key={item.slug}>
                <Link href={`/notices/${item.slug}`} className="group flex flex-col gap-3 px-6 py-6 transition hover:bg-slate-50 md:flex-row md:items-center md:justify-between md:px-8">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--bw-color-muted)]">
                      {item.isPinned ? <span className="rounded-full bg-[var(--bw-color-ink)] px-2 py-1 font-semibold text-white">{language === "ko" ? "고정" : "Pinned"}</span> : null}
                      <span>{formatDate(item.date, language)}</span>
                    </div>
                    <h2 className="mt-2 truncate text-lg font-semibold text-[var(--bw-color-ink)] group-hover:underline">{item.title}</h2>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-[var(--bw-color-ink)]">{language === "ko" ? "자세히 보기 →" : "Read more →"}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {totalPages > 1 ? (
        <nav className="mt-8 flex items-center justify-center gap-3" aria-label={language === "ko" ? "공지사항 페이지" : "Notice pages"}>
          <Link aria-disabled={page <= 1} href={makeHref(Math.max(1, page - 1))} className={`rounded-full border px-4 py-2 text-sm ${page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-white"}`}>{language === "ko" ? "이전" : "Previous"}</Link>
          <span className="text-sm text-[var(--bw-color-muted)]">{page} / {totalPages}</span>
          <Link aria-disabled={page >= totalPages} href={makeHref(Math.min(totalPages, page + 1))} className={`rounded-full border px-4 py-2 text-sm ${page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-white"}`}>{language === "ko" ? "다음" : "Next"}</Link>
        </nav>
      ) : null}
    </div>
  );
}
