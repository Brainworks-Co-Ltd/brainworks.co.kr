import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useLocale } from "@/shared/routing/useLocale";
import { PageHero } from "@/components/public/PageHero";
import { SeoMetadata } from "@/components/public/SeoMetadata";
import { getPublishedNewsList } from "@/server/modules/news/query-service";
import { formatDate } from "@/lib/format-date";
import { translate, filterNewsItems } from "@/lib/news-filter";

function NewsMeta({ item, language }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--bw-color-muted)]">
      <span className="text-[var(--bw-color-brand-strong)]">
        {translate(item.category, language) ||
          (language === "ko" ? "뉴스" : "News")}
      </span>
      <span aria-hidden="true">·</span>
      <span>{formatDate(item.date, language)}</span>
    </div>
  );
}

function NewsImage({ item, language, className = "" }) {
  const title = translate(item.title, language);

  return (
    <div
      className={`relative overflow-hidden bg-[var(--bw-color-surface-muted)] ${className}`}
    >
      {item.thumbnail ? (
        <Image
          src={item.thumbnail}
          alt={title}
          fill
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full items-center justify-center px-6 text-sm text-[var(--bw-color-muted)]">
          {language === "ko" ? "이미지 없음" : "No image"}
        </div>
      )}
    </div>
  );
}

function FeaturedNews({ item, language }) {
  return (
    <Link
      href={`/news/${item.slug}`}
      className="group grid overflow-hidden rounded-[var(--bw-radius-feature)] border border-[var(--bw-color-line)] bg-white transition hover:border-[var(--bw-color-brand)] lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]"
    >
      <NewsImage
        item={item}
        language={language}
        className="aspect-[4/3] lg:aspect-auto lg:min-h-[420px]"
      />
      <div className="flex flex-col justify-between gap-10 p-6 md:p-10">
        <div>
          <NewsMeta item={item} language={language} />
          <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.025em] text-[var(--bw-color-ink)] md:text-4xl">
            {translate(item.title, language)}
          </h2>
          <p className="mt-5 text-base leading-8 text-[var(--bw-color-muted)]">
            {translate(item.summary, language)}
          </p>
        </div>
        <span className="inline-flex items-center text-sm font-semibold text-[var(--bw-color-ink)]">
          {language === "ko" ? "자세히 보기" : "Read more"}
          <span
            aria-hidden="true"
            className="ml-3 text-lg transition group-hover:translate-x-1"
          >
            →
          </span>
        </span>
      </div>
    </Link>
  );
}

function SupportingNews({ item, language }) {
  return (
    <Link
      href={`/news/${item.slug}`}
      className="group flex flex-col gap-5 border-y border-[var(--bw-color-line)] py-6"
    >
      <NewsImage item={item} language={language} className="aspect-[16/9]" />
      <div>
        <NewsMeta item={item} language={language} />
        <h3 className="mt-3 text-xl font-semibold leading-snug tracking-[-0.02em] text-[var(--bw-color-ink)] transition group-hover:text-[var(--bw-color-brand-strong)] md:text-2xl">
          {translate(item.title, language)}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--bw-color-muted)]">
          {translate(item.summary, language)}
        </p>
      </div>
    </Link>
  );
}

