import React from 'react';
import { Award } from 'lucide-react';
import awardsData from '@/utils/awardsData';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const copy = {
  ko: {
    title: '수상 경력',
    timelineLabel: '수상 연혁',
    cta: '전체 수상 내역 보기',
  },
  en: {
    title: 'Awards',
    timelineLabel: 'Awards Timeline',
    cta: 'View All Awards',
  },
};

const formatAwardPeriod = (year, date, language) => {
  if (!date) {
    return String(year);
  }
  const match = String(date).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, y, m, d] = match;
    if (language === 'ko') {
      return `${y}년 ${m}월 ${d}일`;
    }
    return `${y}-${m}-${d}`;
  }
  return String(year);
};

export default function Awards() {
  const { language } = useLanguage();
  const t = copy[language];

  return (
    <section id="awards" className="min-h-screen flex items-center justify-center bg-white">
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">{t.title}</h2>
        <div className="max-w-3xl mx-auto">
          <div className="relative border-l-2 border-blue-200 ml-12">
            {awardsData.map((award, idx) => (
              <div
                key={[award.slug || award.title.ko, award.year].join('-')}
                className={`mb-8 pl-8 relative transform transition-all duration-300 hover:scale-105 ${
                  award.highlight ? 'bg-blue-50 p-6 rounded-lg shadow-md' : ''
                }`}
              >
                <span className="absolute -left-5 top-2 flex items-center justify-center bg-blue-500 text-white w-10 h-10 rounded-full">
                  <Award className="w-6 h-6" />
                </span>
                <div className="text-sm text-gray-500">
                  {formatAwardPeriod(award.year, award.date, language)}
                </div>
                <h3 className="text-xl font-semibold mt-1">{award.title[language]}</h3>
                <p className="text-gray-600 mt-1">{award.org[language]}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" className="hover:bg-blue-50 transition-colors duration-300">
              {t.cta}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
