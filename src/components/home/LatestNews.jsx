import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/shared/routing/useLocale";

export default function LatestNews({ items = [] }) {
  const { language } = useLocale();
  return (
    <section
      id="news"
      className="bg-white py-20 md:py-28"
      aria-label={language === "ko" ? "최신 소식" : "Latest news"}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--bw-color-muted)]">
              Brainworks News
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.025em] text-[var(--bw-color-ink)] md:text-5xl">
              {language === "ko" ? "최신 소식" : "Latest news"}
            </h2>
          </div>
          <Link
            href="/news"
            className="hidden text-sm font-semibold text-[var(--bw-color-ink)] underline-offset-4 hover:underline md:block"
          >
            {language === "ko" ? "전체 소식 보기" : "View all news"}
          </Link>
        </div>
        {items.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-slate-200 p-8 text-sm text-[var(--bw-color-muted)]">
            {language === "ko"
              ? "등록된 소식이 없습니다."
              : "No news has been published yet."}
          </p>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {items.slice(0, 3).map((item) => (
              <article
                key={item.slug}
                className="overflow-hidden rounded-[var(--bw-radius-card)] border border-slate-200 bg-white shadow-sm"
              >
                <div className="relative aspect-[16/9] bg-slate-100">
                  {item.thumbnail ? (
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-[var(--bw-color-muted)]">
                      {language === "ko" ? "이미지 없음" : "No image"}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--bw-color-muted)]">
                    {item.category}
                  </p>
                  <h3 className="mt-3 line-clamp-2 text-lg font-semibold text-[var(--bw-color-ink)]">
                    {item.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--bw-color-muted)]">
                    {item.summary}
                  </p>
                  <Link
                    href={`/news/${item.slug}`}
                    className="mt-5 inline-flex text-sm font-semibold text-[var(--bw-color-ink)] underline-offset-4 hover:underline"
                  >
                    {language === "ko" ? "자세히 보기" : "Read more"}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
        <Link
          href="/news"
          className="mt-8 inline-flex text-sm font-semibold text-[var(--bw-color-ink)] underline-offset-4 hover:underline md:hidden"
        >
          {language === "ko" ? "전체 소식 보기" : "View all news"}
        </Link>
      </div>
    </section>
  );
}
