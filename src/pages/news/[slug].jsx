import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getNewsSlugs, getNewsDetail } from '@/lib/news';

function translate(value, language) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[language] ?? value.ko ?? value.en ?? '';
}

export default function NewsDetail({ news }) {
  const { language } = useLanguage();
  const contentHtml = news?.content?.[language] ?? news?.content?.ko ?? news?.content?.en ?? '';

  if (!news) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="bg-white py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-sm text-blue-600 mb-4 font-semibold">
            {translate(news.category, language)}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            {translate(news.title, language)}
          </h1>
          <div className="text-gray-500 text-sm">
            {news.date}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {news.thumbnail && (
          <div className="mb-12">
            <img
              src={news.thumbnail}
              alt={translate(news.title, language)}
              className="w-full rounded-lg object-cover"
            />
          </div>
        )}
        <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: contentHtml }} />

        {news.externalLinks?.length > 0 && (
          <div className="mt-12 rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              {language === 'ko' ? '관련 외부 기사' : 'External Coverage'}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {language === 'ko'
                ? '아래 링크를 통해 보도 내용을 직접 확인하세요.'
                : 'Explore the original coverage through the links below.'}
            </p>
            <ul className="mt-6 space-y-3">
              {news.externalLinks.map((link, index) => (
                <li key={[link.url, index].join('-')} className="flex items-start gap-3 text-sm">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sky-500" />
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-600 hover:text-sky-800"
                  >
                    {translate(link.label, language)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <Link href="/news" className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-800">
          <span aria-hidden="true">←</span>
          <span>{language === 'ko' ? '뉴스 목록으로 돌아가기' : 'Back to News List'}</span>
        </Link>
      </div>

      <Footer />
    </div>
  );
}

export async function getStaticPaths() {
  const slugs = getNewsSlugs();
  const paths = slugs.map((slug) => ({ params: { slug } }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const news = getNewsDetail(params.slug);

  if (!news) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      news,
    },
  };
}
