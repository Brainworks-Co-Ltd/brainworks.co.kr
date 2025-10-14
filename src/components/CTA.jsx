import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';

export default function CTA() {
  const { language } = useLanguage();

  return (
    <section className="py-20 bg-blue-600 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">
          {language === 'ko' ? 'AX 혁신을 함께하세요' : 'Join Us in the AX Innovation Journey'}
        </h2>
        <p className="text-xl mb-8">
          {language === 'ko'
            ? '브레인웍스와 함께 AX를 준비하세요'
            : 'Prepare for the AX with Brainworks'}
        </p>
        <Link 
          href="/contact" 
          className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-300"
        >
          {language === 'ko' ? '문의하기' : 'Contact Us'}
        </Link>
      </div>
    </section>
  );
} 