function NewsArchive({ items, language }) {
  if (!items.length) return null;

  return (
    <section aria-labelledby="news-archive-title">
      <div className="flex items-end justify-between gap-4 border-b border-[var(--bw-color-line)] pb-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--bw-color-muted)]">
            Archive
          </p>
          <h2
            id="news-archive-title"
            className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[var(--bw-color-ink)]"
          >
            {language === "ko" ? "이전 소식" : "Earlier updates"}
          </h2>
        </div>
        <span className="text-sm text-[var(--bw-color-muted)]">
          {items.length}
        </span>
      </div>
      <div className="divide-y divide-[var(--bw-color-line)]">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/news/${item.slug}`}
            className="group grid gap-3 py-6 md:grid-cols-[minmax(0,0.28fr)_minmax(0,1fr)_auto] md:items-center md:gap-8"
          >
            <NewsMeta item={item} language={language} />
            <div>
              <h3 className="text-xl font-semibold leading-snug text-[var(--bw-color-ink)] transition group-hover:text-[var(--bw-color-brand-strong)]">
                {translate(item.title, language)}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--bw-color-muted)]">
                {translate(item.summary, language)}
              </p>
            </div>
            <span
              aria-hidden="true"
              className="text-xl text-[var(--bw-color-ink)] transition group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function News({ newsItems }) {
  const { language } = useLocale();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filterOptions = useMemo(
    () => [
      { value: "all", label: language === "ko" ? "전체" : "All" },
      { value: "company", label: language === "ko" ? "회사소식" : "Company" },
      { value: "business", label: language === "ko" ? "사업" : "Business" },
      {
        value: "partnership",
        label: language === "ko" ? "업무협약" : "Partnerships",
      },
      { value: "awards", label: language === "ko" ? "수상" : "Awards" },
    ],
    [language],
  );

  const filteredItems = useMemo(
    () => filterNewsItems(newsItems, { query: searchQuery, activeFilter }),
    [newsItems, activeFilter, searchQuery],
  );

  return (
    <div className="min-h-screen bg-[var(--bw-color-surface-muted)] text-[var(--bw-color-ink)]">
      <Header />
      <SeoMetadata
        title={language === "ko" ? "브레인웍스 소식" : "Brainworks News"}
        description={
          language === "ko"
            ? "브레인웍스의 최신 소식과 협업 기록을 확인합니다."
            : "Explore Brainworks updates and partnerships."
        }
      />

      <main id="main-content" className="pb-16">
        <PageHero
          variant="plain"
          eyebrow="Brainworks News"
          title={language === "ko" ? "브레인웍스 소식" : "Brainworks News"}
          description={
            language === "ko"
              ? "회사 동향부터 파트너십, 수상 소식까지 한눈에 확인하세요."
              : "Track company updates, partnerships, and awards in one place."
          }
        />
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pt-16 md:pt-20">
          <div className="flex justify-end">
            <div className="relative w-full md:w-72">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bw-color-muted)]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z"
                />
              </svg>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                aria-label={language === "ko" ? "소식 검색" : "Search news"}
                placeholder={
                  language === "ko" ? "검색어를 입력하세요" : "Search news"
                }
                className="w-full rounded-full border border-slate-200 bg-white py-3 pl-9 pr-4 text-sm text-[var(--bw-color-ink)] shadow-sm outline-none transition focus:border-[var(--bw-color-brand)] focus:ring-2 focus:ring-[var(--bw-color-brand)]/20"
              />
            </div>
          </div>

          <div
            className="flex gap-5 overflow-x-auto border-b border-[var(--bw-color-line)]"
            role="tablist"
            aria-label={language === "ko" ? "소식 분류" : "News categories"}
          >
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={activeFilter === option.value}
                className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-semibold transition ${activeFilter === option.value ? "border-[var(--bw-color-brand)] text-[var(--bw-color-ink)]" : "border-transparent text-[var(--bw-color-muted)] hover:text-[var(--bw-color-ink)]"}`}
                onClick={() => setActiveFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          {filteredItems.length === 0 ? (
            <div className="rounded-[var(--bw-radius-card)] border border-slate-200 bg-white p-12 text-center text-[var(--bw-color-muted)] shadow-sm">
              {language === "ko"
                ? "조건에 맞는 소식이 없습니다. 다른 키워드나 분류를 선택해 보세요."
                : "No news matches your filters. Try a different keyword or category."}
            </div>
          ) : (
            <div className="space-y-16">
              <FeaturedNews item={filteredItems[0]} language={language} />

              {filteredItems.length > 1 ? (
                <section aria-labelledby="news-highlights-title">
                  <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--bw-color-muted)]">
                        Highlights
                      </p>
                      <h2
                        id="news-highlights-title"
                        className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[var(--bw-color-ink)]"
                      >
                        {language === "ko"
                          ? "함께 읽어볼 소식"
                          : "More to explore"}
                      </h2>
                    </div>
                  </div>
                  <div className="grid gap-8 lg:grid-cols-2">
                    <SupportingNews
                      item={filteredItems[1]}
                      language={language}
                    />
                    {filteredItems[2] ? (
                      <SupportingNews
                        item={filteredItems[2]}
                        language={language}
                      />
                    ) : null}
                  </div>
                </section>
              ) : null}

              <NewsArchive items={filteredItems.slice(3)} language={language} />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export async function getServerSideProps({ locale, query }) {
  const newsItems = (
    await getPublishedNewsList({
      locale: locale === "en" ? "en" : "ko",
      query,
    })
  ).items;

  return {
    props: {
      newsItems,
    },
  };
}
