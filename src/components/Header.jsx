import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

const navItems = [
  { href: '/', label: { ko: '홈', en: 'Home' } },
  { href: '/about', label: { ko: '회사소개', en: 'About' } },
  { href: '/services', label: { ko: 'AI 솔루션', en: 'AI Solutions' } },
  { href: '/education', label: { ko: 'AI 전문교육', en: 'AI Academy' } },
  { href: '/consulting', label: { ko: 'AI 컨설팅', en: 'AI Consulting' } },
  { href: '/outbound', label: { ko: '글로벌 프로그램', en: 'Global Programs' } },
  { href: '/news', label: { ko: '소식', en: 'News' } },
  { href: '/contact', label: { ko: '문의하기', en: 'Contact' } },
];

export default function Header() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <header className="fixed top-0 z-50 w-full bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/images/회사로고.png"
              alt={language === 'ko' ? '브레인웍스 로고' : 'Brainworks logo'}
              className="h-10 w-auto"
            />
            <span className="sr-only">Brainworks</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-gray-600 transition-colors hover:text-blue-600"
              >
                {item.label[language]}
              </Link>
            ))}
          </nav>

          <button
            onClick={toggleLanguage}
            className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-600 transition-colors hover:border-blue-600 hover:text-blue-600"
          >
            {language === 'ko' ? 'EN' : 'KO'}
          </button>
        </div>
      </div>
    </header>
  );
}
