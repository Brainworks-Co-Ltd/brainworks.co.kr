import React from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AboutSidebar from '@/components/AboutSidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import awardsData from '@/utils/awardsData';
import certificationsData from '@/utils/certificationsData';

const copy = {
  ko: {
    title: '수상 및 인증',
    subtitle: '브레인웍스의 우수한 AI 기술력 기반 수상 및 인증',
    awardsLabel: '주요 수상 이력',
    certificationsLabel: '주요 인증 현황',
    awardAltSuffix: '수상 이미지',
    certAltSuffix: '인증 이미지',
  },
  en: {
    title: 'Awards & Certifications',
    subtitle: 'A comprehensive view of the accolades and certifications that validate Brainworks’ expertise.',
    awardsLabel: 'Awards',
    certificationsLabel: 'Certifications',
    awardAltSuffix: 'award image',
    certAltSuffix: 'certification image',
  },
};

const formatAwardPeriod = (year, date) => {
  if (!date) {
    return String(year);
  }
  const match = String(date).match(/^(\d{4})-(\d{2})/);
  if (match) {
    const [, y, m] = match;
    return `${y}/${m}`;
  }
  return String(year);
};

export default function HonorsPage() {
  const { language } = useLanguage();
  const t = copy[language];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <section className="py-20">
        <div className="container mx-auto mt-16 px-4">
          <div className="flex flex-col gap-12 lg:flex-row">
            <AboutSidebar active="honors" />

            <div className="flex-1">
              <header className="max-w-4xl">
                <h1 className="text-4xl font-bold text-slate-900 md:text-5xl">{t.title}</h1>
                <p className="mt-4 text-lg text-slate-600">{t.subtitle}</p>
              </header>

              <div className="mt-12 space-y-16">
                <section>
                  <h2 className="text-2xl font-semibold text-slate-900">{t.awardsLabel}</h2>
                  <div className="mt-6 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
                    {awardsData.map((award, index) => (
                      <article
                        key={[award.slug || award.title.ko, award.year].join('-')}
                        className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                      >
                        <div className="relative flex h-48 w-full items-center justify-center bg-slate-100 p-6">
                          <Image
                            src={award.image}
                            alt={`${award.title[language]} ${t.awardAltSuffix}`}
                            fill
                            sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 90vw"
                            className="object-contain"
                          />
                        </div>
                        <div className="flex flex-1 flex-col gap-2 p-6">
                          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
                            <span>#{String(index + 1).padStart(2, '0')}</span>
                            <span>{formatAwardPeriod(award.year, award.date)}</span>
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900">{award.title[language]}</h3>
                          <p className="text-sm text-slate-600">{award.org[language]}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-slate-900">{t.certificationsLabel}</h2>
                  <div className="mt-6 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
                    {certificationsData.map((cert) => (
                      <article
                        key={[cert.slug || cert.title.ko, cert.org.ko].join('-')}
                        className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                      >
                        <div className="relative flex h-48 w-full items-center justify-center bg-slate-100 p-6">
                          <Image
                            src={cert.image}
                            alt={`${cert.title[language]} ${t.certAltSuffix}`}
                            fill
                            sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 90vw"
                            className="object-contain"
                          />
                        </div>
                        <div className="flex flex-1 flex-col gap-2 p-6">
                          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
                            <span>{cert.org[language]}</span>
                            <span>{cert.year}</span>
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900">{cert.title[language]}</h3>
                          <p className="text-sm text-slate-600">{cert.description[language]}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
