import React from 'react';
import Image from 'next/image';
import { Award, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import awardsData from '@/utils/awardsData';
import certificationsData from '@/utils/certificationsData';

const copy = {
  ko: {
    title: '수상 및 인증',
    subtitle: '브레인웍스 AI 기술의 우수성',
    awardsLabel: '주요 수상 경력',
    certificationsLabel: '주요 인증 현황',
    awardAltSuffix: '수상 이미지',
    certAltSuffix: '인증 이미지',
  },
  en: {
    title: 'Awards & Certifications',
    subtitle: 'Proven AI excellence trusted by industry partners.',
    awardsLabel: 'Key Awards',
    certificationsLabel: 'Key Certifications',
    awardAltSuffix: 'award photo',
    certAltSuffix: 'certification photo',
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

export default function Honors() {
  const { language } = useLanguage();
  const t = copy[language];

  const featuredAwards = awardsData.slice(0, 4);
  const featuredCertifications = certificationsData.slice(0, 4);

  return (
    <section id="honors" className="relative bg-gradient-to-b from-white via-slate-100 to-white py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-semibold text-slate-900 md:text-5xl">{t.title}</h2>
          <p className="mt-4 text-lg text-slate-600">{t.subtitle}</p>
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm font-medium text-sky-700">
              <Award className="h-5 w-5" />
              <span>{t.awardsLabel}</span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {featuredAwards.map((award, index) => (
                <div
                  key={[award.slug || award.title.ko, award.year].join('-')}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-xl"
                >
                  <div className="relative flex h-48 w-full items-center justify-center bg-slate-100 p-6">
                    <Image
                      src={award.image}
                      alt={`${award.title[language]} ${t.awardAltSuffix}`}
                      fill
                      sizes="(min-width: 1024px) 35vw, 90vw"
                      className="object-contain"
                    />
                  </div>
                  <div className="space-y-2 p-6">
                    <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
                      <span>#{String(index + 1).padStart(2, '0')}</span>
                      <span>{formatAwardPeriod(award.year, award.date)}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">{award.title[language]}</h3>
                    <p className="text-sm text-slate-600">{award.org[language]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
              <span>{t.certificationsLabel}</span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {featuredCertifications.map((cert) => (
                <div
                  key={[cert.slug || cert.title.ko, cert.org.ko].join('-')}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-xl"
                >
                  <div className="relative flex h-48 w-full items-center justify-center bg-slate-100 p-6">
                    <Image
                      src={cert.image}
                      alt={`${cert.title[language]} ${t.certAltSuffix}`}
                      fill
                      sizes="(min-width: 1024px) 35vw, 90vw"
                      className="object-contain"
                    />
                  </div>
                  <div className="space-y-2 p-6">
                    <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
                      <span>{cert.org[language]}</span>
                      <span>{cert.year}</span>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-900">{cert.title[language]}</h4>
                    <p className="text-sm text-slate-600">{cert.description[language]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
