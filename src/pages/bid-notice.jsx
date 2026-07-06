import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAllBidNotices } from '@/data/bidNotices';

function translate(value, language) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[language] ?? value.ko ?? value.en ?? '';
}

function formatDate(dateString, language) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat(language === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export default function BidNoticeBoard({ notices }) {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return notices;
    }

    return notices.filter((notice) => {
      const haystack = [
        notice.noticeNo,
        translate(notice.title, 'ko'),
        translate(notice.title, 'en'),
        translate(notice.summary, 'ko'),
        translate(notice.summary, 'en'),
        translate(notice.category, 'ko'),
        translate(notice.category, 'en'),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [notices, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Header />

      <main className="pt-28 pb-20">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-12">
            <p className="text-sm font-semibold text-blue-600">
              {language === 'ko' ? '입찰 정보' : 'Bid Information'}
            </p>
            <div className="mt-3 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-3xl font-semibold md:text-4xl">
                  {language === 'ko' ? '입찰 공고 게시판' : 'Bid Notice Board'}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                  {language === 'ko'
                    ? '브레인웍스의 입찰 공고와 제안 제출 일정을 확인할 수 있습니다.'
                    : 'Find Brainworks bid notices and proposal submission schedules.'}
                </p>
              </div>

              <label className="relative block w-full md:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={language === 'ko' ? '공고 검색' : 'Search notices'}
                  className="h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-10">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="hidden grid-cols-[130px_1fr_130px_150px_150px] gap-4 border-b border-slate-200 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 md:grid">
              <span>{language === 'ko' ? '공고번호' : 'No.'}</span>
              <span>{language === 'ko' ? '공고명' : 'Title'}</span>
              <span>{language === 'ko' ? '상태' : 'Status'}</span>
              <span>{language === 'ko' ? '게시일' : 'Posted'}</span>
              <span>{language === 'ko' ? '마감일' : 'Deadline'}</span>
            </div>

            {filteredNotices.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500">
                {language === 'ko' ? '검색 결과가 없습니다.' : 'No bid notices match your search.'}
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {filteredNotices.map((notice) => (
                  <Link
                    key={notice.slug}
                    href={`/bid-notice/${notice.slug}`}
                    className="grid gap-3 px-5 py-5 transition hover:bg-blue-50/50 md:grid-cols-[130px_1fr_130px_150px_150px] md:items-center md:gap-4"
                  >
                    <span className="text-sm font-medium text-slate-500">{notice.noticeNo}</span>
                    <span>
                      <span className="block text-base font-semibold text-slate-950">
                        {translate(notice.title, language)}
                      </span>
                      <span className="mt-1 block text-sm text-slate-500">
                        {translate(notice.summary, language)}
                      </span>
                    </span>
                    <span>
                      <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {translate(notice.status, language)}
                      </span>
                    </span>
                    <span className="text-sm text-slate-600">
                      <span className="md:hidden">{language === 'ko' ? '게시일: ' : 'Posted: '}</span>
                      {formatDate(notice.postedAt, language)}
                    </span>
                    <span className="text-sm text-slate-600">
                      <span className="md:hidden">{language === 'ko' ? '마감일: ' : 'Deadline: '}</span>
                      {formatDate(notice.submissionEnd, language)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: {
      notices: getAllBidNotices(),
    },
  };
}
