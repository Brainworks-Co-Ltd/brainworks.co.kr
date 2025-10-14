import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAllNewsMeta } from '@/lib/news';

function translate(value, language) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[language] ?? value.ko ?? value.en ?? '';
}

function formatDate(dateString, language) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }
  return new Intl.DateTimeFormat(language === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(date);
}

const FILTER_KEYWORDS = {
  all: [],
  company: ['회사', 'company', 'press', '브리핑'],
  business: ['사업', 'business', 'solution', 'product'],
  partnership: ['협약', 'mou', '업무협약', 'partnership', 'agreement'],
  awards: ['수상', 'award', 'awards', '인증', 'certification'],
};

function NewsCard({ item, language }) {
  const title = translate(item.title, language);
  const summary = translate(item.summary, language);
  const category = translate(item.category, language);
  const dateLabel = formatDate(item.date, language);
  const image = item.thumbnail;

  return (
    <Link
      href={'/news/' + item.slug}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(min-width: 1280px) 320px, (min-width: 768px) 40vw, 90vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 text-sm text-slate-500">
            {language === 'ko' ? '이미지 없음' : 'No image'}
          </div>
        )}
        <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow">
          {category || (language === 'ko' ? '뉴스' : 'News')}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{dateLabel}</span>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-sky-600">
          {title}
        </h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">{summary}</p>
        <div className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-sky-600">
          {language === 'ko' ? '자세히 보기' : 'Read More'}
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6l6 6-6 6" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

export default function News({ newsItems }) {
  const { language } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filterOptions = useMemo(
    () => [
      { value: 'all', label: language === 'ko' ? '전체' : 'All' },
      { value: 'company', label: language === 'ko' ? '회사소식' : 'Company' },
      { value: 'business', label: language === 'ko' ? '사업' : 'Business' },
      { value: 'partnership', label: language === 'ko' ? '업무협약' : 'Partnerships' },
      { value: 'awards', label: language === 'ko' ? '수상' : 'Awards' },
    ],
    [language],
  );

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return newsItems.filter((item) => {
      const titleKo = translate(item.title, 'ko').toLowerCase();
      const titleEn = translate(item.title, 'en').toLowerCase();
      const summaryKo = translate(item.summary, 'ko').toLowerCase();
      const summaryEn = translate(item.summary, 'en').toLowerCase();
      const categoryKo = translate(item.category, 'ko').toLowerCase();
      const categoryEn = translate(item.category, 'en').toLowerCase();

      const matchesQuery =
        !query ||
        titleKo.includes(query) ||
        titleEn.includes(query) ||
        summaryKo.includes(query) ||
        summaryEn.includes(query) ||
        categoryKo.includes(query) ||
        categoryEn.includes(query);

      if (!matchesQuery) {
        return false;
      }

      if (activeFilter === 'all') {
        return true;
      }

      const keywords = FILTER_KEYWORDS[activeFilter] || [];
      if (keywords.length === 0) {
        return true;
      }

      return [categoryKo, categoryEn].some((value) =>
        keywords.some((keyword) => value.includes(keyword.toLowerCase())),
      );
    });
  }, [newsItems, activeFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <main className="pt-28 pb-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold md:text-4xl">
                {language === 'ko' ? '브레인웍스 소식' : 'Brainworks News'}
              </h1>
              <p className="text-sm text-slate-500">
                {language === 'ko'
                  ? '회사 동향부터 파트너십, 수상 소식까지 한눈에 확인하세요.'
                  : 'Track company updates, partnerships, and awards in one place.'}
              </p>
            </div>
            <div className="relative w-full md:w-72">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z" />
              </svg>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={language === 'ko' ? '검색어를 입력하세요' : 'Search news'}
                className="w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-sm">
              {language === 'ko'
                ? '조건에 맞는 소식이 없습니다. 다른 키워드나 분류를 선택해 보세요.'
                : 'No news matches your filters. Try a different keyword or category.'}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((item) => (
                <NewsCard key={item.slug} item={item} language={language} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export async function getStaticProps() {
  const newsItems = getAllNewsMeta();

  return {
    props: {
      newsItems,
    },
  };
}
