import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AboutSidebar from '@/components/AboutSidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import { historyItems, historyAccentPalette } from '@/data/companyHistory';

export default function CompanyHistoryPage() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <section className="py-20">
        <div className="container mx-auto mt-16 px-4">
          <div className="flex flex-col gap-12 lg:flex-row">
            <AboutSidebar active="history" />

            <div className="flex-1">
              <div className="max-w-4xl">
                <h1 className="text-4xl font-bold text-slate-900 md:text-5xl">
                  {language === 'ko' ? '브레인웍스 주요 연혁' : 'Brainworks Milestones'}
                </h1>
              </div>

              <div className="mt-12 space-y-8">
                {historyItems.map((item, index) => {
                  const accent = historyAccentPalette[index % historyAccentPalette.length];
                  return (
                    <article
                      key={item.year}
                      className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div
                        className={'absolute inset-x-0 top-0 h-1 bg-gradient-to-r ' + accent}
                        aria-hidden="true"
                      />
                      <div className="grid gap-6 p-6 md:grid-cols-[minmax(0,_140px)_1fr] md:p-8">
                        <div className="flex flex-col gap-2">
                          <span className="text-3xl font-semibold text-slate-900">{item.year}</span>                        </div>
                        <div className="space-y-4">
                          <p className="text-base text-slate-600">{item.summary[language]}</p>
                          <ul className="space-y-3 text-sm text-slate-700">
                            {item.bullets[language].map((bullet, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                <span
                                  className={'mt-1 inline-flex h-1.5 w-6 rounded-full bg-gradient-to-r ' + accent}
                                  aria-hidden="true"
                                />
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
