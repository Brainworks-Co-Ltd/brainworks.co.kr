import Link from "next/link";
import { useLocale } from "@/shared/routing/useLocale";
import { formatDate } from "@/lib/format-date";

/**
 * @param {{ items?: Array<{publicNumber: number, title: string, date: string, isPinned: boolean}>, page?: number, totalPages?: number, query?: {q?: string, categoryId?: string} }} props
 */
export default function NoticeList({
  items = [],
  page = 1,
  totalPages = 1,
  query = {},
}) {
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
        <p className="border-y border-[var(--bw-color-line)] bg-white p-12 text-center text-sm text-[var(--bw-color-muted)]">
          {language === "ko"
            ? "게시된 공지사항이 없습니다."
            : "No notices have been published."}
        </p>
      ) : (
        <div className="border-y border-[var(--bw-color-line)] bg-white">
          <ul className="divide-y divide-[var(--bw-color-line)]">
            {items.map((item) => (
              <li key={item.publicNumber}>
                <Link
                  href={`/notices/${item.publicNumber}`}
                  className="group grid gap-3 px-5 py-6 transition hover:bg-[var(--bw-color-surface-muted)] md:grid-cols-[minmax(0,0.3fr)_minmax(0,1fr)_auto] md:items-center md:gap-8 md:px-8"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--bw-color-muted)]">
                    {item.isPinned ? (
                      <span className="font-semibold text-[var(--bw-color-brand-strong)]">
                        {language === "ko" ? "고정" : "Pinned"}
                      </span>
                    ) : null}
                    <span>{formatDate(item.date, language)}</span>
                  </div>
                  <h2 className="truncate text-lg font-semibold text-[var(--bw-color-ink)] group-hover:underline">
                    {item.title}
                  </h2>
                  <span className="hidden shrink-0 text-sm font-semibold text-[var(--bw-color-ink)] md:block">
                    {language === "ko" ? "자세히 보기 →" : "Read more →"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {totalPages > 1 ? (
        <nav
          className="mt-8 flex items-center justify-center gap-3"
          aria-label={language === "ko" ? "공지사항 페이지" : "Notice pages"}
        >
          {page <= 1 ? (
            <span
              aria-disabled="true"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm opacity-40"
            >
              {language === "ko" ? "이전" : "Previous"}
            </span>
          ) : (
            <Link
              href={makeHref(page - 1)}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm hover:border-[var(--bw-color-ink)] hover:bg-white"
            >
              {language === "ko" ? "이전" : "Previous"}
            </Link>
          )}
          <span className="text-sm text-[var(--bw-color-muted)]">
            {page} / {totalPages}
          </span>
          {page >= totalPages ? (
            <span
              aria-disabled="true"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm opacity-40"
            >
              {language === "ko" ? "다음" : "Next"}
            </span>
          ) : (
            <Link
              href={makeHref(page + 1)}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm hover:border-[var(--bw-color-ink)] hover:bg-white"
            >
              {language === "ko" ? "다음" : "Next"}
            </Link>
          )}
        </nav>
      ) : null}
    </div>
  );
}
