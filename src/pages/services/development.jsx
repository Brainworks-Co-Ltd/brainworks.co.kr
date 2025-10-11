import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/data/translations';
import Link from 'next/link';
import Header from '@/components/Header';

export default function Development() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {language === 'ko' ? 'AI 솔루션 개발' : 'AI Solution Development'}
            </h1>
            <p className="text-xl mb-8">
              {language === 'ko' 
                ? '최신 AI 기술을 활용하여 기업의 특수한 요구사항에 맞는 맞춤형 솔루션을 개발합니다.'
                : 'We develop customized solutions using the latest AI technologies to meet specific business requirements.'}
            </p>
          </div>
        </div>
      </section>

      {/* Service Details */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-6">
                {language === 'ko' ? '서비스 개요' : 'Service Overview'}
              </h2>
              <p className="text-gray-700 mb-8">
                {language === 'ko'
                  ? '머신러닝, 딥러닝, 자연어 처리 등 다양한 AI 기술을 적용하여 기업의 특수한 요구사항에 맞는 맞춤형 솔루션을 개발합니다.'
                  : 'We develop customized solutions by applying various AI technologies including machine learning, deep learning, and natural language processing to meet specific business requirements.'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    {language === 'ko' ? '주요 서비스' : 'Key Services'}
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      {language === 'ko' ? 'AI 모델 개발' : 'AI Model Development'}
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      {language === 'ko' ? '시스템 통합' : 'System Integration'}
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      {language === 'ko' ? '클라우드 기반 솔루션' : 'Cloud-based Solutions'}
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    {language === 'ko' ? '기대 효과' : 'Expected Benefits'}
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      {language === 'ko' ? '업무 자동화' : 'Work Automation'}
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      {language === 'ko' ? '의사결정 지원' : 'Decision Support'}
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      {language === 'ko' ? '고객 경험 향상' : 'Enhanced Customer Experience'}
                    </li>
                  </ul>
                </div>
              </div>

              <div className="text-center">
                <Link 
                  href="/contact" 
                  className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300"
                >
                  {language === 'ko' ? '문의하기' : 'Contact Us'}
                </Link>
              </div>
            </div>
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