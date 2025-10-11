import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function News({ items = [] }) {
  const { language } = useLanguage();
  const displayedItems = items.slice(0, 3);

  const translate = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value[language] ?? value.ko ?? value.en ?? '';
  };

  return (
    <section id="news" className="min-h-screen flex items-center justify-center bg-white">
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold mb-12 text-center">{language === 'ko' ? '뉴스' : 'News'}</h2>

        {displayedItems.length === 0 ? (
          <div className="text-center text-gray-500 text-lg">
            {language === 'ko' ? '등록된 소식이 없습니다.' : 'No news has been published yet.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedItems.map((item) => (
              <article
                key={item.slug}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="relative h-48">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={translate(item.title)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                      {language === 'ko' ? '이미지 없음' : 'No Image'}
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                    {translate(item.category)}
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-gray-500 text-sm mb-2">{item.date}</div>
                  <h3 className="text-xl font-semibold mb-3">{translate(item.title)}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{translate(item.summary)}</p>
                  <Link
                    href={`/news/${item.slug}`}
                    className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center transition-colors duration-300"
                  >
                    {language === 'ko' ? '자세히 보기' : 'Read More'}
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href="/news"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            {language === 'ko' ? '모든 뉴스 보기' : 'View All News'}
          </Link>
        </div>
      </div>
    </section>
  );
}
