import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/data/translations';

export default function Portfolio() {
  const { language } = useLanguage();
  const t = translations[language];

  const projects = [
    { id: 1, title: language === 'ko' ? 'AI 기반 의료 진단 시스템' : 'AI-based Medical Diagnosis System' },
    { id: 2, title: language === 'ko' ? '스마트 팩토리 솔루션' : 'Smart Factory Solution' },
    { id: 3, title: language === 'ko' ? '자율주행 로봇 플랫폼' : 'Autonomous Robot Platform' },
    { id: 4, title: language === 'ko' ? '빅데이터 분석 시스템' : 'Big Data Analysis System' },
    { id: 5, title: language === 'ko' ? '스마트 시티 솔루션' : 'Smart City Solution' },
    { id: 6, title: language === 'ko' ? '디지털 트윈 플랫폼' : 'Digital Twin Platform' }
  ];

  return (
    <section id="portfolio" className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">{language === 'ko' ? '포트폴리오' : 'Portfolio'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map(project => (
            <div 
              key={project.id} 
              className="group relative overflow-hidden rounded-lg cursor-pointer transform transition-all duration-300 hover:scale-105"
            >
              <img 
                src={`/projects/${project.id}.jpg`} 
                alt={project.title} 
                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <h3 className="text-white text-xl font-semibold text-center px-4">{project.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}