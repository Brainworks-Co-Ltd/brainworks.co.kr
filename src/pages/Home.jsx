import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/data/translations';
import Link from 'next/link';

export default function Home() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {language === 'ko' ? 'AI 솔루션의 미래를 선도합니다' : 'Leading the Future of AI Solutions'}
            </h1>
            <p className="text-xl mb-8">
              {language === 'ko' 
                ? '브레인웍스는 기업의 디지털 혁신을 위한 최첨단 AI 솔루션을 제공합니다.'
                : 'Brainworks provides cutting-edge AI solutions for enterprise digital transformation.'}
            </p>
            <div className="flex justify-center space-x-4">
              <Link 
                href="/about" 
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-300"
              >
                {language === 'ko' ? '회사소개' : 'About Us'}
              </Link>
              <Link 
                href="/contact" 
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-300"
              >
                {language === 'ko' ? '문의하기' : 'Contact Us'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {language === 'ko' ? '주요 서비스' : 'Our Services'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/services#consulting" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-4">
                {language === 'ko' ? 'AI 컨설팅' : 'AI Consulting'}
              </h3>
              <p className="text-gray-600 mb-4">
                {language === 'ko'
                  ? '기업의 비즈니스 목표에 맞는 맞춤형 AI 전략을 수립하고 구현을 지원합니다.'
                  : 'We develop and implement customized AI strategies aligned with business goals.'}
              </p>
              <span className="text-blue-600 hover:text-blue-800">
                {language === 'ko' ? '자세히 보기 →' : 'Learn More →'}
              </span>
            </Link>

            <Link href="/services#development" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-4">
                {language === 'ko' ? 'AI 솔루션 개발' : 'AI Solution Development'}
              </h3>
              <p className="text-gray-600 mb-4">
                {language === 'ko'
                  ? '최신 AI 기술을 활용하여 기업의 특수한 요구사항에 맞는 맞춤형 솔루션을 개발합니다.'
                  : 'We develop customized solutions using the latest AI technologies to meet specific business requirements.'}
              </p>
              <span className="text-blue-600 hover:text-blue-800">
                {language === 'ko' ? '자세히 보기 →' : 'Learn More →'}
              </span>
            </Link>

            <Link href="/services#education" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-4">
                {language === 'ko' ? 'AI 교육' : 'AI Education'}
              </h3>
              <p className="text-gray-600 mb-4">
                {language === 'ko'
                  ? '기업의 특성과 요구사항에 맞는 맞춤형 AI 교육 프로그램을 제공합니다.'
                  : 'We provide customized AI education programs tailored to company characteristics and requirements.'}
              </p>
              <span className="text-blue-600 hover:text-blue-800">
                {language === 'ko' ? '자세히 보기 →' : 'Learn More →'}
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            {language === 'ko' ? 'AI 혁신의 여정에 함께하세요' : 'Join Us in the AI Innovation Journey'}
          </h2>
          <p className="text-xl mb-8">
            {language === 'ko'
              ? '브레인웍스와 함께 미래를 준비하세요.'
              : 'Prepare for the future with Brainworks.'}
          </p>
          <Link 
            href="/contact" 
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-300"
          >
            {language === 'ko' ? '문의하기' : 'Contact Us'}
          </Link>
        </div>
      </section>
    </div>
  );
} 