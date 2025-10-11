import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/data/translations';
import Link from 'next/link';
import Header from '@/components/Header';

export default function Consulting() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {language === 'ko' ? 'AI 컨설팅' : 'AI Consulting'}
            </h1>
            <p className="text-xl mb-8">
              {language === 'ko' 
                ? '기업의 비즈니스 목표에 맞는 맞춤형 AI 전략을 수립하고 구현을 지원합니다.'
                : 'We develop and implement customized AI strategies aligned with business goals.'}
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
                  ? '데이터 분석부터 AI 모델 개발, 시스템 구축까지 종합적인 컨설팅을 제공합니다. 기업의 특성과 요구사항에 맞는 최적의 AI 전략을 제시합니다.'
                  : 'We provide comprehensive consulting from data analysis to AI model development and system implementation. We present optimal AI strategies tailored to company characteristics and requirements.'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    {language === 'ko' ? '주요 서비스' : 'Key Services'}
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      {language === 'ko' ? 'AI 전략 수립' : 'AI Strategy Development'}
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      {language === 'ko' ? '데이터 분석 및 인사이트 도출' : 'Data Analysis and Insights'}
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      {language === 'ko' ? 'AI 솔루션 도입 컨설팅' : 'AI Solution Implementation Consulting'}
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
                      {language === 'ko' ? '비즈니스 프로세스 최적화' : 'Business Process Optimization'}
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      {language === 'ko' ? '운영 효율성 향상' : 'Improved Operational Efficiency'}
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      {language === 'ko' ? '비용 절감' : 'Cost Reduction'}
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