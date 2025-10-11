import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/data/translations';

export default function About() {
  const { language } = useLanguage();
  const t = translations[language];

  const stats = [
    { label: language === 'ko' ? '프로젝트' : 'Projects', value: 120 },
    { label: language === 'ko' ? '고객사' : 'Clients', value: 45 },
    { label: language === 'ko' ? '특허·인증' : 'Patents', value: 12 },
  ];

  return (
    <section id="about" className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">{language === 'ko' ? '회사소개' : 'About Us'}</h2>
        <p className="max-w-2xl mx-auto mb-10 text-lg">
          {language === 'ko' 
            ? '우리는 도전과 혁신으로 세상을 바꿉니다.' 
            : 'We change the world through challenge and innovation.'}
        </p>
        <div className="flex justify-center space-x-12">
          {stats.map(s => (
            <div key={s.label} className="transform hover:scale-110 transition-transform duration-300">
              <div className="text-4xl font-bold text-blue-600">{s.value}+</div>
              <div className="text-gray-600 mt-2">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}