import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/data/translations';
import Image from 'next/image';
import heroAnimation from '../assets/hero-animation.gif';

export default function Hero() {
  const { language } = useLanguage();
  const t = translations[language];

  const scrollToServices = () => {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative h-screen overflow-hidden">
      {/* 배경 GIF */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroAnimation}
          alt="Background animation"
          fill
          priority
          style={{ objectFit: 'cover' }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>

      {/* 콘텐츠 */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center text-white p-4 max-w-4xl mx-auto">
          <motion.h1
            className="text-6xl font-extrabold mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {language === 'ko' ? 'AI와 AX의 시작, 브레인웍스에서' : (
              <>
                Brainworks<br />
                AI & AX Innovation Starts Here
              </>
            )}
          </motion.h1>
          
          <motion.p 
            className="text-xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {language === 'ko' 
              ? '당신의 비즈니스를 다음 단계로 이끄는 AI 딥테크 솔루션' 
              : 'AI DeepTech Solutions to Elevate Your Business'}
          </motion.p>

          <motion.div 
            className="space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={scrollToServices}
            >
              {language === 'ko' ? '서비스 보기' : 'View Services'}
            </Button>
          </motion.div>

          {/* 스크롤 다운 애니메이션 */}
          <motion.div 
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <svg 
              className="w-6 h-6 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 14l-7 7m0 0l-7-7m7 7V3" 
              />
            </svg>
          </motion.div>
        </div>
      </div>
    </section>
  );
}